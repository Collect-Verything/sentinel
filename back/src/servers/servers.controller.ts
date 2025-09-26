import {Body, Controller, Delete, Get, Param, Post} from '@nestjs/common';
import {ServersService} from './servers.service';
import {SERVER_STATUS} from "./entities/enums";
import {CreateServerDto} from "./dto/create-server.dto";

@Controller('servers')
export class ServersController {
    constructor(private readonly serversService: ServersService) {
    }

    @Post()
    async createMany(@Body() payload: CreateServerDto[]) {
        return await this.serversService.createMany(payload);
    }

    @Get()
    findAll() {
        return this.serversService.findAll();
    }

    @Post("list-id")
    findByListId(@Body('selectedServerIds') selectedServerIds: number[]) {
        return this.serversService.findByListId(selectedServerIds);
    }

    @Get("by-config/:configurationType")
    findAllByConfig(@Param('configurationType') configurationType: SERVER_STATUS) {
        return this.serversService.findAllByConfig(configurationType);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.serversService.findOne(+id);
    }

    @Delete()
    async remove(@Body('ids') ids: number[]) {
        return this.serversService.remove(ids);
    }
}
