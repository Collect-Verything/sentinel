import React, {createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef,} from "react";
import {TASKS_PATH} from "../common/utils/web/const.ts";
import type {Action, State, TaskItem, TaskState} from "./types.ts";

const initial: State = {tasks: [], loading: false, panel: false};

// Utils
const isTerminal = (s?: TaskState, err?: string) =>
    s === "completed" || s === "failed" || err === "not_found";

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
        case "PATCH": {
            const idx = state.tasks.findIndex(t => t.id === action.payload.id);
            if (idx === -1) return state;
            const next = {...state.tasks[idx], ...action.payload.patch};
            const tasks = [...state.tasks];
            tasks[idx] = next;
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

// --- Provider ---
export function TasksProvider({children}: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initial);

    // ---- Panel controls => API unique
    const setPanel = useCallback((open: boolean) => {
        dispatch({type: "SET_PANEL", payload: open});
    }, []);

    // stock setInterval actifs par id
    const pollers = useRef<Map<string, number>>(new Map());
    const stopPoller = (id: string) => {
        const intId = pollers.current.get(id);
        if (intId) {
            clearInterval(intId);
            pollers.current.delete(id);
        }
    };

    // ref vers liste courante pour éviter closures obsoletes
    const tasksRef = useRef<TaskItem[]>([]);
    useEffect(() => {
        tasksRef.current = state.tasks;
    }, [state.tasks]);

    // cleab global si provider démonte
    useEffect(() => {
        return () => {
            pollers.current.forEach((intId) => clearInterval(intId));
            pollers.current.clear();
        };
    }, []);

    // --- Poll status (ciao si deja terminé)
    const pollStatus = useCallback(async (id: string) => {
        const current = tasksRef.current.find(t => t.id === id);
        if (!current) return;

        if (isTerminal(current.state, current.error)) {
            stopPoller(id);
            return;
        }

        try {
            const res = await fetch(`http://localhost:3001/${TASKS_PATH}/status/${id}`);
            const data = await res.json() as { state?: TaskState; error?: string };

            // merge minimal sans lire state
            dispatch({
                type: "PATCH",
                payload: {
                    id,
                    patch: {
                        state: data.state ?? current.state,
                        error: data.error,
                        updatedAt: Date.now(),
                    },
                },
            });

            if (isTerminal(data.state, data.error)) {
                stopPoller(id);
            }
        } catch (e) {
            stopPoller(id);
            dispatch({type: "SET_ERROR", payload: "Polling error"});
        }
    }, [TASKS_PATH]);

    async function startTask(seconds: number = 20): Promise<string | undefined> {
        dispatch({type: "SET_LOADING", payload: true});
        try {
            const res = await fetch(`http://localhost:3001/${TASKS_PATH}/enqueue`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({seconds}),
            });
            const {id} = (await res.json()) as { id: string };

            // crée/insere tâche locale
            const now = Date.now();
            dispatch({
                type: "UPSERT",
                payload: {id, state: "queued", seconds, createdAt: now, updatedAt: now},
            });

            // (A voire ...) possibilité d'ouvrir panel quand tache start
            // setPanel(true);

            // lance poll tout les 1s
            const intId = window.setInterval(() => pollStatus(id), 1000);
            pollers.current.set(id, intId);

            // premier poll direct
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
        stopPoller(id);
        dispatch({type: "REMOVE", payload: {id}});
    }

    function clearCompleted() {
        // stopper pollers éventuel par sécu
        state.tasks
            .filter(t => t.state === "completed")
            .forEach(t => stopPoller(t.id));
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
        }),
        [state, startTask, removeTask, clearCompleted, getTask, setPanel]
    );

    return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

// --- Hook ---
export function useTasks() {
    const ctx = useContext(TasksContext);
    if (!ctx) throw new Error("useTasks must be used within <TasksProvider>");
    return ctx;
}
