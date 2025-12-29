-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "portfolio_reflection" TEXT,
ADD COLUMN     "portfolio_visible" BOOLEAN NOT NULL DEFAULT true;
