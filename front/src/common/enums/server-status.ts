export const SERVER_STATUS = {
    PENDING: "PENDING",
    CONFIGURING: "CONFIGURING",
    CONFIGURED: "CONFIGURED",
    ERROR: "ERROR",
} as const;

export type SERVER_STATUS = keyof typeof SERVER_STATUS;