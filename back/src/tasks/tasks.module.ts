import {Module} from '@nestjs/common';
import {TasksService} from './tasks.service';
import {TasksController} from './tasks.controller';
import {ServersModule} from "../servers/servers.module";

@Module({
    imports: [ServersModule],
    controllers: [TasksController],
    providers: [TasksService],
    exports: [TasksService],
})
export class TasksModule {
}
