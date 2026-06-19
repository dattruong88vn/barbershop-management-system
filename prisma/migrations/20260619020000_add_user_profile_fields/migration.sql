CREATE TYPE "user_gender" AS ENUM ('male', 'female', 'other');

ALTER TABLE "users"
ADD COLUMN "full_name" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "date_of_birth" DATE,
ADD COLUMN "gender" "user_gender",
ADD COLUMN "hometown" TEXT,
ADD COLUMN "current_address" TEXT;
