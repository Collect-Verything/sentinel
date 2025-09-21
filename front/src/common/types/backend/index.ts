export interface Configs {
    id: number
    name: string
    editorFullname: string
    playbookPath: string
    variablesJson: string
    servers?: Server[]
    createdAt: string
    updatedAt: string
}


export interface Server {
    id: Number
    serverIp: string
    status: "PENDING" | "CONFIGURING" | "CONFIGURED" | "ERROR"
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

export const ServerStatus = {
    PENDING: 'PENDING',
    CONFIGURED: 'CONFIGURED',
}