import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ServersModule } from './servers/servers.module';
import { ConfigsModule } from './configs/configs.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [PrismaModule, ServersModule, ConfigsModule, TasksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
