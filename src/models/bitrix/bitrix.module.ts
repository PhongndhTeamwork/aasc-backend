import { Module } from '@nestjs/common';
import { BitrixService } from './bitrix.service';
import { BitrixController } from './bitrix.controller';
import { PrismaService } from "@prisma/prisma.service";

@Module({
  controllers: [BitrixController],
  providers: [BitrixService, PrismaService],
})
export class BitrixModule {}
