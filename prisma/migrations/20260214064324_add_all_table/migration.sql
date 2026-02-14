/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `Borrower` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Borrower` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `passwordHash` to the `Borrower` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `AiScoringResult` ADD COLUMN `geminiDefaultProbability` DECIMAL(5, 4) NULL;

-- AlterTable
ALTER TABLE `Borrower` ADD COLUMN `passwordHash` VARCHAR(255) NOT NULL,
    ADD COLUMN `refreshTokenHash` VARCHAR(255) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Borrower_phoneNumber_key` ON `Borrower`(`phoneNumber`);

-- CreateIndex
CREATE UNIQUE INDEX `Borrower_email_key` ON `Borrower`(`email`);
