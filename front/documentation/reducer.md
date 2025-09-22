# 1) Pourquoi un Context + Reducer ?

* **Context** partage un état et des fonctions **à travers l’arbre** sans prop drilling.
* **Reducer** centralise la **logique métier** (un “mini Redux”) :

    * évolutif (on ajoute des actions),
    * testable (fonction pure),
    * prévisible (immutabilité, pas d’effets de bord).

> Règle d’or : **Context** = *portée*, **Reducer** = *logique d’état*.

---

# 2) Structure d’un store Context “propre”

Tu auras typiquement 4 éléments :

1. **Types** — `State`, `Action`, modèles métier.
2. **Reducer** — `function reducer(state, action): State`.
3. **Provider** — qui crée l’état, expose l’API publique, et encapsule les effets (polling, timers, fetch).
4. **Hook** — `useXxx()` pour consommer le contexte (avec garde d’utilisation).

Je te donne un squelette générique (copie-colle → renomme `Xxx`).

```tsx
// src/contexts/XxxContext.tsx
import React, {
  createContext, useContext, useReducer, useMemo, useCallback, useRef, useEffect,
} from "react";

/* ============================
   1) Types
============================ */

export type XxxStatus = "idle" | "loading" | "ready" | "error";

export interface XxxItem {
  id: string;
  label: string;
  createdAt: number;
}

type State = {
  items: XxxItem[];
  status: XxxStatus;
  error?: string;
};

type Action =
  | { type: "ADD"; payload: XxxItem }
  | { type: "REMOVE"; payload: { id: string } }
  | { type: "SET_STATUS"; payload: XxxStatus }
  | { type: "SET_ERROR"; payload?: string };

/* ============================
   2) Reducer (pur, immuable)
============================ */

const initial: State = { items: [], status: "idle" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD":
      return { ...state, items: [action.payload, ...state.items] };
    case "REMOVE":
      return { ...state, items: state.items.filter(i => i.id !== action.payload.id) };
    case "SET_STATUS":
      return { ...state, status: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

/* ============================
   3) Contexte + API publique
============================ */

type Ctx = State & {
  add: (item: XxxItem) => void;
  remove: (id: string) => void;
  refresh: () => Promise<void>;
};

const XxxContext = createContext<Ctx | null>(null);

/* ============================
   4) Provider
============================ */

export function XxxProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  const add = useCallback((item: XxxItem) => {
    dispatch({ type: "ADD", payload: item });
  }, []);

  const remove = useCallback((id: string) => {
    dispatch({ type: "REMOVE", payload: { id } });
  }, []);

  const refresh = useCallback(async () => {
    dispatch({ type: "SET_STATUS", payload: "loading" });
    try {
      // Simule une API
      await new Promise(r => setTimeout(r, 300));
      // dispatch(...) selon données
      dispatch({ type: "SET_STATUS", payload: "ready" });
      dispatch({ type: "SET_ERROR", payload: undefined });
    } catch (e) {
      dispatch({ type: "SET_STATUS", payload: "error" });
      dispatch({ type: "SET_ERROR", payload: "refresh failed" });
    }
  }, []);

  const value: Ctx = useMemo(() => ({
    ...state,
    add,
    remove,
    refresh,
  }), [state, add, remove, refresh]);

  return <XxxContext.Provider value={value}>{children}</XxxContext.Provider>;
}

/* ============================
   5) Hook d'accès
============================ */

export function useXxx() {
  const ctx = useContext(XxxContext);
  if (!ctx) throw new Error("useXxx must be used within <XxxProvider>");
  return ctx;
}
```

---

# 3) Le **Reducer** : switch, unions discriminantes, immutabilité

## 3.1 Pourquoi un `switch(action.type)` ?

* Simple, rapide, **lisible**.
* En TypeScript, si tu utilises des **unions discriminantes**, tu obtiens l’auto-complétion et la sécurité de types.

```ts
type Action =
  | { type: "ADD"; payload: XxxItem }
  | { type: "REMOVE"; payload: { id: string } };
```

Ici, `type` est la **discriminant property**. Dans chaque branche du `switch`, TS sait exactement quel `payload` existe.

## 3.2 Immutabilité

Toujours **recréer** tableaux/objets :

* ✅ `state.items.filter(...)`, `[action.payload, ...state.items]`, `{ ...state, prop: next }`
* ❌ `state.items.push(...)`, `state.items[0] =`

Pourquoi ? React se base sur la **référence** pour détecter les changements → immutabilité garantit le rerender.

