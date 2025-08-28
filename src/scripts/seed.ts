import prisma from "@config/prisma";
import { hashPassword } from "@utils/bcrypt";
import { getStorageProvider } from "@services/storage.factory";
import { image } from "./image";

const pass = "$FBHp94DEyUq2";
const userAdm = "admin@admin.com";

async function truncts() {
    await prisma.sSO_AUTH_ACCESS_T.deleteMany();
    await prisma.sSO_AUTH_ROLE_PERMISSIONS_T.deleteMany();
    await prisma.sSO_AUTH_PERMISSIONS_T.deleteMany();
    await prisma.sSO_AUTH_ROLES_T.deleteMany();
    await prisma.sSO_AUTH_USERS_T.deleteMany();

    await prisma.sSO_AUTH_CLIENT_GRANTS_T.deleteMany();
    await prisma.sSO_AUTH_GRANTS_T.deleteMany();
    await prisma.sSO_AUTH_CLIENTS_T.deleteMany();
    await prisma.sSO_AUTH_TOKEN_T.deleteMany();
}
async function main() {
    await truncts();
    const result = await getStorageProvider().uploadImage(Buffer.from(image, 'base64'), { folder: "apps" });
    const user = await prisma.sSO_AUTH_USERS_T.create({
        data: {
            username: "ADMIN",
            password: await hashPassword(pass),
            email: userAdm,
            name: "ADMIN",
            last_name: "ADMIN",
            second_last_name: "ADMIN"
        }
    });
    console.log('\x1b[32m%s\x1b[0m', `✅ Usuario creado correctamente`);

    console.log('\x1b[34m%s\x1b[0m', `   📧 Email: ${user.email}`);
    console.log('\x1b[31m%s\x1b[0m', `   🔑 Password: ${pass}`);

    await prisma.sSO_AUTH_ROLES_T.createMany({
        data: [
            { role_name: "SSO Administrator", role_code: "ADMIN_SSO", created_by: "system", is_system: true, description: "Responsable de la configuración y mantenimiento del sistema de autenticación centralizada (SSO)" },
            { role_name: "User Provisioner", role_code: "USER_PROVICIONE", created_by: "system", is_system: true, description: "Encargado de la creación, modificación y desactivación de cuentas de usuario en el sistema." },
            { role_name: "End User", role_code: "END_USER", created_by: "system", is_system: true, description: "Usuario final del sistema. Accede a las aplicaciones mediante SSO y utiliza los servicios disponibles según los permisos asignados." },
            { role_name: "Application Administrator", role_code: "APP_MANAGER", created_by: "system", is_system: true, description: "Administra la configuración de aplicaciones individuales dentro del ecosistema SSO. Define cómo se comporta cada app en términos de acceso, atributos, y permisos." },
            { role_name: "Identity & Access Manager", role_code: "IAM", created_by: "system", is_system: true, description: "Diseña y supervisa la estrategia general de identidad y acceso. Define políticas, revisa auditorías, y asegura el cumplimiento de normativas." }
        ]
    });
    //IAM
    //APPLICATION
    //MDM
    await prisma.sSO_AUTH_PERMISSIONS_T.createMany({
        data: [
            {
                perm_name: "Manage All SSO Settings",
                perm_code: "SSO_MANAGE_ALL",
                module: "SSO_CORE",
                action: "MANAGE",
                resource: "*",
                description: "Permite modificar cualquier configuración del sistema SSO.",
                IS_SYSTEM: true,
                created_by: "system"
            }
        ]
    });
    const permisions = await prisma.sSO_AUTH_PERMISSIONS_T.findMany({
        select: { id: true }
    })

    const findRolAdm = await prisma.sSO_AUTH_ROLES_T.findFirst({
        where: { role_code: "ADMIN_SSO" }
    });
    const asignPermision = permisions.map((x) => {
        return {
            role_id: findRolAdm?.id ?? "",
            permission_id: x.id,
            granted_by: "system"
        }
    });
    await prisma.sSO_AUTH_ROLE_PERMISSIONS_T.createMany({
        data: asignPermision
    });
    console.log('\x1b[32m%s\x1b[0m', `✅ Permisos asignados al rol 🛡️ ${findRolAdm?.role_name}`);

    await prisma.sSO_AUTH_ACCESS_T.create({
        data: {
            user_id: user.user_id,
            role_id: findRolAdm?.id ?? "",
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
                in: ['password', 'refresh_token']
            }
        },
        select: {
            id: true
        }
    });
    const app_grants = grants.map((x) => {
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