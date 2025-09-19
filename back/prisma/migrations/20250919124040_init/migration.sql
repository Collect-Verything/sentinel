-- CreateTable
CREATE TABLE `Server` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `serverIp` VARCHAR(64) NOT NULL,
    `status` ENUM('PENDING', 'CONFIGURING', 'CONFIGURED', 'ERROR') NOT NULL DEFAULT 'PENDING',
    `isSsl` BOOLEAN NOT NULL DEFAULT false,
    `cores` INTEGER NOT NULL,
    `ramMb` INTEGER NOT NULL,
    `storageGb` INTEGER NOT NULL,
    `provider` VARCHAR(100) NULL,
    `ownerClientId` INTEGER NOT NULL DEFAULT 0,
    `batchId` INTEGER NULL,
    `ansibleConfigId` INTEGER NULL,
    `sshUser` VARCHAR(64) NOT NULL,
    `sshPort` INTEGER NULL DEFAULT 22,
    `sshAuth` ENUM('PASSWORD', 'KEY') NOT NULL DEFAULT 'PASSWORD',
    `sshPassword` VARCHAR(191) NULL,
    `health` ENUM('OK', 'WARN', 'CRIT', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    `lastSeenAt` DATETIME(3) NULL,
    `lastCheckAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Server_serverIp_key`(`serverIp`),
    INDEX `Server_ownerClientId_idx`(`ownerClientId`),
    INDEX `Server_status_idx`(`status`),
    INDEX `Server_provider_idx`(`provider`),
    INDEX `Server_ansibleConfigId_idx`(`ansibleConfigId`),
    INDEX `Server_batchId_idx`(`batchId`),
    UNIQUE INDEX `Server_serverIp_sshPort_key`(`serverIp`, `sshPort`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnsibleConfig` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `editorFullname` VARCHAR(120) NULL,
    `playbookPath` VARCHAR(255) NOT NULL,
    `variablesJson` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AnsibleConfig_name_idx`(`name`),
    UNIQUE INDEX `AnsibleConfig_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Server` ADD CONSTRAINT `Server_ansibleConfigId_fkey` FOREIGN KEY (`ansibleConfigId`) REFERENCES `AnsibleConfig`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
