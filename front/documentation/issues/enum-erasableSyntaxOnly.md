## 🚨 Issue : Incompatibilité entre `enum` et `erasableSyntaxOnly`

### 📌 Problématique

En essayant de déclarer un `enum` TypeScript pour centraliser les liens de l’application, une erreur de compilation apparaît :

```ts
export enum LINKS {
  DASHBOARD = "http://82.165.92.40:3000/",
}
```

Erreur :

```
TS1294: This syntax is not allowed when erasableSyntaxOnly is enabled.
```

---

### 🔍 Raison

Dans le `tsconfig.json`, l’option suivante est activée :

```json
"erasableSyntaxOnly": true
```

Cette règle signifie que **seules les syntaxes TypeScript qui peuvent être effacées lors de la compilation** sont autorisées.

* ✅ Autorisé : `type`, `interface`, `as const`, `generics` → ils disparaissent dans le JS généré.
* ❌ Interdit : `enum`, `namespace`, `decorators` → ils produisent du vrai code JavaScript, donc incompatibles.

En d’autres termes : **les `enum` ne sont pas effaçables** → d’où l’erreur.

---

### 📏 La règle

* `erasableSyntaxOnly` est généralement activé pour garder un code **purement effaçable côté TS**, sans artefacts dans le build JavaScript.
* Cela permet d’éviter de mélanger **types statiques** et **constructs runtime**.
* Les `enum` étant des objets réels au runtime, ils violent cette règle.

---

### ✅ Solution recommandée

👉 Utiliser un objet figé (`as const`) à la place d’un `enum`.

```ts
export const LINKS = {
  DASHBOARD: "http://82.165.92.40:3000/",
  SERVERS: "/servers",
  ADD_SERVERS: "/add-servers",
  SHOP: "http://82.165.46.201/",
  CONFIGURATOR: "http://82.165.44.233/",
} as const;

export type LinkKey = keyof typeof LINKS;

// Exemple d’utilisation
console.log(LINKS.DASHBOARD); // "http://82.165.92.40:3000/"
```

✔️ Avantages :

* Même lisibilité qu’un `enum` (`LINKS.DASHBOARD`).
* Compatible avec `erasableSyntaxOnly`.
* Typage strict grâce à `as const`.
* Pratique à étendre.

---

### ❌ Alternative (non recommandée)

Si l’utilisation de `enum` est jugée indispensable, il faut **désactiver la règle** dans `tsconfig.json` :

```json
"erasableSyntaxOnly": false
```

⚠️ Mais cela annule la garantie que tout le code TS est effaçable et va à l’encontre de la philosophie du projet.

---

### 🎯 Conclusion

* L’erreur vient du fait que `enum` génère du vrai JS et ne respecte pas `erasableSyntaxOnly`.
* La bonne pratique est de remplacer les `enum` par des **objets constants** (`as const`).
* Cela permet de garder la sécurité de typage et la compatibilité avec la configuration actuelle du projet.

---

👉 Proposition : refactoriser toutes les utilisations d’`enum` dans ce projet vers des objets `as const`.
