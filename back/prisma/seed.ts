// prisma/seed.ts

import {PrismaClient} from "@prisma/client";


const prisma = new PrismaClient();

async function main() {
    const server1 = await prisma.server.upsert({
        where: {serverIp: '111.11.11'},
        update: {},
        create: {
            serverIp: '111.11.11',
            cores: 2,
            ramMb: 2048,
            storageGb: 40,
            sshUser: 'root',
            sshPassword: 'password',
            provider: 'ovh',
            ownerClientId: 0,
        },
    });

    const server2 = await prisma.server.upsert({
        where: {serverIp: '222.22.22'},
        update: {},
        create: {
            serverIp: '222.22.22',
            cores: 4,
            ramMb: 4096,
            storageGb: 60,
            sshUser: 'root',
            sshPassword: 'password',
            provider: 'scaleway',
            ownerClientId: 0,
        },
    });

    const server3 = await prisma.server.upsert({
        where: {serverIp: '333.33.33'},
        update: {},
        create: {
            serverIp: '333.33.33',
            cores: 8,
            ramMb: 8192,
            storageGb: 120,
            sshUser: 'root',
            sshPassword: 'password',
            provider: 'ionos',
            ownerClientId: 0,
        },
    });

    const config1 = await prisma.ansibleConfig.upsert({
        where: {name: "client-base-product"},
        update: {},
        create: {
            name: "client-base-product",
            editorFullname: "Admin_Canse",
            playbookPath: "/chemin/a/definir/plus/tard",
            variablesJson: "config/client/cosinus*jean+pormanov",
        }
    })

    const config2 = await prisma.ansibleConfig.upsert({
        where: {name: "admin-base-monitoring"},
        update: {},
        create: {
            name: "admin-base-monitoring",
            editorFullname: "Admin_Canse",
            playbookPath: "/chemin/a/definir/plus/tard",
            variablesJson: "config/admin/cosinus*jean+pormanov",
        }
    })

    console.log({server1, server2, server3, config1,config2});
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
