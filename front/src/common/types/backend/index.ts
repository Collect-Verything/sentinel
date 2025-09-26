export interface ConfigInterface {
    id: number
    name: string
    editorFullname: string
    playbookPath: string
    variablesJson: string
    servers?: ServerInterface[]
    createdAt: string
    updatedAt: string
}

export enum ServerStatus {
    PENDING = 'PENDING',
    CONFIGURED = 'CONFIGURED',
    ERROR = 'ERROR',
    CONFIGURING = 'CONFIGURING',
}

export interface ServerInterface {
    id: number
    serverIp: string
    status: ServerStatus
    isSsl: boolean | string | undefined
    cores: number
    ramMb: number
    storageGb: number
    provider: string
    ownerClientId: number
    batchId: number
    sshUser: string
    sshPort: number
    sshAuth: "PASSWORD" | "KEY"
    sshPassword: string
    health: "OK" | "WARN" | "UNKNOWN" | "CRIT"
    lastSeenAt: string
    lastCheckAt: string
    ansibleConfig: number | undefined
    createdAt: String
    updatedAt: String
}

