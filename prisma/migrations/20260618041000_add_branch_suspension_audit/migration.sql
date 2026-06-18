ALTER TYPE "UserStatus" ADD VALUE IF NOT EXISTS 'branch_suspended';

ALTER TABLE "branches"
ADD COLUMN "deactivated_at" TIMESTAMPTZ(6),
ADD COLUMN "deactivated_by" UUID;

ALTER TABLE "branches"
ADD CONSTRAINT "branches_deactivated_by_fkey"
FOREIGN KEY ("deactivated_by") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "branches_deactivated_by_idx" ON "branches"("deactivated_by");
