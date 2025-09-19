/*
  Warnings:

  - You are about to drop the column `configured` on the `Server` table. All the data in the column will be lost.
  - You are about to drop the column `ip` on the `Server` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Server` table. All the data in the column will be lost.
  - You are about to drop the column `range` on the `Server` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[serverIp]` on the table `Server` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serverIp,sshPort]` on the table `Server` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cores` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ramMb` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serverIp` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sshUser` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storageGb` to the `Server` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Server_ip_key` ON `Server`;

-- AlterTable
ALTER TABLE `Server` DROP COLUMN `configured`,
    DROP COLUMN `ip`,
    DROP COLUMN `password`,
    DROP COLUMN `range`,
    ADD COLUMN `ansibleConfigId` INTEGER NULL,
    ADD COLUMN `batchId` INTEGER NULL,
    ADD COLUMN `cores` INTEGER NOT NULL,
    ADD COLUMN `health` ENUM('OK', 'WARN', 'CRIT', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    ADD COLUMN `isSsl` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lastCheckAt` DATETIME(3) NULL,
    ADD COLUMN `lastSeenAt` DATETIME(3) NULL,
    ADD COLUMN `provider` VARCHAR(100) NULL,
    ADD COLUMN `ramMb` INTEGER NOT NULL,
    ADD COLUMN `serverIp` VARCHAR(64) NOT NULL,
    ADD COLUMN `sshAuth` ENUM('PASSWORD', 'KEY') NOT NULL DEFAULT 'PASSWORD',
    ADD COLUMN `sshPassword` VARCHAR(191) NULL,
    ADD COLUMN `sshPort` INTEGER NULL DEFAULT 22,
    ADD COLUMN `sshUser` VARCHAR(64) NOT NULL,
    ADD COLUMN `status` ENUM('PENDING', 'CONFIGURING', 'CONFIGURED', 'ERROR') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `storageGb` INTEGER NOT NULL,
    MODIFY `ownerClientId` INTEGER NOT NULL DEFAULT 0;

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

-- CreateIndex
CREATE UNIQUE INDEX `Server_serverIp_key` ON `Server`(`serverIp`);

-- CreateIndex
CREATE INDEX `Server_ownerClientId_idx` ON `Server`(`ownerClientId`);

-- CreateIndex
CREATE INDEX `Server_status_idx` ON `Server`(`status`);

-- CreateIndex
CREATE INDEX `Server_provider_idx` ON `Server`(`provider`);

-- CreateIndex
CREATE INDEX `Server_ansibleConfigId_idx` ON `Server`(`ansibleConfigId`);

-- CreateIndex
CREATE INDEX `Server_batchId_idx` ON `Server`(`batchId`);

-- CreateIndex
CREATE UNIQUE INDEX `Server_serverIp_sshPort_key` ON `Server`(`serverIp`, `sshPort`);

-- AddForeignKey
ALTER TABLE `Server` ADD CONSTRAINT `Server_ansibleConfigId_fkey` FOREIGN KEY (`ansibleConfigId`) REFERENCES `AnsibleConfig`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
