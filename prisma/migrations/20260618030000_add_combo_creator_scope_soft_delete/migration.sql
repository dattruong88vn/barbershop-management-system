ALTER TABLE "combos" ADD COLUMN "branch_id" UUID;
ALTER TABLE "combos" ADD COLUMN "created_by" UUID;
ALTER TABLE "combos" ADD COLUMN "deleted_at" TIMESTAMPTZ(6);

UPDATE "combos"
SET "created_by" = "owners"."id"
FROM (
  SELECT DISTINCT ON ("shop_id") "id", "shop_id"
  FROM "users"
  WHERE "role" = 'owner'
  ORDER BY "shop_id", "created_at" ASC
) AS "owners"
WHERE "combos"."shop_id" = "owners"."shop_id";

ALTER TABLE "combos" ALTER COLUMN "created_by" SET NOT NULL;

ALTER TABLE "combos"
ADD CONSTRAINT "combos_branch_id_fkey"
FOREIGN KEY ("branch_id") REFERENCES "branches"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "combos"
ADD CONSTRAINT "combos_created_by_fkey"
FOREIGN KEY ("created_by") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "combos_shop_id_deleted_at_idx" ON "combos"("shop_id", "deleted_at");
CREATE INDEX "combos_shop_id_branch_id_idx" ON "combos"("shop_id", "branch_id");
CREATE INDEX "combos_branch_id_idx" ON "combos"("branch_id");
CREATE INDEX "combos_created_by_idx" ON "combos"("created_by");
