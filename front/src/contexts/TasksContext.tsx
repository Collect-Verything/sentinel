import React, {createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef,} from "react";
import {API_BASE, TASKS_PATH} from "../common/utils/web/const.ts";
import type {TaskAction, TaskStateType, TaskItem, TaskState} from "./types.ts";

const initial: TaskStateType = {tasks: [], loading: false, panel: false};

// Utils
const isTerminal = (s?: TaskState, err?: string) =>
    s === "completed" || s === "failed" || err === "not_found";

// --- Reducer ---
function reducer(state: TaskStateType, action: TaskAction): TaskStateType {
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
type Ctx = TaskStateType & {
    startTask: (idConfig: number, listIdServer?: number[]) => Promise<string | undefined>;
    removeTask: (id: string) => void;
    clearCompleted: () => void;
    getTask: (id: string) => TaskItem | undefined;
    setPanel: (open: boolean) => void;

    activeServerIds: Set<number>;
    isServerInProgress: (serverId: number) => boolean;
};

const TasksContext = createContext<Ctx | null>(null);

// --- Provider ---
export function TasksProvider({children}: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initial);

    const setPanel = useCallback((open: boolean) => {
        dispatch({type: "SET_PANEL", payload: open});
    }, []);

    const pollers = useRef<Map<string, number>>(new Map());
    const stopPoller = (id: string) => {
        const intId = pollers.current.get(id);
        if (intId) {
            clearInterval(intId);
            pollers.current.delete(id);
        }
    };

    const tasksRef = useRef<TaskItem[]>([]);
    useEffect(() => {
        tasksRef.current = state.tasks;
    }, [state.tasks]);

    useEffect(() => {
        return () => {
            pollers.current.forEach((intId) => clearInterval(intId));
            pollers.current.clear();
        };
    }, []);

    const pollStatus = useCallback(async (id: string) => {
        const current = tasksRef.current.find(t => t.id === id);
        if (!current) return;

        if (isTerminal(current.state, current.error)) {
            stopPoller(id);
            return;
        }

        try {
            const res = await fetch(`http://${API_BASE}:3001/${TASKS_PATH}/status/${id}`);
            const data = await res.json() as {
                state?: TaskState; error?: string;
                progress?: number | { step: number; total: number; info?: string };
            };

            dispatch({
                type: "PATCH",
                payload: {
                    id,
                    patch: {
                        state: data.state ?? current.state,
                        error: data.error,
                        progress: data.progress,
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

    const startTask = React.useCallback(
        async (idConfig: number, listIdServer: number[] = []): Promise<string | undefined> => {
            dispatch({type: "SET_LOADING", payload: true});
            try {
                const res = await fetch(`http://${API_BASE}:3001/${TASKS_PATH}/enqueue`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({idConfig, listIdServer}),
                });
                const {id} = (await res.json()) as { id: string };

                const now = Date.now();
                dispatch({
                    type: "UPSERT",
                    payload: {id, state: "queued", listIdServer, createdAt: now, updatedAt: now},
                });

                const intId = window.setInterval(() => pollStatus(id), 1000);
                pollers.current.set(id, intId);
                pollStatus(id);

                return id;
            } catch {
                dispatch({type: "SET_ERROR", payload: "Task start failed"});
                return undefined;
            } finally {
                dispatch({type: "SET_LOADING", payload: false});
            }
        },
        [pollStatus]
    );

    function removeTask(id: string) {
        stopPoller(id);
        dispatch({type: "REMOVE", payload: {id}});
    }

    function clearCompleted() {
        state.tasks
            .filter(t => t.state === "completed")
            .forEach(t => stopPoller(t.id));
        dispatch({type: "CLEAR_COMPLETED"});
    }

    function getTask(id: string) {
        return state.tasks.find(t => t.id === id);
    }

    const activeServerIds = useMemo(() => {
        const ids = new Set<number>();
        for (const t of state.tasks) {
            if (!isTerminal(t.state, t.error)) {
                (t.listIdServer ?? []).forEach((id) => ids.add(id));
            }
        }
        return ids;
    }, [state.tasks]);

    const isServerInProgress = useCallback(
        (serverId: number) => activeServerIds.has(serverId),
        [activeServerIds]
    );

    const value: Ctx = useMemo(
        () => ({
            ...state,
            startTask,
            removeTask,
            clearCompleted,
            getTask,
            setPanel,
            activeServerIds,
            isServerInProgress,
        }),
        [state, startTask, removeTask, clearCompleted, getTask, setPanel, activeServerIds, isServerInProgress]
    );

    return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

// --- Hook ---
export function useTasks() {
    const ctx = useContext(TasksContext);
    if (!ctx) throw new Error("useTasks must be used within <TasksProvider>");
    return ctx;
}
