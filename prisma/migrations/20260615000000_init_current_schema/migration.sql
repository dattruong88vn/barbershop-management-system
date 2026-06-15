-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ShopPlan" AS ENUM ('basic', 'pro', 'pro_max');

-- CreateEnum
CREATE TYPE "ShopStatus" AS ENUM ('active', 'expired');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('superadmin', 'owner', 'manager', 'receptionist', 'barber', 'skinner');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('pending', 'in_progress', 'completed');

-- CreateEnum
CREATE TYPE "ServiceResponsibleRole" AS ENUM ('barber', 'skinner');

-- CreateTable
CREATE TABLE "shops" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "plan" "ShopPlan" NOT NULL DEFAULT 'basic',
    "status" "ShopStatus" NOT NULL DEFAULT 'active',
    "trial_expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "shop_id" UUID,
    "branch_id" UUID,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "is_first_login" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "responsible_role" "ServiceResponsibleRole" NOT NULL,
    "is_haircut" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "combos" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "combos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "combo_services" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "combo_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,

    CONSTRAINT "combo_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "barber_id" UUID,
    "skinner_id" UUID,
    "no_haircut" BOOLEAN NOT NULL DEFAULT false,
    "no_skinner_service" BOOLEAN NOT NULL DEFAULT false,
    "status" "VisitStatus" NOT NULL DEFAULT 'pending',
    "total_price" DECIMAL(12,2) NOT NULL,
    "created_by" UUID NOT NULL,
    "completed_at" TIMESTAMPTZ(6),
    "last_updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_services" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "visit_id" UUID NOT NULL,
    "service_id" UUID,
    "combo_id" UUID,
    "price" DECIMAL(12,2) NOT NULL,
    "service_name_snapshot" TEXT,
    "service_price_snapshot" DECIMAL(12,2),
    "combo_name_snapshot" TEXT,
    "combo_price_snapshot" DECIMAL(12,2),
    "responsible_role_snapshot" "ServiceResponsibleRole",
    "allocated_price" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "visit_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_photos" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "visit_id" UUID NOT NULL,
    "photo_url" TEXT NOT NULL,
    "uploaded_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visit_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "branches_shop_id_idx" ON "branches"("shop_id");

-- CreateIndex
CREATE INDEX "users_branch_id_idx" ON "users"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_shop_id_username_key" ON "users"("shop_id", "username");

-- CreateIndex
CREATE INDEX "services_shop_id_idx" ON "services"("shop_id");

-- CreateIndex
CREATE INDEX "combos_shop_id_idx" ON "combos"("shop_id");

-- CreateIndex
CREATE INDEX "combo_services_shop_id_idx" ON "combo_services"("shop_id");

-- CreateIndex
CREATE INDEX "combo_services_service_id_idx" ON "combo_services"("service_id");

-- CreateIndex
CREATE UNIQUE INDEX "combo_services_combo_id_service_id_key" ON "combo_services"("combo_id", "service_id");

-- CreateIndex
CREATE INDEX "customers_shop_id_idx" ON "customers"("shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_shop_id_phone_key" ON "customers"("shop_id", "phone");

-- CreateIndex
CREATE INDEX "visits_shop_id_idx" ON "visits"("shop_id");

-- CreateIndex
CREATE INDEX "visits_customer_id_idx" ON "visits"("customer_id");

-- CreateIndex
CREATE INDEX "visits_branch_id_idx" ON "visits"("branch_id");

-- CreateIndex
CREATE INDEX "visits_barber_id_idx" ON "visits"("barber_id");

-- CreateIndex
CREATE INDEX "visits_skinner_id_idx" ON "visits"("skinner_id");

-- CreateIndex
CREATE INDEX "visits_created_by_idx" ON "visits"("created_by");

-- CreateIndex
CREATE INDEX "visits_last_updated_by_idx" ON "visits"("last_updated_by");

-- CreateIndex
CREATE INDEX "visit_services_shop_id_idx" ON "visit_services"("shop_id");

-- CreateIndex
CREATE INDEX "visit_services_visit_id_idx" ON "visit_services"("visit_id");

-- CreateIndex
CREATE INDEX "visit_services_service_id_idx" ON "visit_services"("service_id");

-- CreateIndex
CREATE INDEX "visit_services_combo_id_idx" ON "visit_services"("combo_id");

-- CreateIndex
CREATE INDEX "visit_services_responsible_role_snapshot_idx" ON "visit_services"("responsible_role_snapshot");

-- CreateIndex
CREATE INDEX "visit_photos_shop_id_idx" ON "visit_photos"("shop_id");

-- CreateIndex
CREATE INDEX "visit_photos_visit_id_idx" ON "visit_photos"("visit_id");

-- CreateIndex
CREATE INDEX "visit_photos_uploaded_by_idx" ON "visit_photos"("uploaded_by");

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combos" ADD CONSTRAINT "combos_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combo_services" ADD CONSTRAINT "combo_services_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combo_services" ADD CONSTRAINT "combo_services_combo_id_fkey" FOREIGN KEY ("combo_id") REFERENCES "combos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combo_services" ADD CONSTRAINT "combo_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_barber_id_fkey" FOREIGN KEY ("barber_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_skinner_id_fkey" FOREIGN KEY ("skinner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_last_updated_by_fkey" FOREIGN KEY ("last_updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_services" ADD CONSTRAINT "visit_services_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_services" ADD CONSTRAINT "visit_services_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_services" ADD CONSTRAINT "visit_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_services" ADD CONSTRAINT "visit_services_combo_id_fkey" FOREIGN KEY ("combo_id") REFERENCES "combos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_photos" ADD CONSTRAINT "visit_photos_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_photos" ADD CONSTRAINT "visit_photos_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_photos" ADD CONSTRAINT "visit_photos_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

