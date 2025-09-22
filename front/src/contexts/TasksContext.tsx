import React, {createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef,} from "react";
import {TASKS_PATH} from "../common/utils/web/const.ts";

// --- Types ---
export type TaskState = "queued" | "running" | "completed" | "failed" | "not_found" | "unknown";

export interface TaskItem {
    id: string;
    state: TaskState;
    error?: string;
    seconds?: number;          // payload initial
    createdAt: number;         // Date.now()
    updatedAt: number;         // maj à chaque poll
}

type State = {
    tasks: TaskItem[];
    loading: boolean;
    error?: string;
    panel: boolean;
};

type Action =
    | { type: "UPSERT"; payload: TaskItem }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_ERROR"; payload?: string }
    | { type: "REMOVE"; payload: { id: string } }
    | { type: "CLEAR_COMPLETED" }
    | { type: "SET_PANEL"; payload: boolean }

const initial: State = {tasks: [], loading: false, panel: false};

// --- Reducer ---
function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "UPSERT": {
            const exists = state.tasks.find(t => t.id === action.payload.id);
            const tasks = exists
                ? state.tasks.map(t => (t.id === action.payload.id ? action.payload : t))
                : [action.payload, ...state.tasks];
            return {...state, tasks};
        }
        case "REMOVE":
            return {...state, tasks: state.tasks.filter(t => t.id !== action.payload.id)};
        case "CLEAR_COMPLETED":
            return {...state, tasks: state.tasks.filter(t => t.state !== "completed")};
        case "SET_LOADING":
            return {...state, loading: action.payload};
        case "SET_ERROR":
            return {...state, error: action.payload};
        case "SET_PANEL":
            return {...state, panel: action.payload};
        default:
            return state;
    }
}

// --- Context ---
type Ctx = State & {
    startTask: (seconds?: number) => Promise<string | undefined>;
    removeTask: (id: string) => void;
    clearCompleted: () => void;
    getTask: (id: string) => TaskItem | undefined;

    setPanel: (open: boolean) => void;
};

const TasksContext = createContext<Ctx | null>(null);

// util : considère ces états comme terminaux
const isTerminal = (s: TaskState, err?: string) =>
    s === "completed" || s === "failed" || err === "not_found";

// --- Provider ---
export function TasksProvider({children}: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initial);

    // ---- Panel controls
    const setPanel = useCallback((open: boolean) => {
        dispatch({ type: "SET_PANEL", payload: open });
    }, []);


    // stocke les setInterval actifs par id
    const pollers = useRef<Map<string, number>>(new Map());

    // nettoyage global si le provider se démonte
    useEffect(() => {
        return () => {
            pollers.current.forEach((intId) => clearInterval(intId));
            pollers.current.clear();
        };
    }, []);

    async function pollStatus(id: string) {
        try {
            const res = await fetch(`http://localhost:3001/${TASKS_PATH}/status/${id}`);
            const data = await res.json() as { state?: TaskState; error?: string };
            const next: TaskItem | undefined = state.tasks.find(t => t.id === id)
                ? {
                    ...(state.tasks.find(t => t.id === id)!),
                    state: (data.state ?? "unknown"),
                    error: data.error,
                    updatedAt: Date.now(),
                }
                : undefined;

            if (next) dispatch({type: "UPSERT", payload: next});

            if (isTerminal(next?.state ?? "unknown", next?.error)) {
                const intId = pollers.current.get(id);
                if (intId) {
                    clearInterval(intId);
                    pollers.current.delete(id);
                }
            }
        } catch (e) {
            // en cas d’erreur réseau, on garde l’item mais on arrête le poll
            const intId = pollers.current.get(id);
            if (intId) {
                clearInterval(intId);
                pollers.current.delete(id);
            }
            dispatch({type: "SET_ERROR", payload: "Polling error"});
        }
    }

    async function startTask(seconds: number = 20): Promise<string | undefined> {
        dispatch({type: "SET_LOADING", payload: true});
        try {
            const res = await fetch(`http://localhost:3001/${TASKS_PATH}/enqueue`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({seconds}),
            });
            const {id} = await res.json() as { id: string };

            // crée/insère la tâche locale
            const now = Date.now();
            dispatch({
                type: "UPSERT",
                payload: {id, state: "queued", seconds, createdAt: now, updatedAt: now},
            });

            // lance un poll toutes les 1s
            const intId = window.setInterval(() => pollStatus(id), 1000);
            pollers.current.set(id, intId);

            // premier poll immédiat
            pollStatus(id);

            return id;
        } catch (e) {
            dispatch({type: "SET_ERROR", payload: "Task start failed"});
            return undefined;
        } finally {
            dispatch({type: "SET_LOADING", payload: false});
        }
    }

    function removeTask(id: string) {
        const intId = pollers.current.get(id);
        if (intId) {
            clearInterval(intId);
            pollers.current.delete(id);
        }
        dispatch({type: "REMOVE", payload: {id}});
    }

    function clearCompleted() {
        // stoppe aussi les pollers éventuels (sécurité)
        state.tasks
            .filter(t => t.state === "completed")
            .forEach(t => {
                const intId = pollers.current.get(t.id);
                if (intId) {
                    clearInterval(intId);
                    pollers.current.delete(t.id);
                }
            });
        dispatch({type: "CLEAR_COMPLETED"});
    }

    function getTask(id: string) {
        return state.tasks.find(t => t.id === id);
    }

    const value: Ctx = useMemo(
        () => ({
            ...state,
            startTask,
            removeTask,
            clearCompleted,
            getTask,
            setPanel,
        }), [state, startTask, removeTask, clearCompleted, getTask, setPanel]);

    return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

// --- Hook ---
export function useTasks() {
    const ctx = useContext(TasksContext);
    if (!ctx) throw new Error("useTasks must be used within <TasksProvider>");
    return ctx;
}



