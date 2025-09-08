export const LINKS = {
    DASHBOARD: "http://82.165.92.40:3000/",
    SERVERS: "/servers",
    ADD_SERVERS: "/add-servers",
    SHOP: "http://82.165.46.201/",
    CONFIGURATOR: "http://82.165.44.233/",
} as const;

export type LinkKey = keyof typeof LINKS;
