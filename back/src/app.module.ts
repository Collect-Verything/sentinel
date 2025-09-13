import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ServersModule } from './servers/servers.module';

@Module({
  imports: [PrismaModule, ServersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
