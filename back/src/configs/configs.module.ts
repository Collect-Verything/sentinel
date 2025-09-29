import { Module } from '@nestjs/common';
import { ConfigsService } from './configs.service';
import { ConfigsController } from './configs.controller';
import {PrismaModule} from "../prisma/prisma.module";
import {AnsibleRunnerService} from "./ansible-runner.service";

@Module({
  controllers: [ConfigsController],
  providers: [ConfigsService,AnsibleRunnerService],
    imports: [PrismaModule],
})
export class ConfigsModule {}
