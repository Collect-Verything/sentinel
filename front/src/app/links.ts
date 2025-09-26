export const LINKS = {
    DASHBOARD: "/",
    MONITORING: "http://82.165.92.40:3000/",
    SERVERS: "/servers",
    SERVERS_CONFIG: "/servers-config",
    ADD_SERVERS: "/add-servers",
    SHOP: "http://82.165.46.201/",
    CONFIGURATOR: "http://82.165.44.233/",
} as const;

export type LinkKey = keyof typeof LINKS;
