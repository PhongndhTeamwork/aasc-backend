import { Body, Controller, Get, Post } from "@nestjs/common";
import { BitrixService } from './bitrix.service';

@Controller('bitrix')
export class BitrixController {
  private readonly BITRIX_WEBHOOK: string;
  constructor(private readonly bitrixService: BitrixService) {}

  @Get('users')
  async getUsers() {
    return this.bitrixService.getUsers();
  }

  @Post('lead')
  async createLead(
    @Body('name') name: string,
    @Body('lastName') lastName: string,
    @Body('phone') phone: string,
  ) {
    return this.bitrixService.addLead(name, lastName, phone);
  }


}
