-- AlterEnum
ALTER TYPE "ExecutionStatus" ADD VALUE 'QUEUED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "refreshToken" TEXT;

-- AddForeignKey
ALTER TABLE "WorkflowStep" ADD CONSTRAINT "WorkflowStep_appId_fkey" FOREIGN KEY ("appId") REFERENCES "Apps"("id") ON DELETE SET NULL ON UPDATE CASCADE;
