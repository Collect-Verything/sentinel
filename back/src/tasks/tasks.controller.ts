import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
    constructor(private readonly tasks: TasksService) {}

    @Post('enqueue')
    async enqueue(@Body() body: { seconds?: number }) {
        const { id } = await this.tasks.enqueue(body?.seconds ?? 20);
        return { id };
    }

    @Get('status/:id')
    async status(@Param('id') id: string) {
        return this.tasks.getStatus(id);
    }

    @Get('debug/counts')
    getCounts() {
        return this.tasks.getCounts();
    }
}
