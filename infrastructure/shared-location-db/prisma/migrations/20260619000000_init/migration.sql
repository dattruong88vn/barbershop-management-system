CREATE TABLE "provinces" (
  "code" VARCHAR(20) NOT NULL,
  "name" TEXT NOT NULL,
  "full_name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "effective_from" DATE,
  "effective_to" DATE,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "provinces_pkey" PRIMARY KEY ("code")
);

CREATE TABLE "wards" (
  "code" VARCHAR(20) NOT NULL,
  "province_code" VARCHAR(20) NOT NULL,
  "name" TEXT NOT NULL,
  "full_name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "effective_from" DATE,
  "effective_to" DATE,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "wards_pkey" PRIMARY KEY ("code")
);

CREATE TABLE "dataset_versions" (
  "id" UUID NOT NULL,
  "source_name" TEXT NOT NULL,
  "source_url" TEXT NOT NULL,
  "source_version" TEXT NOT NULL,
  "checksum" TEXT NOT NULL,
  "province_count" INTEGER NOT NULL,
  "ward_count" INTEGER NOT NULL,
  "imported_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "dataset_versions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "provinces_is_active_name_idx" ON "provinces"("is_active", "name");
CREATE INDEX "wards_province_code_is_active_name_idx" ON "wards"("province_code", "is_active", "name");
CREATE UNIQUE INDEX "dataset_versions_source_name_source_version_checksum_key"
  ON "dataset_versions"("source_name", "source_version", "checksum");

ALTER TABLE "wards"
  ADD CONSTRAINT "wards_province_code_fkey"
  FOREIGN KEY ("province_code") REFERENCES "provinces"("code")
  ON DELETE RESTRICT ON UPDATE CASCADE;
