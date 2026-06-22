ALTER TABLE "users"
ADD COLUMN "hometown_province_code" VARCHAR(20),
ADD COLUMN "current_province_code" VARCHAR(20),
ADD COLUMN "current_ward_code" VARCHAR(20),
ADD COLUMN "current_address_line" TEXT;

UPDATE "users"
SET "current_address_line" = "current_address"
WHERE "current_address" IS NOT NULL;
