CREATE TYPE "BranchStatus" AS ENUM ('active', 'inactive');

ALTER TABLE "branches"
ADD COLUMN "manager_id" UUID,
ADD COLUMN "status" "BranchStatus" NOT NULL DEFAULT 'active';

UPDATE "branches"
SET "manager_id" = (
  SELECT "users"."id"
  FROM "users"
  WHERE
    "users"."branch_id" = "branches"."id"
    AND "users"."role" = 'manager'
    AND "users"."status" = 'active'
  ORDER BY "users"."created_at" ASC
  LIMIT 1
);

ALTER TABLE "branches"
ADD CONSTRAINT "branches_manager_id_fkey"
FOREIGN KEY ("manager_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "branches_shop_id_status_idx" ON "branches"("shop_id", "status");
CREATE INDEX "branches_manager_id_idx" ON "branches"("manager_id");

ALTER TABLE "visits"
ADD COLUMN "branch_name_snapshot" TEXT,
ADD COLUMN "branch_address_snapshot" TEXT;

UPDATE "visits"
SET
  "branch_name_snapshot" = "branches"."name",
  "branch_address_snapshot" = "branches"."address"
FROM "branches"
WHERE "visits"."branch_id" = "branches"."id";

ALTER TABLE "visits"
ALTER COLUMN "branch_name_snapshot" SET NOT NULL,
ALTER COLUMN "branch_address_snapshot" SET NOT NULL;
