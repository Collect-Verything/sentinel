import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const server1 = await prisma.server.upsert({
        where: { ip: '111.11.11.111' },
        update: {},
        create: {
            ip: '111.11.11.111',
            range: 1,
            password: "password",
            configured: false,
            ownerClientId:0
        },
    });

    const server2 = await prisma.server.upsert({
        where: { ip: '222.22.22.22' },
        update: {},
        create: {
            ip: '222.22.22.22',
            range: 1,
            password: "password",
            configured: false,
            ownerClientId:0
        },
    });

    const server3 = await prisma.server.upsert({
        where: { ip: '333.33.33.33' },
        update: {},
        create: {
            ip: '333.33.33.33',
            range: 1,
            password: "password",
            configured: false,
            ownerClientId:0
        },
    });

    console.log({ server1, server2, server3 });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

