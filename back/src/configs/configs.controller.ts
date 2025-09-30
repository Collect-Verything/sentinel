import {Body, Controller, Delete, Get, Header, Param, Patch, Post} from '@nestjs/common';
import {ConfigsService} from './configs.service';
import {CreateConfigDto} from './dto/create-config.dto';
import {UpdateConfigDto} from './dto/update-config.dto';

@Controller('configs')
export class ConfigsController {
    constructor(private readonly configsService: ConfigsService) {
    }

    @Post()
    create(@Body() createConfigDto: CreateConfigDto) {
        return this.configsService.create(createConfigDto);
    }

    @Post('lunch')
    configuration(@Body() configSelected: number, listId: number[]) {
        return this.configsService.configuration(configSelected, listId);
    }


    // curl -X POST http://localhost:3001/configs/ping
    @Post('ping')
    @Header('Content-Type', 'text/plain; charset=utf-8')
    async ping(): Promise<string> {
        const r = await this.configsService.runPingDemo();
        const out = r.stdout || r.stderr || '';
        return out;
    }

    @Get()
    findAll() {
        return this.configsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.configsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateConfigDto: UpdateConfigDto) {
        return this.configsService.update(+id, updateConfigDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.configsService.remove(+id);
    }
}
