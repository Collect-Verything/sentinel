import React, {createContext, useCallback, useContext, useMemo, useReducer,} from "react";
import type {ServerInterface} from "../common/types/backend";
import {apiDelete, apiGet} from "../common/utils/web";
import {SERVERS_PATH} from "../common/utils/web/const";
import {SERVER_STATUS} from "../common/enums/server-status";
import type {GridRowId} from "@mui/x-data-grid";
import type {ServerAction, ServerStateType} from "./types.ts";


const initial: ServerStateType = {
    byStatus: {},
    currentStatus: null,
    loading: false,
    mutating: false,
    error: undefined,
};

function reducer(state: ServerStateType, action: ServerAction): ServerStateType {
    switch (action.type) {
        case "SET_LOADING":
            return {...state, loading: action.payload};
        case "SET_ERROR":
            return {...state, error: action.payload};
        case "SET_MUTATING":
            return {...state, mutating: action.payload};
        case "SET_CURRENT_STATUS":
            return {...state, currentStatus: action.payload};
        case "SET_SERVERS":
            return {...state, byStatus: {...state.byStatus, [action.payload.status]: action.payload.servers},};
        default:
            return state;
    }
}

type Ctx = {
    servers: ServerInterface[];
    currentStatus: string | null;
    loading: boolean;
    error?: string;

    fetchServers: (status: SERVER_STATUS | string) => Promise<ServerInterface[]>;
    deleteServers: (ids: GridRowId[] | number[]) => Promise<void>;
    getServers: (status: SERVER_STATUS | string) => ServerInterface[];
};

const ServersContext = createContext<Ctx | null>(null);

export function ServersProvider({children}: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initial);

    const fetchServers = useCallback(
        async (status: SERVER_STATUS | string): Promise<ServerInterface[]> => {
            const key = String(status);
            dispatch({type: "SET_CURRENT_STATUS", payload: key});
            dispatch({type: "SET_LOADING", payload: true});
            try {
                const res = (await apiGet(`${SERVERS_PATH}/by-config/${key}`)) ?? [];
                dispatch({type: "SET_SERVERS", payload: {status: key, servers: res}});
                return res;
            } catch {
                dispatch({type: "SET_ERROR", payload: "Failed to fetch servers"});
                return [];
            } finally {
                dispatch({type: "SET_LOADING", payload: false});
            }
        },
        []
    );

    const deleteServers = useCallback(async (ids: GridRowId[] | number[]) => {
        dispatch({type: "SET_MUTATING", payload: true});

        const key = state.currentStatus;
        const prev = key ? state.byStatus[key] ?? [] : [];

        if (key) {
            const idsSet = new Set<number>(ids as number[]);
            const next = prev.filter(s => !idsSet.has(s.id));
            dispatch({type: "SET_SERVERS", payload: {status: key, servers: next}});
        }

        try {
            await apiDelete(`${SERVERS_PATH}`, {ids});
        } catch {
            if (key) {
                dispatch({type: "SET_SERVERS", payload: {status: key, servers: prev}});
            }
            dispatch({type: "SET_ERROR", payload: "Failed to delete servers"});
        } finally {
            dispatch({type: "SET_MUTATING", payload: false});
        }
    }, [state.currentStatus, state.byStatus]);


    const getServers = useCallback(
        (status: SERVER_STATUS | string) => state.byStatus[String(status)] ?? [],
        [state.byStatus]
    );

    const servers = useMemo(
        () => (state.currentStatus ? state.byStatus[state.currentStatus] ?? [] : []),
        [state.byStatus, state.currentStatus]
    );

    const value: Ctx = useMemo(
        () => ({
            servers,
            currentStatus: state.currentStatus,
            loading: state.loading,
            error: state.error,
            fetchServers,
            deleteServers,
            getServers,
        }),
        [servers, state.currentStatus, state.loading, state.error, fetchServers, deleteServers, getServers]
    );

    return <ServersContext.Provider value={value}>{children}</ServersContext.Provider>;
}

export function useServers() {
    const ctx = useContext(ServersContext);
    if (!ctx) throw new Error("useServers must be used within <ServersProvider>");
    return ctx;
}
