/*
  Warnings:

  - Added the required column `estimated_completion` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_offered` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "estimated_completion" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "price_offered" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "requiredSkills" TEXT;