## 3.3 PATCH vs UPSERT

* **UPSERT** : tu remplaces l’item entier (simple quand tu reçois un “snapshot” serveur).
* **PATCH** : tu merges seulement quelques champs (utile quand tu reçois des “événements” partiels).

Exemple PATCH :

```ts
type Action =
  | { type: "PATCH"; payload: { id: string; patch: Partial<XxxItem> } };

case "PATCH": {
  const idx = state.items.findIndex(i => i.id === action.payload.id);
  if (idx === -1) return state;
  const next = { ...state.items[idx], ...action.payload.patch };
  const items = [...state.items];
  items[idx] = next;
  return { ...state, items };
}
```

---

# 4) `createContext<Ctx | null>(null)` — pourquoi ce typage ?

```ts
const TasksContext = createContext<Ctx | null>(null);
```

* Au montage, **avant** que le Provider ne passe la vraie valeur, le contexte vaut `null`.
* Du coup, le hook doit **vérifier** que tu es bien sous le Provider :

```ts
export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within <TasksProvider>");
  return ctx;
}
```

Avantage : tu détectes **immédiatement** un oubli de Provider (plutôt que de débugger un `undefined` silencieux).

---

# 5) `useCallback`, `useMemo`, `useRef` — rôles & pièges

## 5.1 `useCallback`

* **Stabilise la référence** d’une fonction entre rendus.
* Évite de re-rendre les consommateurs inutiles quand la fonction ne change pas.

Ex. :

```ts
const setPanel = useCallback((open: boolean) => {
  dispatch({ type: "SET_PANEL", payload: open });
}, []);
```

Sans `useCallback`, la fonction serait recréée à chaque render → `value` change → tous les composants qui consomment le contexte rerendraient.

## 5.2 `useMemo`

* **Mémorise** un objet/valeur dérivée **coûteuse** ou **source de rerender** (ex. `value` du Provider).
* Ici, `value` ne change que si `state` ou une méthode change.

```ts
const value: Ctx = useMemo(() => ({
  ...state, startTask, removeTask, // ...
}), [state, startTask, removeTask]);
```

## 5.3 `useRef`

* Stocke une **référence mutable** qui **ne déclenche pas** de rerender.
* Idéal pour :

    * Identifiants `setInterval` (**pollers**),
    * “Snapshots” d’état (éviter les **stale closures**),
    * Accès DOM (`inputRef`…).

Ex. Map de pollers par id :

```ts
const pollers = useRef<Map<string, number>>(new Map());
const stopPoller = (id: string) => {
  const intId = pollers.current.get(id);
  if (intId) clearInterval(intId);
  pollers.current.delete(id);
};
```

---

# 6) Pattern “événements” (alternative simple au WebSocket)

Tu as un back qui publie l’état des tâches. Sans WebSocket, on peut **poller** proprement :

## 6.1 Démarrage

* **Enqueue** côté serveur,
* Ajoute la tâche localement (`UPSERT`),
* Lance un **poll** (intervalle) par tâche.

```ts
const intId = window.setInterval(() => pollStatus(id), 1000);
pollers.current.set(id, intId);
pollStatus(id); // premier poll immédiat
```

## 6.2 Polling robuste

* **Pas de stale closure** : lis une **ref** à jour (`tasksRef.current`).
* **Court-circuit** si la tâche est déjà **terminale** (pas d’appels inutiles).
* **Arrêt** du poll quand `completed/failed/not_found`.

```ts
const tasksRef = useRef<TaskItem[]>([]);
useEffect(() => { tasksRef.current = state.tasks; }, [state.tasks]);

const pollStatus = useCallback(async (id: string) => {
  const current = tasksRef.current.find(t => t.id === id);
  if (!current) return;
  if (isTerminal(current.state, current.error)) { stopPoller(id); return; }

  try {
    const res = await fetch(`/api/status/${id}`);
    const data = await res.json();
    dispatch({ type: "PATCH", payload: { id, patch: {
      state: data.state ?? current.state,
      error: data.error,
      updatedAt: Date.now(),
    }}});
    if (isTerminal(data.state, data.error)) stopPoller(id);
  } catch {
    stopPoller(id);
    dispatch({ type: "SET_ERROR", payload: "Polling error" });
  }
}, []);
```

### Bonus robustesse “production”

* **Backoff exponentiel** si le serveur rate (1s → 2s → 4s…).
* **`AbortController`** pour annuler un fetch si le composant se démonte.
* **`visibilitychange`** (pause le poll quand l’onglet est caché, reprends quand visible).

