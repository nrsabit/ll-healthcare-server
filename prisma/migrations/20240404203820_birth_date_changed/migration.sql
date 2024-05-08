-- AlterTable
ALTER TABLE "PatientHealthData" ALTER COLUMN "dateOfBirth" DROP NOT NULL,
ALTER COLUMN "dateOfBirth" SET DATA TYPE TEXT;
