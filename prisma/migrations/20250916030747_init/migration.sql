-- CreateTable
CREATE EXTENSION pgcrypto;
CREATE TABLE "SSO_AUTH_ACCESS_T" (
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "created_by" VARCHAR(50),
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SSO_AUTH_ACCESS_T_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "SSO_AUTH_CLIENTS_T" (
    "client_id" VARCHAR(100) NOT NULL,
    "app_name" VARCHAR(50),
    "client_secret" TEXT DEFAULT encode(gen_random_bytes(16), 'hex'::text),
    "description" TEXT,
    "redirect_callback" TEXT,
    "scopes" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "app_type" VARCHAR(20),
    "client_icon_url" TEXT,
    "created_by" VARCHAR(50),
    "last_update_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SSO_AUTH_CLIENTS_T_pkey" PRIMARY KEY ("client_id")
);

-- CreateTable
CREATE TABLE "SSO_AUTH_CLIENT_GRANTS_T" (
    "client_id" VARCHAR(100) NOT NULL,
    "grant_id" UUID NOT NULL,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SSO_AUTH_CLIENT_GRANTS_T_pkey" PRIMARY KEY ("client_id","grant_id")
);

-- CreateTable
CREATE TABLE "SSO_AUTH_GRANTS_T" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "grants_name" VARCHAR(100),
    "description" TEXT,
    "icon_text" VARCHAR(50),
    "grant_code" VARCHAR(50),

    CONSTRAINT "SSO_AUTH_GRANTS_T_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SSO_AUTH_ROLES_T" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "role_name" VARCHAR(50),
    "role_code" VARCHAR(50),
    "description" TEXT,
    "created_by" VARCHAR(100),
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "is_system" BOOLEAN DEFAULT false,
    "module" VARCHAR(50),

    CONSTRAINT "SSO_AUTH_ROLES_T_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SSO_AUTH_TOKEN_T" (
    "token_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "client_id" VARCHAR(100),
    "access_token" TEXT,
    "refresh_token" TEXT,
    "access_expires" TIMESTAMP(6),
    "refresh_expires" TIMESTAMP(6),
    "agent" VARCHAR(800),
    "ip_address" VARCHAR(45),
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SSO_AUTH_TOKEN_T_pkey" PRIMARY KEY ("token_id")
);

-- CreateTable
CREATE TABLE "SSO_AUTH_USERS_T" (
    "user_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" VARCHAR(30) NOT NULL,
    "name" VARCHAR(30),
    "last_name" VARCHAR(50),
    "second_last_name" VARCHAR(50),
    "email" VARCHAR(50),
    "phone" VARCHAR(15),
    "password" TEXT NOT NULL,
    "profile_picture" TEXT,
    "status" VARCHAR(10),
    "last_login" TIMESTAMP(6),
    "reset_token" VARCHAR(10),
    "biografia" TEXT,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "password_recovery_date" TIMESTAMP(6),
    "last_password_change" VARCHAR(50),
    "authorization_code" VARCHAR(20),
    "id_user_bu" UUID,
    "id_user_preference" UUID,
    "id_user_2fa" UUID,

    CONSTRAINT "SSO_AUTH_USERS_T_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "SSO_AUTH_USER_PREFERENCES_T" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "theme" VARCHAR(10),
    "notifications" BOOLEAN DEFAULT true,
    "timezone" VARCHAR(50),
    "lang" VARCHAR(20),

    CONSTRAINT "SSO_AUTH_USER_PREFERENCES_T_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SSO_BUSINESS_LOCATIONS_T" (
    "location_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "street_name" VARCHAR(100),
    "street_number" VARCHAR(20),
    "neighborhood" VARCHAR(10),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "postal_code" VARCHAR(10),
    "country" VARCHAR(100),

    CONSTRAINT "SSO_BUSINESS_LOCATIONS_T_pkey" PRIMARY KEY ("location_id")
);

-- CreateTable
CREATE TABLE "SSO_BUSINESS_UNITS_T" (
    "unit_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(50),
    "code" VARCHAR(50),
    "description" TEXT,
    "status" VARCHAR(20),
    "created_date" VARCHAR(50),
    "img_url" TEXT,

    CONSTRAINT "SSO_BUSINESS_UNITS_T_pkey" PRIMARY KEY ("unit_id")
);

-- CreateTable
CREATE TABLE "SSO_BUSINESS_UNIT_BRANCHES_T" (
    "branch_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "unit_id" UUID,
    "name" VARCHAR(100),
    "location_id" UUID,
    "is_primary" BOOLEAN DEFAULT false,

    CONSTRAINT "SSO_BUSINESS_UNIT_BRANCHES_T_pkey" PRIMARY KEY ("branch_id")
);

-- CreateTable
CREATE TABLE "SSO_USER_BUSINESS_UNIT_T" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "unit_id" UUID,
    "job_title" VARCHAR(20),
    "department" VARCHAR(40),
    "hire_date" TIMESTAMP(6),
    "branch_id" UUID,
    "end_date" TIMESTAMP(6),

    CONSTRAINT "SSO_USER_BUSINESS_UNIT_T_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SSO_AUTH_PERMISSIONS_T" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "perm_name" VARCHAR(70) NOT NULL,
    "perm_code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "action" VARCHAR(30),
    "created_by" VARCHAR(50),
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "IS_SYSTEM" BOOLEAN DEFAULT false,

    CONSTRAINT "SSO_AUTH_PERMISSIONS_T_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SSO_AUTH_ROLE_PERMISSIONS_T" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "granted_by" VARCHAR(50),
    "granted_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SSO_AUTH_ROLE_PERMISSIONS_T_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "SSO_AUTH_AUTHORIZATION_CODES_T" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "client_id" VARCHAR(100) NOT NULL,
    "authorization_code" VARCHAR(50) NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SSO_AUTH_AUTHORIZATION_CODES_T_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SSO_AUTH_USER_2FA" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ascii" TEXT NOT NULL,
    "hex" TEXT NOT NULL,
    "base32" VARCHAR(800) NOT NULL,
    "otpauth_url" TEXT NOT NULL,
    "created_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "verified_date" TIMESTAMPTZ(6),
    "verified_status" VARCHAR(20),
    "failed_attempts" INTEGER DEFAULT 0,
    "last_attempt_date" TIMESTAMPTZ(6),
    "expires_date" TIMESTAMPTZ(6),

    CONSTRAINT "SSO_AUTH_USER_2FA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_access_by_role" ON "SSO_AUTH_ACCESS_T"("role_id");

-- CreateIndex
CREATE INDEX "idx_access_by_user" ON "SSO_AUTH_ACCESS_T"("user_id");

-- CreateIndex
CREATE INDEX "idx_clients_active" ON "SSO_AUTH_CLIENTS_T"("is_active");

-- CreateIndex
CREATE INDEX "idx_clients_app_name" ON "SSO_AUTH_CLIENTS_T"("app_name");

-- CreateIndex
CREATE INDEX "idx_clients_app_type" ON "SSO_AUTH_CLIENTS_T"("app_type");

-- CreateIndex
CREATE INDEX "idx_clients_client_secret" ON "SSO_AUTH_CLIENTS_T"("client_id", "client_secret");

-- CreateIndex
CREATE INDEX "idx_grants_code" ON "SSO_AUTH_GRANTS_T"("grant_code");

-- CreateIndex
CREATE INDEX "idx_roles_code" ON "SSO_AUTH_ROLES_T"("role_code");

-- CreateIndex
CREATE INDEX "idx_tokens_access_token" ON "SSO_AUTH_TOKEN_T"("access_token");

-- CreateIndex
CREATE INDEX "idx_tokens_client_id" ON "SSO_AUTH_TOKEN_T"("client_id");

-- CreateIndex
CREATE INDEX "idx_tokens_created_date" ON "SSO_AUTH_TOKEN_T"("created_date");

-- CreateIndex
CREATE INDEX "idx_tokens_refresh_expires" ON "SSO_AUTH_TOKEN_T"("refresh_expires");

-- CreateIndex
CREATE INDEX "idx_tokens_refresh_token" ON "SSO_AUTH_TOKEN_T"("refresh_token");

-- CreateIndex
CREATE INDEX "idx_tokens_user" ON "SSO_AUTH_TOKEN_T"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "SSO_AUTH_USERS_T_username_key" ON "SSO_AUTH_USERS_T"("username");

-- CreateIndex
CREATE UNIQUE INDEX "SSO_AUTH_USERS_T_email_key" ON "SSO_AUTH_USERS_T"("email");

-- CreateIndex
CREATE INDEX "idx_sso_users_authorization_code" ON "SSO_AUTH_USERS_T"("authorization_code");

-- CreateIndex
CREATE INDEX "idx_sso_users_created_date" ON "SSO_AUTH_USERS_T"("created_date");

-- CreateIndex
CREATE INDEX "idx_sso_users_email" ON "SSO_AUTH_USERS_T"("email");

-- CreateIndex
CREATE INDEX "idx_sso_users_status" ON "SSO_AUTH_USERS_T"("status");

-- CreateIndex
CREATE INDEX "idx_sso_users_username" ON "SSO_AUTH_USERS_T"("username");

-- CreateIndex
CREATE INDEX "idx_business_units_code" ON "SSO_BUSINESS_UNITS_T"("code");

-- CreateIndex
CREATE INDEX "idx_business_units_status" ON "SSO_BUSINESS_UNITS_T"("status");

-- CreateIndex
CREATE INDEX "idx_branch_location" ON "SSO_BUSINESS_UNIT_BRANCHES_T"("location_id");

-- CreateIndex
CREATE INDEX "idx_branch_name" ON "SSO_BUSINESS_UNIT_BRANCHES_T"("name");

-- CreateIndex
CREATE INDEX "idx_unit_branch_primary" ON "SSO_BUSINESS_UNIT_BRANCHES_T"("unit_id", "is_primary");

-- CreateIndex
CREATE UNIQUE INDEX "SSO_AUTH_PERMISSIONS_T_perm_code_key" ON "SSO_AUTH_PERMISSIONS_T"("perm_code");

-- CreateIndex
CREATE UNIQUE INDEX "SSO_AUTH_AUTHORIZATION_CODES_T_authorization_code_key" ON "SSO_AUTH_AUTHORIZATION_CODES_T"("authorization_code");

-- AddForeignKey
ALTER TABLE "SSO_AUTH_ACCESS_T" ADD CONSTRAINT "SSO_AUTH_ACCESS_T_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "SSO_AUTH_ROLES_T"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SSO_AUTH_ACCESS_T" ADD CONSTRAINT "SSO_AUTH_ACCESS_T_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "SSO_AUTH_USERS_T"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SSO_AUTH_CLIENT_GRANTS_T" ADD CONSTRAINT "SSO_AUTH_CLIENT_GRANTS_T_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "SSO_AUTH_CLIENTS_T"("client_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SSO_AUTH_CLIENT_GRANTS_T" ADD CONSTRAINT "SSO_AUTH_CLIENT_GRANTS_T_grant_id_fkey" FOREIGN KEY ("grant_id") REFERENCES "SSO_AUTH_GRANTS_T"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SSO_AUTH_TOKEN_T" ADD CONSTRAINT "SSO_AUTH_TOKEN_T_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "SSO_AUTH_USERS_T"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SSO_AUTH_USERS_T" ADD CONSTRAINT "SSO_AUTH_USERS_T_id_user_bu_fkey" FOREIGN KEY ("id_user_bu") REFERENCES "SSO_USER_BUSINESS_UNIT_T"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SSO_AUTH_USERS_T" ADD CONSTRAINT "SSO_AUTH_USERS_T_id_user_preference_fkey" FOREIGN KEY ("id_user_preference") REFERENCES "SSO_AUTH_USER_PREFERENCES_T"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SSO_AUTH_USERS_T" ADD CONSTRAINT "fk_user_2fa" FOREIGN KEY ("id_user_2fa") REFERENCES "SSO_AUTH_USER_2FA"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SSO_BUSINESS_UNIT_BRANCHES_T" ADD CONSTRAINT "SSO_BUSINESS_UNIT_BRANCHES_T_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "SSO_BUSINESS_LOCATIONS_T"("location_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SSO_BUSINESS_UNIT_BRANCHES_T" ADD CONSTRAINT "SSO_BUSINESS_UNIT_BRANCHES_T_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "SSO_BUSINESS_UNITS_T"("unit_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SSO_USER_BUSINESS_UNIT_T" ADD CONSTRAINT "SSO_USER_BUSINESS_UNIT_T_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "SSO_BUSINESS_UNIT_BRANCHES_T"("branch_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SSO_USER_BUSINESS_UNIT_T" ADD CONSTRAINT "SSO_USER_BUSINESS_UNIT_T_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "SSO_BUSINESS_UNITS_T"("unit_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SSO_AUTH_ROLE_PERMISSIONS_T" ADD CONSTRAINT "SSO_AUTH_ROLE_PERMISSIONS_T_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "SSO_AUTH_PERMISSIONS_T"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SSO_AUTH_ROLE_PERMISSIONS_T" ADD CONSTRAINT "SSO_AUTH_ROLE_PERMISSIONS_T_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "SSO_AUTH_ROLES_T"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SSO_AUTH_AUTHORIZATION_CODES_T" ADD CONSTRAINT "SSO_AUTH_AUTHORIZATION_CODES_T_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "SSO_AUTH_CLIENTS_T"("client_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SSO_AUTH_AUTHORIZATION_CODES_T" ADD CONSTRAINT "SSO_AUTH_AUTHORIZATION_CODES_T_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "SSO_AUTH_USERS_T"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
