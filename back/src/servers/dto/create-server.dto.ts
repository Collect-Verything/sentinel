export class CreateAnsibleConfigDto {
    id: number
    name: string
    editorFullname: string
    playbookPath: string
    variablesJson: string
    servers: CreateServerDto[]
}

export class CreateServerDto {
    serverIp: string
    status: "PENDING" | "CONFIGURING" | "CONFIGURED" | "ERROR"
    isSsl: boolean | undefined
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
    ansibleConfig: CreateAnsibleConfigDto
}
