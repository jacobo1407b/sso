/*
  Warnings:

  - Added the required column `log_in_status` to the `SSO_AUTH_USER_2FA` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SSO_AUTH_USERS_T" ADD COLUMN     "last_update_avatar" TIMESTAMP(6);

-- AlterTable
ALTER TABLE "SSO_AUTH_USER_2FA" ADD COLUMN     "log_in_status" VARCHAR(80) NOT NULL;
