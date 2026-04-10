import prisma from "@config/prisma";
import { hashPassword } from "@utils/bcrypt";
import { getStorageProvider } from "@services/storage.factory";
import { image } from "./image";
import roleJson from "./rols.json";
import permJson from "./permisos.json";
import rolePerm from "./role_perm.json";

const pass = "$FBHp94DEyUq2";
const userAdm = "admin@admin.com";

async function truncts() {
    // 1. Tablas hijas que dependen de usuarios y de otras tablas
    await prisma.sSO_AUTH_AUTHORIZATION_CODES_T.deleteMany(); // depende de users + clients
    await prisma.sSO_AUTH_TOKEN_T.deleteMany();               // depende de users
    await prisma.sSO_AUTH_ACCESS_T.deleteMany();              // depende de users + roles

    // 2. Relaciones de roles y permisos
    await prisma.sSO_AUTH_ROLE_PERMISSIONS_T.deleteMany();    // depende de roles + permissions
    await prisma.sSO_AUTH_PERMISSIONS_T.deleteMany();
    await prisma.sSO_AUTH_ROLES_T.deleteMany();

    // 3. Relaciones de clients y grants
    await prisma.sSO_AUTH_CLIENT_GRANTS_T.deleteMany();       // depende de clients + grants
    await prisma.sSO_AUTH_GRANTS_T.deleteMany();
    await prisma.sSO_AUTH_CLIENTS_T.deleteMany();

    // 4. Ahora sí se puede borrar users (ya no tiene hijos)
    await prisma.sSO_AUTH_USERS_T.deleteMany();

    // 5. Tablas que users referenciaba como FK (id_user_bu, id_user_preference, id_user_2fa)
    await prisma.sSO_USER_BUSINESS_UNIT_T.deleteMany();
    await prisma.sSO_AUTH_USER_PREFERENCES_T.deleteMany();
    await prisma.sSO_AUTH_USER_2FA.deleteMany();

    // 6. Tablas de soporte de business units
    await prisma.sSO_BUSINESS_UNIT_BRANCHES_T.deleteMany();
    await prisma.sSO_BUSINESS_UNITS_T.deleteMany();
    await prisma.sSO_BUSINESS_LOCATIONS_T.deleteMany();

}
async function main() {
    await truncts();
    const result = await getStorageProvider().uploadImage(Buffer.from(image, 'base64'), { folder: "apps" });
    const pref = await prisma.sSO_AUTH_USER_PREFERENCES_T.create({
        data: {
            theme: "dark",
            lang: "en"
        }
    });

    const user = await prisma.sSO_AUTH_USERS_T.create({
        data: {
            username: "ADMIN",
            password: await hashPassword(pass),
            email: userAdm,
            name: "ADMIN",
            last_name: "ADMIN",
            second_last_name: "ADMIN",
            id_user_preference: pref.id
        }
    });

    console.log('\x1b[32m%s\x1b[0m', `✅ Usuario creado correctamente`);

    console.log('\x1b[34m%s\x1b[0m', `   📧 Email: ${user.email}`);
    console.log('\x1b[31m%s\x1b[0m', `   🔑 Password: ${pass}`);

    await prisma.sSO_AUTH_ROLES_T.createMany({
        data: roleJson
    });
    //IAM
    //APPLICATION
    //MDM
    await prisma.sSO_AUTH_PERMISSIONS_T.createMany({
        data: permJson
    });



    await prisma.sSO_AUTH_ROLE_PERMISSIONS_T.createMany({
        data: rolePerm
    });


    await prisma.sSO_AUTH_ACCESS_T.create({
        data: {
            user_id: user.user_id,
            role_id: "5c3f1a9e-8b2d-4f6a-9c1e-7d3b2f8a6c9d",
            created_by: "system"
        }
    });
    console.log('\x1b[32m%s\x1b[0m', `🛡️ Rol SSO Administrator asignado a ${user.email}`);



    const ssoClient = await prisma.sSO_AUTH_CLIENTS_T.create({
        data: {
            client_id: "1",
            app_name: "SSO",
            redirect_callback: "https://sso-ui-sandy.vercel.app/",
            scopes: "",
            app_type: "web",
            client_icon_url: result.publicId,
            created_by: "system"
        },
        select: {
            client_id: true,
            client_secret: true,
            app_name: true,
            app_type: true
        }
    });

    console.log('\x1b[32m%s\x1b[0m', `🔑 Client credentials generadas:`);
    console.log('\x1b[34m%s\x1b[0m', `   📱 APP: ${ssoClient.app_name}`);
    console.log('\x1b[34m%s\x1b[0m', `   🆔 CLIENT: ${ssoClient.client_id}`);
    console.log('\x1b[34m%s\x1b[0m', `   🔐 SECRET: ${ssoClient.client_secret}`);


    await prisma.sSO_AUTH_GRANTS_T.createMany({
        data: [
            { grants_name: "Authorization Code", description: "Para aplicaciones web con backend seguro", icon_text: "Globe", grant_code: "authorization_code" },
            { grants_name: "Client Credentials", description: "Para comunicación servidor a servidor", icon_text: "Lock", grant_code: "client_credentials" },
            { grants_name: "Resource Owner Password", description: "Para aplicaciones de confianza (no recomendado)", icon_text: "Key", grant_code: "password" },
            { grants_name: "Refresh Token", description: "Para renovar tokens de acceso automáticamente", icon_text: "Clock", grant_code: "refresh_token" }
        ]
    });

    const grants = await prisma.sSO_AUTH_GRANTS_T.findMany({
        where: {
            grant_code: {
                in: ['password', 'refresh_token', 'client_credentials']
            }
        },
        select: {
            id: true
        }
    });
    const app_grants = grants.map((x: any) => {
        return {
            client_id: ssoClient.client_id,
            grant_id: x.id
        }
    });
    await prisma.sSO_AUTH_CLIENT_GRANTS_T.createMany({
        data: app_grants
    });
    console.log('\x1b[32m%s\x1b[0m', `🔑 Grants asignados a ${ssoClient.app_name}`);
}

main()
    .catch(e => {
        console.error(e);

        process.exit(1);
    })
    .finally(() => prisma.$disconnect());