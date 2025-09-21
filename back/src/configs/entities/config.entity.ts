import {Server} from "node:net";

export class Config {
    id: number;
    name: string;
    editorFullname: string
    playbookPath: string
    variablesJson: string
    servers: Server[]
    createdAt: string
    updatedAt: string
}

