ALTER TABLE "services" ADD COLUMN "branch_id" UUID;
ALTER TABLE "services" ADD COLUMN "created_by" UUID;

UPDATE "services"
SET "created_by" = "owners"."id"
FROM (
  SELECT DISTINCT ON ("shop_id") "id", "shop_id"
  FROM "users"
  WHERE "role" = 'owner'
  ORDER BY "shop_id", "created_at" ASC
) AS "owners"
WHERE "services"."shop_id" = "owners"."shop_id";

ALTER TABLE "services" ALTER COLUMN "created_by" SET NOT NULL;

ALTER TABLE "services"
ADD CONSTRAINT "services_branch_id_fkey"
FOREIGN KEY ("branch_id") REFERENCES "branches"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "services"
ADD CONSTRAINT "services_created_by_fkey"
FOREIGN KEY ("created_by") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "services_shop_id_branch_id_idx" ON "services"("shop_id", "branch_id");
CREATE INDEX "services_branch_id_idx" ON "services"("branch_id");
CREATE INDEX "services_created_by_idx" ON "services"("created_by");
