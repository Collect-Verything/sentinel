import { Module } from '@nestjs/common';
import { ConfigsService } from './configs.service';
import { ConfigsController } from './configs.controller';
import {PrismaModule} from "../prisma/prisma.module";

@Module({
  controllers: [ConfigsController],
  providers: [ConfigsService],
    imports: [PrismaModule],
})
export class ConfigsModule {}
