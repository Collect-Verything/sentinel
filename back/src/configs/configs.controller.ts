import {Body, Controller, Delete, Get, Param, Patch, Post} from '@nestjs/common';
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
