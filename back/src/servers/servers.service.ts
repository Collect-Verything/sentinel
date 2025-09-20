import {Injectable} from '@nestjs/common';
import {UpdateServerDto} from './dto/update-server.dto';
import {PrismaService} from "../prisma/prisma.service";
import {SERVER_STATUS} from "./entities/enums";

// TODO :
// - Typage
// - Dto security, unique, type ....

@Injectable()
export class ServersService {
    constructor(private prisma: PrismaService) {
    }

    async createMany(items: any[]) {
        const cleanList = items.map((item) => ({
            ...item,
            isSsl: item.isSsl === 'true' || item.isSsl === true,
            sshPort: item.sshPort ? Number(item.sshPort) : 22,
            cores: item.cores ? Number(item.cores) : 0,
            ramMb: item.ramMb ? Number(item.ramMb) : 0,
            storageGb: item.storageGb ? Number(item.storageGb) : 0,
            ownerClientId: item.ownerClientId ? Number(item.ownerClientId) : 0,
            batchId: item.batchId ? Number(item.batchId) : 0,
            ansibleConfigId:  item.ansibleConfigId ? Number(item.ansibleConfigId) : 0,
        }));

        const created = await this.prisma.$transaction(
            cleanList.map((server) => this.prisma.server.create({ data: server })),
        );

        return created.map((c)=>c.id)
    }

    findAll() {
        return this.prisma.server.findMany();
    }

    findAllByConfig(configurationType: SERVER_STATUS) {
        return this.prisma.server.findMany({where: {status: configurationType}});
    }

    findOne(id: number) {
        return `This action returns a #${id} server`;
    }

    update(id: number, updateServerDto: UpdateServerDto) {
        return `This action updates a #${id} server`;
    }

    async remove(serversToDelete: number[]) {
        return this.prisma.server.deleteMany({
            where: {
                id: { in: serversToDelete },
            },
        });
    }
}

