/*
  Warnings:

  - Added the required column `range` to the `Server` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Server` ADD COLUMN `range` INTEGER NOT NULL;
