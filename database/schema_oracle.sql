-- ============================================================
-- Oracle SQL Script generado desde schema.prisma (PostgreSQL)
-- Fecha: 2026-03-24
-- Notas:
--   - UUID se representa como VARCHAR2(36)
--   - gen_random_uuid() se reemplaza por SYS_GUID() formateado
--   - BOOLEAN se representa como NUMBER(1) con CHECK (0 o 1)
--   - TEXT sin longitud se representa como CLOB
--   - TIMESTAMP WITH TIME ZONE para campos Timestamptz
-- ============================================================


-- ============================================================
-- TABLA: SSO_AUTH_ROLES_T
-- (Definida antes que SSO_AUTH_ACCESS_T por dependencia FK)
-- ============================================================
CREATE TABLE SSO_AUTH_ROLES_T (
    id            VARCHAR2(36)  DEFAULT LOWER(
                                  REGEXP_REPLACE(
                                    RAWTOHEX(SYS_GUID()),
                                    '([A-F0-9]{8})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{12})',
                                    '\1-\2-\3-\4-\5'
                                  )
                                ) NOT NULL,
    role_name     VARCHAR2(50),
    role_code     VARCHAR2(50),
    description   CLOB,
    created_by    VARCHAR2(100),
    created_date  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    is_system     NUMBER(1)     DEFAULT 0,
    module        VARCHAR2(50),
    CONSTRAINT pk_sso_auth_roles PRIMARY KEY (id),
    CONSTRAINT chk_roles_is_system CHECK (is_system IN (0, 1))
);

CREATE INDEX idx_roles_code ON SSO_AUTH_ROLES_T (role_code);


-- ============================================================
-- TABLA: SSO_AUTH_GRANTS_T
-- ============================================================
CREATE TABLE SSO_AUTH_GRANTS_T (
    id           VARCHAR2(36)  DEFAULT LOWER(
                                 REGEXP_REPLACE(
                                   RAWTOHEX(SYS_GUID()),
                                   '([A-F0-9]{8})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{12})',
                                   '\1-\2-\3-\4-\5'
                                 )
                               ) NOT NULL,
    grants_name  VARCHAR2(100),
    description  CLOB,
    icon_text    VARCHAR2(50),
    grant_code   VARCHAR2(50),
    CONSTRAINT pk_sso_auth_grants PRIMARY KEY (id)
);

CREATE INDEX idx_grants_code ON SSO_AUTH_GRANTS_T (grant_code);


-- ============================================================
-- TABLA: SSO_AUTH_CLIENTS_T
-- ============================================================
CREATE TABLE SSO_AUTH_CLIENTS_T (
    client_id         VARCHAR2(100)  NOT NULL,
    app_name          VARCHAR2(50),
    client_secret     VARCHAR2(32)   DEFAULT LOWER(RAWTOHEX(DBMS_CRYPTO.RANDOMBYTES(16))),
    description       CLOB,
    redirect_callback CLOB,
    scopes            CLOB,
    is_active         NUMBER(1)      DEFAULT 1,
    app_type          VARCHAR2(20),
    client_icon_url   CLOB,
    created_by        VARCHAR2(50),
    last_update_date  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    created_date      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_sso_auth_clients PRIMARY KEY (client_id),
    CONSTRAINT chk_clients_is_active CHECK (is_active IN (0, 1))
);

CREATE INDEX idx_clients_active      ON SSO_AUTH_CLIENTS_T (is_active);
CREATE INDEX idx_clients_app_name    ON SSO_AUTH_CLIENTS_T (app_name);
CREATE INDEX idx_clients_app_type    ON SSO_AUTH_CLIENTS_T (app_type);
CREATE INDEX idx_clients_client_secret ON SSO_AUTH_CLIENTS_T (client_id, client_secret);


-- ============================================================
-- TABLA: SSO_AUTH_PERMISSIONS_T
-- ============================================================
CREATE TABLE SSO_AUTH_PERMISSIONS_T (
    id           VARCHAR2(36)  DEFAULT LOWER(
                                 REGEXP_REPLACE(
                                   RAWTOHEX(SYS_GUID()),
                                   '([A-F0-9]{8})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{12})',
                                   '\1-\2-\3-\4-\5'
                                 )
                               ) NOT NULL,
    perm_name    VARCHAR2(70)  NOT NULL,
    perm_code    VARCHAR2(50)  NOT NULL,
    description  CLOB,
    action       VARCHAR2(30),
    created_by   VARCHAR2(50),
    created_date TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    IS_SYSTEM    NUMBER(1)     DEFAULT 0,
    CONSTRAINT pk_sso_auth_permissions PRIMARY KEY (id),
    CONSTRAINT uq_permissions_perm_code UNIQUE (perm_code),
    CONSTRAINT chk_permissions_is_system CHECK (IS_SYSTEM IN (0, 1))
);


