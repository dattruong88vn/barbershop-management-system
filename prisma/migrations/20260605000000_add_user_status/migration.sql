CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive');

ALTER TABLE "users"
ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'active';
