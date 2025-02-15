import { Module } from '@nestjs/common';
import { BitrixService } from './bitrix.service';
import { BitrixController } from './bitrix.controller';

@Module({
  controllers: [BitrixController],
  providers: [BitrixService],
})
export class BitrixModule {}
