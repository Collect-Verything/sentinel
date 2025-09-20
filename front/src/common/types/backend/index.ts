// export interface AnsibleConfig {
//     id: number
//     name: string
//     editorFullname: string
//     playbookPath: string
//     variablesJson: string
//     servers: Server[]
// }

export interface Server {
    id:        Number
    serverIp: string
    status: "PENDING" | "CONFIGURING" | "CONFIGURED" | "ERROR"
    isSsl: boolean|string | undefined
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
    ansibleConfigId: number
    createdAt:  String
    updatedAt:  String
}

export const ServerStatus = {
    PENDING: 'PENDING',
    CONFIGURED: 'CONFIGURED',
}