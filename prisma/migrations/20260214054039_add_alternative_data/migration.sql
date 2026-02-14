-- CreateTable
CREATE TABLE `Borrower` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `businessType` VARCHAR(100) NULL,
    `phoneNumber` VARCHAR(30) NULL,
    `email` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Borrower_createdAt_idx`(`createdAt`),
    INDEX `Borrower_phoneNumber_idx`(`phoneNumber`),
    INDEX `Borrower_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AlternativeData` (
    `id` CHAR(36) NOT NULL,
    `borrowerId` CHAR(36) NOT NULL,
    `mutasiRekeningFileUrl` VARCHAR(2048) NOT NULL,
    `mutasiRekeningUploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `pulsaAvg` DECIMAL(18, 2) NULL,
    `listrikFrequencyDays` INTEGER NULL,
    `rawNotesText` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AlternativeData_borrowerId_createdAt_idx`(`borrowerId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AiScoringResult` (
    `id` CHAR(36) NOT NULL,
    `borrowerId` CHAR(36) NOT NULL,
    `geminiCreditScore` INTEGER NULL,
    `geminiAnalysisReason` TEXT NULL,
    `promptVersion` VARCHAR(50) NOT NULL,
    `modelVersion` VARCHAR(50) NOT NULL,
    `extractedTextConfidence` DECIMAL(5, 4) NULL,
    `imageQualityScore` INTEGER NULL,
    `rawInputJson` JSON NULL,
    `geminiResponseJson` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AiScoringResult_borrowerId_createdAt_idx`(`borrowerId`, `createdAt`),
    INDEX `AiScoringResult_promptVersion_idx`(`promptVersion`),
    INDEX `AiScoringResult_modelVersion_idx`(`modelVersion`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FinalCreditDecision` (
    `id` CHAR(36) NOT NULL,
    `borrowerId` CHAR(36) NOT NULL,
    `aiScoringResultId` CHAR(36) NULL,
    `adjustedProbability` DECIMAL(5, 4) NULL,
    `finalScore` INTEGER NULL,
    `limitAmount` DECIMAL(18, 2) NULL,
    `decision` ENUM('approved', 'rejected', 'manual_review') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FinalCreditDecision_borrowerId_createdAt_idx`(`borrowerId`, `createdAt`),
    INDEX `FinalCreditDecision_aiScoringResultId_idx`(`aiScoringResultId`),
    INDEX `FinalCreditDecision_decision_idx`(`decision`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AlternativeDataRaw` (
    `id` CHAR(36) NOT NULL,
    `borrowerId` CHAR(36) NOT NULL,
    `sourceType` VARCHAR(100) NOT NULL,
    `rawJson` JSON NOT NULL,
    `fileUrl` VARCHAR(2048) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AlternativeDataRaw_borrowerId_createdAt_idx`(`borrowerId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OcrExtraction` (
    `id` CHAR(36) NOT NULL,
    `alternativeDataRawId` CHAR(36) NOT NULL,
    `extractedText` TEXT NOT NULL,
    `confidence` DECIMAL(5, 4) NULL,
    `geminiResponseJson` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OcrExtraction_alternativeDataRawId_createdAt_idx`(`alternativeDataRawId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AlternativeData` ADD CONSTRAINT `AlternativeData_borrowerId_fkey` FOREIGN KEY (`borrowerId`) REFERENCES `Borrower`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AiScoringResult` ADD CONSTRAINT `AiScoringResult_borrowerId_fkey` FOREIGN KEY (`borrowerId`) REFERENCES `Borrower`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinalCreditDecision` ADD CONSTRAINT `FinalCreditDecision_borrowerId_fkey` FOREIGN KEY (`borrowerId`) REFERENCES `Borrower`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinalCreditDecision` ADD CONSTRAINT `FinalCreditDecision_aiScoringResultId_fkey` FOREIGN KEY (`aiScoringResultId`) REFERENCES `AiScoringResult`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AlternativeDataRaw` ADD CONSTRAINT `AlternativeDataRaw_borrowerId_fkey` FOREIGN KEY (`borrowerId`) REFERENCES `Borrower`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OcrExtraction` ADD CONSTRAINT `OcrExtraction_alternativeDataRawId_fkey` FOREIGN KEY (`alternativeDataRawId`) REFERENCES `AlternativeDataRaw`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
