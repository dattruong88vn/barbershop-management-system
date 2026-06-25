ALTER TABLE "visit_services"
ADD COLUMN "is_haircut_snapshot" BOOLEAN NOT NULL DEFAULT false;

UPDATE "visit_services"
SET "is_haircut_snapshot" = "services"."is_haircut"
FROM "services"
WHERE "visit_services"."service_id" = "services"."id";
