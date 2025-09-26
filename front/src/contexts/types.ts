// TASK
import type {ServerInterface} from "../common/types/backend";

export type TaskState = "queued" | "running" | "completed" | "failed" | "not_found" | "unknown";

export interface TaskItem {
    id: string;
    state: TaskState;
    listIdServer: number[];
    error?: string;
    createdAt: number;
    updatedAt: number;
    progress?: number | { step: number; total: number; info?: string };
}

export type TaskStateType = {
    tasks: TaskItem[];
    loading: boolean;
    error?: string;
    panel: boolean;
};

export type TaskAction =
    | { type: "UPSERT"; payload: TaskItem }
    | { type: "PATCH"; payload: { id: string; patch: Partial<TaskItem> } }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_ERROR"; payload?: string }
    | { type: "REMOVE"; payload: { id: string } }
    | { type: "CLEAR_COMPLETED" }
    | { type: "SET_PANEL"; payload: boolean };

// SERVER

export type ServerStateType = {
    servers: ServerInterface[];
    loading: boolean;
    error?: string;
    panel: boolean;
};