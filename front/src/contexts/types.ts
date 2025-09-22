
export type TaskState = "queued" | "running" | "completed" | "failed" | "not_found" | "unknown";

export interface TaskItem {
    id: string;
    state: TaskState;
    error?: string;
    seconds?: number;
    createdAt: number;
    updatedAt: number;
}

export type State = {
    tasks: TaskItem[];
    loading: boolean;
    error?: string;
    panel: boolean;
};

export type Action =
    | { type: "UPSERT"; payload: TaskItem }
    | { type: "PATCH"; payload: { id: string; patch: Partial<TaskItem> } }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_ERROR"; payload?: string }
    | { type: "REMOVE"; payload: { id: string } }
    | { type: "CLEAR_COMPLETED" }
    | { type: "SET_PANEL"; payload: boolean };