-- ============================================================
-- TABLA: SSO_AUTH_USER_PREFERENCES_T
-- ============================================================
CREATE TABLE SSO_AUTH_USER_PREFERENCES_T (
    id            VARCHAR2(36)  DEFAULT LOWER(
                                  REGEXP_REPLACE(
                                    RAWTOHEX(SYS_GUID()),
                                    '([A-F0-9]{8})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{12})',
                                    '\1-\2-\3-\4-\5'
                                  )
                                ) NOT NULL,
    theme         VARCHAR2(10),
    notifications NUMBER(1)    DEFAULT 1,
    timezone      VARCHAR2(50),
    lang          VARCHAR2(20),
    CONSTRAINT pk_sso_auth_user_pref PRIMARY KEY (id),
    CONSTRAINT chk_user_pref_notif CHECK (notifications IN (0, 1))
);


-- ============================================================
-- TABLA: SSO_AUTH_USER_2FA
-- ============================================================
CREATE TABLE SSO_AUTH_USER_2FA (
    id                VARCHAR2(36)  DEFAULT LOWER(
                                      REGEXP_REPLACE(
                                        RAWTOHEX(SYS_GUID()),
                                        '([A-F0-9]{8})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{12})',
                                        '\1-\2-\3-\4-\5'
                                      )
                                    ) NOT NULL,
    ascii             CLOB          NOT NULL,
    hex               CLOB          NOT NULL,
    base32            VARCHAR2(800) NOT NULL,
    otpauth_url       CLOB          NOT NULL,
    created_date      TIMESTAMP WITH TIME ZONE  DEFAULT CURRENT_TIMESTAMP,
    updated_date      TIMESTAMP WITH TIME ZONE  DEFAULT CURRENT_TIMESTAMP,
    verified_date     TIMESTAMP WITH TIME ZONE,
    verified_status   VARCHAR2(20),
    failed_attempts   NUMBER(10)    DEFAULT 0,
    last_attempt_date TIMESTAMP WITH TIME ZONE,
    expires_date      TIMESTAMP WITH TIME ZONE,
    log_in_status     VARCHAR2(80),
    CONSTRAINT pk_sso_auth_user_2fa PRIMARY KEY (id)
);


-- ============================================================
-- TABLA: SSO_BUSINESS_LOCATIONS_T
-- ============================================================
CREATE TABLE SSO_BUSINESS_LOCATIONS_T (
    location_id     VARCHAR2(36)   DEFAULT LOWER(
                                     REGEXP_REPLACE(
                                       RAWTOHEX(SYS_GUID()),
                                       '([A-F0-9]{8})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{12})',
                                       '\1-\2-\3-\4-\5'
                                     )
                                   ) NOT NULL,
    street_name     VARCHAR2(100),
    street_number   VARCHAR2(20),
    neighborhood    VARCHAR2(10),
    city            VARCHAR2(100),
    state           VARCHAR2(100),
    postal_code     VARCHAR2(10),
    country         VARCHAR2(100),
    CONSTRAINT pk_sso_business_locations PRIMARY KEY (location_id)
);


-- ============================================================
-- TABLA: SSO_BUSINESS_UNITS_T
-- ============================================================
CREATE TABLE SSO_BUSINESS_UNITS_T (
    unit_id      VARCHAR2(36)  DEFAULT LOWER(
                                 REGEXP_REPLACE(
                                   RAWTOHEX(SYS_GUID()),
                                   '([A-F0-9]{8})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{12})',
                                   '\1-\2-\3-\4-\5'
                                 )
                               ) NOT NULL,
    name         VARCHAR2(50),
    code         VARCHAR2(50),
    description  CLOB,
    status       VARCHAR2(20),
    created_date VARCHAR2(50),
    img_url      CLOB,
    CONSTRAINT pk_sso_business_units PRIMARY KEY (unit_id)
);

CREATE INDEX idx_business_units_code   ON SSO_BUSINESS_UNITS_T (code);
CREATE INDEX idx_business_units_status ON SSO_BUSINESS_UNITS_T (status);


-- ============================================================
-- TABLA: SSO_BUSINESS_UNIT_BRANCHES_T
-- ============================================================
CREATE TABLE SSO_BUSINESS_UNIT_BRANCHES_T (
    branch_id   VARCHAR2(36)  DEFAULT LOWER(
                                REGEXP_REPLACE(
                                  RAWTOHEX(SYS_GUID()),
                                  '([A-F0-9]{8})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{12})',
                                  '\1-\2-\3-\4-\5'
                                )
                              ) NOT NULL,
    unit_id     VARCHAR2(36),
    name        VARCHAR2(100),
    location_id VARCHAR2(36),
    is_primary  NUMBER(1)     DEFAULT 0,
    CONSTRAINT pk_sso_bus_unit_branches PRIMARY KEY (branch_id),
    CONSTRAINT chk_branch_is_primary CHECK (is_primary IN (0, 1)),
    CONSTRAINT fk_branch_location FOREIGN KEY (location_id)
        REFERENCES SSO_BUSINESS_LOCATIONS_T (location_id),
    CONSTRAINT fk_branch_unit FOREIGN KEY (unit_id)
        REFERENCES SSO_BUSINESS_UNITS_T (unit_id)
);

