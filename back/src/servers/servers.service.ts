import {Injectable} from '@nestjs/common';
import {CreateServerDto} from './dto/create-server.dto';
import {UpdateServerDto} from './dto/update-server.dto';
import {PrismaService} from "../prisma/prisma.service";
import {SERVER_STATUS} from "./entities/enums";

@Injectable()
export class ServersService {
    constructor(private prisma: PrismaService) {
    }

    create(createServerDto: CreateServerDto) {
        console.log("------------");
        console.log(createServerDto);
        console.log("------------");
        return 'This action adds a new server';
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

    remove(id: number) {
        return `This action removes a #${id} server`;
    }
}

