-- CreateEnum
CREATE TYPE "ScanMode" AS ENUM ('MANUAL', 'EXCEL');

-- AlterTable
ALTER TABLE "ScanContainer" ADD COLUMN     "excelData" JSONB,
ADD COLUMN     "mode" "ScanMode" NOT NULL DEFAULT 'MANUAL';