---

# 7) `value` mémoïsé + Provider : ce qui se passe

```ts
const value: Ctx = useMemo(
  () => ({
    ...state,
    startTask,
    removeTask,
    clearCompleted,
    getTask,
    setPanel,
  }),
  [state, startTask, removeTask, clearCompleted, getTask, setPanel]
);

return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
```

* On **compose** l’API publique du store.
* `useMemo` évite de diffuser une **nouvelle référence** à chaque render si rien n’a changé.
* Tous les composants qui font `const ctx = useTasks()` ne **rerenderont que quand c’est utile**.

---

# 8) Le Hook d’accès : “contrat” et DX

```ts
export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within <TasksProvider>");
  return ctx;
}
```

* Great DX : dans n’importe quel composant, `const { tasks, startTask } = useTasks()`.
* La **garde** (`if (!ctx) throw`) évite les bugs silencieux si tu oublies le Provider.

---

# 9) Où monter le Provider ?

**Au plus haut niveau stable** (souvent `main.tsx` autour du `<RouterProvider />`).
Objectif : éviter les **remounts** lors des navigations, qui réinitialiseraient l’état/polling.

```tsx
ReactDOM.createRoot(...).render(
  <React.StrictMode>
    <TasksProvider>
      <RouterProvider router={router} />
    </TasksProvider>
  </React.StrictMode>
);
```

---

# 10) Exemples d’utilisation

## 10.1 Bouton global (ouvrir/fermer un panneau)

```tsx
function TaskToggle() {
  const { panel, setPanel } = useTasks();
  return (
    <button type="button" onClick={() => setPanel(!panel)}>
      {panel ? "Fermer" : "Ouvrir"} tâches
    </button>
  );
}
```

## 10.2 Page A — démarrer une tâche

```tsx
function StartTask() {
  const { startTask } = useTasks();
  return <button onClick={() => startTask(20)}>Lancer (20s)</button>;
}
```

## 10.3 Page B — lister et suivre

```tsx
function TaskList() {
  const { tasks, removeTask, clearCompleted } = useTasks();
  return (
    <>
      <ul>
        {tasks.map(t => (
          <li key={t.id}>
            #{t.id} — {t.state} {t.error && `(erreur: ${t.error})`}
            <button onClick={() => removeTask(t.id)}>retirer</button>
          </li>
        ))}
      </ul>
      <button onClick={clearCompleted}>Nettoyer terminées</button>
    </>
  );
}
```

---

# 11) Tests & débogage

* **Reducer** : teste-le en isolation (table-driven tests).
* **Provider** : monte un composant de test sous Provider, simule `startTask`, vérifie l’état.
* Ajoute des **logs** ciblés (montage Provider, startTask, stopPoller).

---

# 12) Variantes & extensions

* **Context “léger”** (juste `useState`) si la logique est triviale.
* **Context Selector** (libs dédiées) pour réduire les rerenders fins.
* **Zustand** si tu veux un store global minimal sans boilerplate.
* **TanStack Query** si tes données viennent majoritairement du serveur (cache + invalidation + refetch).

---

# 13) Pièges courants (checklist)

* ⚠️ **Provider** monté dans un layout qui se remonte → état perdu.
* ⚠️ **Mutation** d’objets/tableaux dans le reducer → pas de rerender.
* ⚠️ **Fonctions non mémoïsées** → `value` change à chaque render → rerenders en cascade.
* ⚠️ **Stale closures** dans les `setInterval`/promesses → lis un **ref** ou **dispatch** sans lire `state` local.
* ⚠️ `window.location.reload()` → tu perds le store (préférer refetch/invalidate ou navigation avec `state`).

---

## TL;DR — ton kit “starter” pour recréer un Context propre

1. **Types** (`State`, `Action`, modèles).
2. **Reducer** immuable, `switch(action.type)` + (optionnel) `PATCH`.
3. **Provider** :

    * `useReducer` + effets (fetch/poll/intervals),
    * API avec `useCallback`,
    * `value` avec `useMemo`,
    * `createContext<Ctx | null>(null)` + `<Provider value={value}>`.
4. **Hook** `useXxx()` avec garde d’utilisation.
5. **Monter au root** autour du Router.
6. Pour les **événements** (sans WS) : **pollers** (Map id → interval), **isTerminal**, **stopPoller**, **tasksRef** contre stale closures.
