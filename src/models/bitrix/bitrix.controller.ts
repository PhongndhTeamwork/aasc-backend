import { Body, Controller, Get, HttpException, Param, ParseIntPipe, Post, Query, Res } from "@nestjs/common";
import { BitrixService } from "./bitrix.service";
import { AuthInfoDto } from "@model/bitrix/dto/auth-info.dto";
import { PrismaService } from "@prisma/prisma.service";
import { Response } from "express";
import { CreateBankDto } from "@model/bitrix/dto/create-bank.dto";
import { CreateContactDto } from "@model/bitrix/dto/create-contact.dto";

@Controller("bitrix")
export class BitrixController {
  private readonly BITRIX_WEBHOOK: string;

  constructor(private readonly bitrixService: BitrixService, private readonly prisma: PrismaService) {
  }


  @Get("install-app")
  async installApp(
    @Body() body: AuthInfoDto,
    @Res() res: Response
  ) {
    const result = await this.bitrixService.installApp(body);
    if (result instanceof HttpException) {
      throw result;
    }

    res.redirect("https://aasc-frontend-ivory.vercel.app/method?accessToken="+result);
  }

  @Post("refresh-token")
  async refreshToken(@Body() body: { refreshToken: string }) {
    const result = await this.bitrixService.refreshToken(body.refreshToken);
    if (result instanceof HttpException) {
      throw result;
    }
    return result;
  }

  @Get("methods")
  async getAvailableMethods(@Query("accessToken") accessToken: string) {
    console.log(accessToken);
    const result = await this.bitrixService.getAvailableMethods(accessToken);
    if (result instanceof HttpException) {
      throw result;
    }
    return result;
  }

  @Post("contact")
  async createContact(@Body() body: CreateContactDto, @Query("accessToken") accessToken: string) {
    const result = await this.bitrixService.addContact(accessToken, body);
    if (result instanceof HttpException) {
      throw result;
    }
    return result;
  }

  @Get("contact")
  async getContacts(@Query("accessToken") accessToken: string) {
    const result = await this.bitrixService.getContacts(accessToken);
    if (result instanceof HttpException) {
      throw result;
    }
    return result;
  }

  @Post("bank-info/:contactId")
  async addContact(@Body() body: CreateBankDto, @Query("accessToken") accessToken: string, @Param("contactId", ParseIntPipe) contactId: number) {
    const result = await this.bitrixService.addBankDetailsWithRequisite(+contactId, accessToken, body);
    if (result instanceof HttpException) {
      throw result;
    }
    return result;
  }

  @Get("bank-info")
  async getRequisite(@Query("accessToken") accessToken: string) {
    const result = await this.bitrixService.getRequisite(accessToken);
    if (result instanceof HttpException) {
      throw result;
    }
    return result;
  }
}
