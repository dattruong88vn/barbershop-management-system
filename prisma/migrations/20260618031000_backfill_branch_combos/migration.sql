WITH combo_branch AS (
  SELECT
    "combo_services"."combo_id",
    MIN("services"."branch_id"::text)::uuid AS "branch_id"
  FROM "combo_services"
  INNER JOIN "services"
    ON "services"."id" = "combo_services"."service_id"
  WHERE "services"."branch_id" IS NOT NULL
  GROUP BY "combo_services"."combo_id"
  HAVING COUNT(DISTINCT "services"."branch_id") = 1
)
UPDATE "combos"
SET "branch_id" = "combo_branch"."branch_id"
FROM "combo_branch"
WHERE "combos"."id" = "combo_branch"."combo_id"
  AND "combos"."branch_id" IS NULL;

WITH branch_managers AS (
  SELECT DISTINCT ON ("branch_id")
    "id",
    "branch_id"
  FROM "users"
  WHERE "role" = 'manager'
    AND "branch_id" IS NOT NULL
  ORDER BY "branch_id", "created_at" ASC
)
UPDATE "combos"
SET "created_by" = "branch_managers"."id"
FROM "branch_managers"
WHERE "combos"."branch_id" = "branch_managers"."branch_id";