CREATE INDEX idx_branch_location     ON SSO_BUSINESS_UNIT_BRANCHES_T (location_id);
CREATE INDEX idx_branch_name         ON SSO_BUSINESS_UNIT_BRANCHES_T (name);
CREATE INDEX idx_unit_branch_primary ON SSO_BUSINESS_UNIT_BRANCHES_T (unit_id, is_primary);


-- ============================================================
-- TABLA: SSO_USER_BUSINESS_UNIT_T
-- ============================================================
CREATE TABLE SSO_USER_BUSINESS_UNIT_T (
    id         VARCHAR2(36)  DEFAULT LOWER(
                               REGEXP_REPLACE(
                                 RAWTOHEX(SYS_GUID()),
                                 '([A-F0-9]{8})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{12})',
                                 '\1-\2-\3-\4-\5'
                               )
                             ) NOT NULL,
    unit_id    VARCHAR2(36),
    job_title  VARCHAR2(20),
    department VARCHAR2(40),
    hire_date  TIMESTAMP,
    branch_id  VARCHAR2(36),
    end_date   TIMESTAMP,
    CONSTRAINT pk_sso_user_business_unit PRIMARY KEY (id),
    CONSTRAINT fk_ubu_branch FOREIGN KEY (branch_id)
        REFERENCES SSO_BUSINESS_UNIT_BRANCHES_T (branch_id),
    CONSTRAINT fk_ubu_unit FOREIGN KEY (unit_id)
        REFERENCES SSO_BUSINESS_UNITS_T (unit_id)
);


-- ============================================================
-- TABLA: SSO_AUTH_USERS_T
-- ============================================================
CREATE TABLE SSO_AUTH_USERS_T (
    user_id                VARCHAR2(36)  DEFAULT LOWER(
                                           REGEXP_REPLACE(
                                             RAWTOHEX(SYS_GUID()),
                                             '([A-F0-9]{8})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{12})',
                                             '\1-\2-\3-\4-\5'
                                           )
                                         ) NOT NULL,
    username               VARCHAR2(30)  NOT NULL,
    name                   VARCHAR2(30),
    last_name              VARCHAR2(50),
    second_last_name       VARCHAR2(50),
    email                  VARCHAR2(50),
    phone                  VARCHAR2(15),
    password               CLOB          NOT NULL,
    profile_picture        CLOB,
    status                 VARCHAR2(10),
    last_login             TIMESTAMP,
    reset_token            VARCHAR2(10),
    biografia              CLOB,
    created_date           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    password_recovery_date TIMESTAMP,
    last_password_change   VARCHAR2(50),
    authorization_code     VARCHAR2(20),
    id_user_bu             VARCHAR2(36),
    id_user_preference     VARCHAR2(36),
    id_user_2fa            VARCHAR2(36),
    last_update_avatar     TIMESTAMP,
    CONSTRAINT pk_sso_auth_users PRIMARY KEY (user_id),
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email    UNIQUE (email),
    CONSTRAINT fk_users_bu FOREIGN KEY (id_user_bu)
        REFERENCES SSO_USER_BUSINESS_UNIT_T (id),
    CONSTRAINT fk_users_preferences FOREIGN KEY (id_user_preference)
        REFERENCES SSO_AUTH_USER_PREFERENCES_T (id),
    CONSTRAINT fk_user_2fa FOREIGN KEY (id_user_2fa)
        REFERENCES SSO_AUTH_USER_2FA (id)
);

CREATE INDEX idx_sso_users_authorization_code ON SSO_AUTH_USERS_T (authorization_code);
CREATE INDEX idx_sso_users_created_date       ON SSO_AUTH_USERS_T (created_date);
CREATE INDEX idx_sso_users_email              ON SSO_AUTH_USERS_T (email);
CREATE INDEX idx_sso_users_status             ON SSO_AUTH_USERS_T (status);
CREATE INDEX idx_sso_users_username           ON SSO_AUTH_USERS_T (username);


-- ============================================================
-- TABLA: SSO_AUTH_ACCESS_T
-- ============================================================
CREATE TABLE SSO_AUTH_ACCESS_T (
    user_id      VARCHAR2(36)  NOT NULL,
    role_id      VARCHAR2(36)  NOT NULL,
    created_by   VARCHAR2(50),
    created_date TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_sso_auth_access PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_access_role FOREIGN KEY (role_id)
        REFERENCES SSO_AUTH_ROLES_T (id),
    CONSTRAINT fk_access_user FOREIGN KEY (user_id)
        REFERENCES SSO_AUTH_USERS_T (user_id)
);

