
export interface Server {
    id:        Number
    serverIp:  String
    status:    String
    isSsl:     Boolean
    cores:      Number
    ramMb:      Number
    storageGb:  Number
    provider:   String
    ownerClientId:    Number
    batchId:          Number
    ansibleConfigId:  Number
    sshUser:      String
    sshPort:      Number
    sshAuth:      String
    sshPassword:  String
    health:       String
    lastSeenAt:   String
    lastCheckAt:  String
    ansibleConfig:  String
    createdAt:  String
    updatedAt:  String
}

export const ServerStatus = {
    PENDING: 'PENDING',
    CONFIGURED: 'CONFIGURED',
}