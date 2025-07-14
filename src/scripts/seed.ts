import prisma from "@config/prisma";


import { hashPassword } from "@utils/bcrypt";


async function main() {
    const user = await prisma.sSO_AUTH_USERS_T.create({
        data: {
            username: "ADMIN",
            password: await hashPassword('$FBHp94DEyUq2'),
            email: "admin@admin.com",
            name: "ADMIN",
            last_name: "ADMIN"
        }
    });
    console.log('\x1b[32m%s\x1b[0m', `✅ Usuario creado correctamente`);

    console.log('\x1b[34m%s\x1b[0m', `   📧 Email: ${user.email}`);
    console.log('\x1b[31m%s\x1b[0m', `   🔑 Password: $FBHp94DEyUq2`);

    await prisma.sSO_AUTH_ROLES_T.createMany({
        data: [
            { rol_name: "SSO Administrator", rol_code: "ADMIN_SSO", created_by: "system", last_update_by: "system" },
            { rol_name: "User Provisioner", rol_code: "USER_PROVICIONE", created_by: "system", last_update_by: "system" },
            { rol_name: "Security Auditor", rol_code: "AUDITOR", created_by: "system", last_update_by: "system" },
            { rol_name: "Support Agent", rol_code: "SUPPORT", created_by: "system", last_update_by: "system" },
            { rol_name: "End User", rol_code: "END_USER", created_by: "system", last_update_by: "system" },
            { rol_name: "Policy Manager", rol_code: "POLICY_MANAGER", created_by: "system", last_update_by: "system" }
        ]
    });
    const findRolAdm = await prisma.sSO_AUTH_ROLES_T.findFirst({
        where: { rol_code: "ADMIN_SSO" }
    });

    await prisma.sSO_AUTH_ACCESS_L.create({
        data: {
            user_id: user.id,
            role_id: findRolAdm?.id ?? "",
            created_by: "system",
            last_update_by: "system"
        }
    });
    console.log('\x1b[32m%s\x1b[0m', `🛡️ Rol SSO Administrator asignado a ${user.email}`);



    const ssoClient = await prisma.sSO_AUTH_CLIENTS_T.create({
        data: {
            app_name: "SSO"
        }
    });

    console.log('\x1b[32m%s\x1b[0m', `🔑 Client credentials generadas:`);
    console.log('\x1b[34m%s\x1b[0m', `   📱 APP: ${ssoClient.app_name}`);
    console.log('\x1b[34m%s\x1b[0m', `   🆔 CLIENT: ${ssoClient.client_id}`);
    console.log('\x1b[34m%s\x1b[0m', `   🔐 SECRET: ${ssoClient.client_secret}`);


    await prisma.sSO_AUTH_GRANTS_T.createMany({
        data: [
            { client_id: ssoClient.client_id, grant_name: "password" },
            { client_id: ssoClient.client_id, grant_name: "client_credentials" },
            { client_id: ssoClient.client_id, grant_name: "refresh_token" },
        ]
    })

}

main()
    .catch(e => {
        console.error(e);
        
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());