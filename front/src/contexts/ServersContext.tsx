import React, {
    createContext,
    useContext,
    useMemo,
    useReducer,
    useCallback,
} from "react";
import type { ServerInterface } from "../common/types/backend";
import { apiGet } from "../common/utils/web";
import { SERVERS_PATH } from "../common/utils/web/const";
import { SERVER_STATUS } from "../common/enums/server-status";
import type {ServerAction, ServerStateType} from "./types.ts";


const initial: ServerStateType = { byStatus: {}, loading: false };

function reducer(state: ServerStateType, action: ServerAction): ServerStateType {
    switch (action.type) {
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        case "SET_ERROR":
            return { ...state, error: action.payload };
        case "SET_SERVERS":
            return {
                ...state,
                byStatus: { ...state.byStatus, [action.payload.status]: action.payload.servers },
            };
        default:
            return state;
    }
}

// ---- Context API
type Ctx = ServerStateType & {
    fetchServers: (status: SERVER_STATUS | string) => Promise<ServerInterface[]>;
    getServers: (status: SERVER_STATUS | string) => ServerInterface[];
};

const ServersContext = createContext<Ctx | null>(null);

// ---- Provider
export function ServersProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initial);

    const fetchServers = useCallback(
        async (status: SERVER_STATUS | string): Promise<ServerInterface[]> => {
            dispatch({ type: "SET_LOADING", payload: true });
            try {
                const res = (await apiGet(
                    `${SERVERS_PATH}/by-config/${status}`
                )) ?? [];
                dispatch({ type: "SET_SERVERS", payload: { status: String(status), servers: res } });
                return res;
            } catch (e) {
                dispatch({ type: "SET_ERROR", payload: "Failed to fetch servers" });
                return [];
            } finally {
                dispatch({ type: "SET_LOADING", payload: false });
            }
        },
        []
    );

    const getServers = useCallback(
        (status: SERVER_STATUS | string) => state.byStatus[String(status)] ?? [],
        [state.byStatus]
    );

    const value: Ctx = useMemo(
        () => ({
            ...state,
            fetchServers,
            getServers,
        }),
        [state, fetchServers, getServers]
    );

    return <ServersContext.Provider value={value}>{children}</ServersContext.Provider>;
}

// ---- Hook
export function useServers() {
    const ctx = useContext(ServersContext);
    if (!ctx) throw new Error("useServers must be used within <ServersProvider>");
    return ctx;
}
