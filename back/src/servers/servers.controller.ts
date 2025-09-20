import {Body, Controller, Delete, Get, Param, Patch, Post} from '@nestjs/common';
import {ServersService} from './servers.service';
import {UpdateServerDto} from './dto/update-server.dto';
import {SERVER_STATUS} from "./entities/enums";
import {CreateServerDto} from "./dto/create-server.dto";

@Controller('servers')
export class ServersController {
    constructor(private readonly serversService: ServersService) {
    }

    @Post()
    async createMany(@Body() payload: CreateServerDto[]) {
        const res = await this.serversService.createMany(payload);
        return res;
    }

    @Get()
    findAll() {
        return this.serversService.findAll();
    }

    @Get("by-config/:configurationType")
    findAllByConfig(@Param('configurationType') configurationType: SERVER_STATUS) {
        return this.serversService.findAllByConfig(configurationType);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.serversService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateServerDto: UpdateServerDto) {
        return this.serversService.update(+id, updateServerDto);
    }

    @Delete()
    async remove(@Body('serversToDelete') serversToDelete: number[]) {
        return this.serversService.remove(serversToDelete);
    }
}
