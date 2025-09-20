import {Injectable} from '@nestjs/common';
import {UpdateServerDto} from './dto/update-server.dto';
import {PrismaService} from "../prisma/prisma.service";
import {SERVER_STATUS} from "./entities/enums";
import {CreateServerDto} from "./dto/create-server.dto";

// TODO :
// - Typage
// - Dto security, unique, type ....

@Injectable()
export class ServersService {
    constructor(private prisma: PrismaService) {
    }

    async createMany(listServer: CreateServerDto[]) {
        try {
            const created = await this.prisma.$transaction(
                listServer.map((server: any) => this.prisma.server.create({data: server})),
            );
            return created.map((c) => c.id)
        } catch (err) {
            return Promise.reject(err);
        }
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
                id: {in: serversToDelete},
            },
        });
    }
}

