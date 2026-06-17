-- Add soft-delete support for services so historical visits, combos, and reports keep their references.
ALTER TABLE "services" ADD COLUMN "deleted_at" TIMESTAMPTZ(6);

CREATE INDEX "services_shop_id_deleted_at_idx" ON "services"("shop_id", "deleted_at");