CREATE INDEX idx_access_by_role ON SSO_AUTH_ACCESS_T (role_id);
CREATE INDEX idx_access_by_user ON SSO_AUTH_ACCESS_T (user_id);


-- ============================================================
-- TABLA: SSO_AUTH_CLIENT_GRANTS_T
-- ============================================================
CREATE TABLE SSO_AUTH_CLIENT_GRANTS_T (
    client_id    VARCHAR2(100) NOT NULL,
    grant_id     VARCHAR2(36)  NOT NULL,
    created_date TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_sso_auth_client_grants PRIMARY KEY (client_id, grant_id),
    CONSTRAINT fk_client_grants_client FOREIGN KEY (client_id)
        REFERENCES SSO_AUTH_CLIENTS_T (client_id),
    CONSTRAINT fk_client_grants_grant FOREIGN KEY (grant_id)
        REFERENCES SSO_AUTH_GRANTS_T (id)
);


-- ============================================================
-- TABLA: SSO_AUTH_TOKEN_T
-- ============================================================
CREATE TABLE SSO_AUTH_TOKEN_T (
    token_id        VARCHAR2(36)  DEFAULT LOWER(
                                    REGEXP_REPLACE(
                                      RAWTOHEX(SYS_GUID()),
                                      '([A-F0-9]{8})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{12})',
                                      '\1-\2-\3-\4-\5'
                                    )
                                  ) NOT NULL,
    user_id         VARCHAR2(36),
    client_id       VARCHAR2(100),
    access_token    VARCHAR2(4000),
    refresh_token   VARCHAR2(4000),
    access_expires  TIMESTAMP,
    refresh_expires TIMESTAMP,
    agent           VARCHAR2(800),
    ip_address      VARCHAR2(45),
    created_date    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_sso_auth_token PRIMARY KEY (token_id),
    CONSTRAINT fk_token_user FOREIGN KEY (user_id)
        REFERENCES SSO_AUTH_USERS_T (user_id)
);

CREATE INDEX idx_tokens_access_token   ON SSO_AUTH_TOKEN_T (access_token);
CREATE INDEX idx_tokens_client_id      ON SSO_AUTH_TOKEN_T (client_id);
CREATE INDEX idx_tokens_created_date   ON SSO_AUTH_TOKEN_T (created_date);
CREATE INDEX idx_tokens_refresh_expires ON SSO_AUTH_TOKEN_T (refresh_expires);
CREATE INDEX idx_tokens_refresh_token  ON SSO_AUTH_TOKEN_T (refresh_token);
CREATE INDEX idx_tokens_user           ON SSO_AUTH_TOKEN_T (user_id);


-- ============================================================
-- TABLA: SSO_AUTH_ROLE_PERMISSIONS_T
-- ============================================================
CREATE TABLE SSO_AUTH_ROLE_PERMISSIONS_T (
    role_id       VARCHAR2(36)  NOT NULL,
    permission_id VARCHAR2(36)  NOT NULL,
    granted_by    VARCHAR2(50),
    granted_date  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_sso_role_permissions PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_perm_permission FOREIGN KEY (permission_id)
        REFERENCES SSO_AUTH_PERMISSIONS_T (id),
    CONSTRAINT fk_role_perm_role FOREIGN KEY (role_id)
        REFERENCES SSO_AUTH_ROLES_T (id)
);


-- ============================================================
-- TABLA: SSO_AUTH_AUTHORIZATION_CODES_T
-- ============================================================
CREATE TABLE SSO_AUTH_AUTHORIZATION_CODES_T (
    id                 VARCHAR2(36)  DEFAULT LOWER(
                                       REGEXP_REPLACE(
                                         RAWTOHEX(SYS_GUID()),
                                         '([A-F0-9]{8})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{12})',
                                         '\1-\2-\3-\4-\5'
                                       )
                                     ) NOT NULL,
    user_id            VARCHAR2(36)  NOT NULL,
    client_id          VARCHAR2(100) NOT NULL,
    authorization_code VARCHAR2(50)  NOT NULL,
    expires_at         TIMESTAMP     NOT NULL,
    created_date       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_sso_auth_codes PRIMARY KEY (id),
    CONSTRAINT uq_auth_codes_code UNIQUE (authorization_code),
    CONSTRAINT fk_auth_codes_client FOREIGN KEY (client_id)
        REFERENCES SSO_AUTH_CLIENTS_T (client_id),
    CONSTRAINT fk_auth_codes_user FOREIGN KEY (user_id)
        REFERENCES SSO_AUTH_USERS_T (user_id)
);



COMMIT;
