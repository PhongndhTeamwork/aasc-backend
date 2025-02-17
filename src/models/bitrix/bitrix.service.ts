import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { PrismaService } from "@prisma/prisma.service";
import { AuthInfoDto } from "@model/bitrix/dto/auth-info.dto";
import { CreateContactDto } from "@model/bitrix/dto/create-contact.dto";
import { CreateBankDto } from "@model/bitrix/dto/create-bank.dto";

@Injectable()
export class BitrixService {
  private readonly tokenUrl = "https://oauth.bitrix.info/oauth/token/";
  private readonly bitrixDomain: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(private readonly configService: ConfigService, private readonly prisma: PrismaService) {
    this.bitrixDomain = this.configService.get<string>("BITRIX_DOMAIN");
    this.clientId = this.configService.get<string>("BITRIX_CLIENT_ID");
    this.clientSecret = this.configService.get<string>("BITRIX_CLIENT_SECRET");
    this.redirectUri = this.configService.get<string>("BITRIX_REDIRECT_URI");
  }

  async installApp(body: AuthInfoDto) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          memberId: body.member_id
        }
      });
      if (!user) {
        await this.prisma.user.create({
          data: {
            memberId: body.member_id,
            refreshToken: body.REFRESH_ID,
            accessToken: body.AUTH_ID
          }
        });
      } else {
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            refreshToken: body.REFRESH_ID,
            accessToken: body.AUTH_ID
          }
        });
      }
      return body.AUTH_ID;
    } catch (e) {
      return new BadRequestException(e?.message);
    }
  }

  async getAvailableMethods(accessToken: string) {
    const url = `https://${this.bitrixDomain}/rest/methods.json`;
    console.log(accessToken);
    try {
      const response = await axios.get(url, {
        params: {
          auth: accessToken,
          full: true
        }
      });
      return { methods: response.data.result };
    } catch (error) {
      if (error?.response?.status !== HttpStatus.UNAUTHORIZED) return new HttpException(error?.response?.data?.error || "Something went wrong", error?.response?.status || 500);
      try {
        const newAccessToken = await this.getNewAccessToken(accessToken);
        if (newAccessToken instanceof HttpException) return newAccessToken;
        const response = await axios.get(url, {
          params: {
            auth: newAccessToken,
            full: true
          }
        });
        return { methods: response.data.result, accessToken: newAccessToken };
      } catch (e) {
        return new BadRequestException(e?.message);
      }
    }
  }

  async getContacts(accessToken: string) {
    const url = `https://${this.bitrixDomain}/rest/crm.contact.list`;
    try {
      const res = await axios.get(url, {
        params: {
          auth: accessToken,
          select: ["ID", "NAME", "PHONE", "EMAIL", "ADDRESS", "WEB"]
        }
      });
      return {
        contacts: res.data.result
      };
    } catch (error) {
      if (error?.response?.status !== HttpStatus.UNAUTHORIZED) return new HttpException(error?.response?.data?.error || "Something went wrong", error?.response?.status || 500);
      try {
        const newAccessToken = await this.getNewAccessToken(accessToken);
        if (newAccessToken instanceof HttpException) return newAccessToken;
        const res = await axios.get(url, {
          params: {
            auth: accessToken,
            select: ["ID", "NAME", "PHONE", "EMAIL", "ADDRESS", "WEB"]
          }
        });
        return {
          contacts: res.data.result,
          accessToken: newAccessToken
        };
      } catch (e) {
        return new BadRequestException(e?.message);
      }
    }
  }

  async addContact(accessToken: string, body: CreateContactDto) {
    const url = `https://${this.bitrixDomain}/rest/crm.contact.add`;
    try {
      await axios.post(url, {
        auth: accessToken,
        fields: {
          NAME: body.name,
          PHONE: [{ VALUE: body.phone, VALUE_TYPE: "WORK" }],
          EMAIL: [{ VALUE: body.email, VALUE_TYPE: "WORK" }],
          ADDRESS: body.address,
          WEB: [{ VALUE: body.website, VALUE_TYPE: "WORK" }]
        }
      });
      return {
        message: "Create contact successfully"
      };
    } catch (error) {
      if (error?.response?.status !== HttpStatus.UNAUTHORIZED) return new HttpException(error?.response?.data?.error || "Something went wrong", error?.response?.status || 500);
      try {
        const newAccessToken = await this.getNewAccessToken(accessToken);
        if (newAccessToken instanceof HttpException) return newAccessToken;
        await axios.post(url, {
          auth: accessToken,
          fields: {
            NAME: body.name,
            PHONE: [{ VALUE: body.phone, VALUE_TYPE: "WORK" }],
            EMAIL: [{ VALUE: body.email, VALUE_TYPE: "WORK" }],
            ADDRESS: body.address,
            WEB: [{ VALUE: body.website, VALUE_TYPE: "WORK" }]
          }
        });
        return {
          message: "Create contact successfully",
          accessToken: newAccessToken
        };
      } catch (e) {
      }
    }


  }

  async getRequisite(accessToken: string) {
    const url = `https://${this.bitrixDomain}/rest/crm.requisite.bankdetail.list`;
    try {
      const res = await axios.get(url, {
        params: {
          auth: accessToken,
          select: ["*"]
        }
      });
      return {
        requisites: res.data.result,
      }
    } catch (error) {
      if (error?.response?.status !== HttpStatus.UNAUTHORIZED) return new HttpException(error?.response?.data?.error || "Something went wrong", error?.response?.status || 500);
      try {
        const newAccessToken = await this.getNewAccessToken(accessToken);
        if (newAccessToken instanceof HttpException) return newAccessToken;
        const res = await axios.get(url, {
          params: {
            auth: accessToken,
            select: ["*"]
          }
        });
        return {
          requisites: res.data.result,
          accessToken: newAccessToken
        }
      } catch (e) {
        return new BadRequestException(e?.message);
      }
    }
  }

  async addBankDetailsWithRequisite(contactId: number, accessToken: string, body: CreateBankDto) {
    const requisiteUrl = `https://${this.bitrixDomain}/rest/crm.requisite.list`;
    try {
      let requisiteId = null;
      const requisiteRes = await axios.get(requisiteUrl, {
        params: {
          auth: accessToken,
          filter: { ENTITY_TYPE_ID: 3, ENTITY_ID: contactId } // 3 = Contact
        }
      });

      if (requisiteRes.data.result.length > 0) {
        requisiteId = requisiteRes.data.result[0].ID; // Use existing requisite
      } else {
        const createRequisiteUrl = `https://${this.bitrixDomain}/rest/crm.requisite.add`;
        const createRequisiteRes = await axios.post(createRequisiteUrl, null, {
          params: {
            auth: accessToken,
            fields: {
              ENTITY_TYPE_ID: 3, // Contact
              ENTITY_ID: contactId,
              PRESET_ID: 1, // Default preset
              NAME: `Requisite for Contact ${contactId}`
            }
          }
        });

        if (!createRequisiteRes.data.result) {
          return new BadRequestException("Failed to create requisite");
        }
        requisiteId = createRequisiteRes.data.result; // Get new requisite ID
      }

      // Add bank details to the requisite
      const addBankUrl = `https://${this.bitrixDomain}/rest/crm.requisite.bankdetail.add`;
      const bankRes = await axios.post(addBankUrl, null, {
        params: {
          auth: accessToken,
          fields: {
            ENTITY_ID: requisiteId,
            NAME: body.bankName,
            RQ_BANK_NAME: body.bankName,
            RQ_ACC_NUM: body.bankAccount
          }
        }
      });

      return {
        requisiteId,
        bankDetailId: bankRes.data.result
      };
    } catch (error) {
      if (error?.response?.status !== HttpStatus.UNAUTHORIZED) return new HttpException(error?.response?.data?.error || "Something went wrong", error?.response?.status || 500);
      try {
        const newAccessToken = await this.getNewAccessToken(accessToken);
        if (newAccessToken instanceof HttpException) return newAccessToken;
        let requisiteId = null;
        const requisiteRes = await axios.get(requisiteUrl, {
          params: {
            auth: accessToken,
            filter: { ENTITY_TYPE_ID: 3, ENTITY_ID: contactId } // 3 = Contact
          }
        });

        if (requisiteRes.data.result.length > 0) {
          requisiteId = requisiteRes.data.result[0].ID; // Use existing requisite
        } else {
          const createRequisiteUrl = `https://${this.bitrixDomain}/rest/crm.requisite.add`;
          const createRequisiteRes = await axios.post(createRequisiteUrl, null, {
            params: {
              auth: accessToken,
              fields: {
                ENTITY_TYPE_ID: 3, // Contact
                ENTITY_ID: contactId,
                PRESET_ID: 1, // Default preset
                NAME: `Requisite for Contact ${contactId}`
              }
            }
          });

          if (!createRequisiteRes.data.result) {
            return new BadRequestException("Failed to create requisite");
          }
          requisiteId = createRequisiteRes.data.result; // Get new requisite ID
        }

        // Add bank details to the requisite
        const addBankUrl = `https://${this.bitrixDomain}/rest/crm.requisite.bankdetail.add`;
        const bankRes = await axios.post(addBankUrl, null, {
          params: {
            auth: accessToken,
            fields: {
              ENTITY_ID: requisiteId,
              NAME: body.bankName,
              RQ_BANK_NAME: body.bankName,
              RQ_ACC_NUM: body.bankAccount
            }
          }
        });

        return {
          accessToken: newAccessToken,
          requisiteId,
          bankDetailId: bankRes.data.result
        };
      } catch (e) {
        return new BadRequestException(e?.message);
      }
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const response = await axios.post(this.tokenUrl, null, {
        params: {
          grant_type: "refresh_token",
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          refresh_token: refreshToken
        }
      });

      //* Save to database
      const user = await this.prisma.user.findFirst({
        where: {
          memberId: response.data.member_id
        }
      });
      if (!user) {
        return new NotFoundException("Cannot find user to refresh token");
      }
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          refreshToken: response.data.refresh_token,
          accessToken: response.data.access_token
        }
      });
      return response.data;
    } catch (error) {
      return new HttpException(
        error.response?.data || "Failed to refresh token",
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  private async getNewAccessToken(accessToken: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          accessToken: accessToken
        }
      });
      if (!user) {
        return new NotFoundException("Cannot find user to refresh token");
      }
      const refresh = await this.refreshToken(user.refreshToken);
      if (refresh instanceof HttpException) {
        return refresh;
      }
      await this.prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          refreshToken: refresh.refresh_token,
          accessToken: refresh.access_token
        }
      });
      return refresh.access_token;
    } catch (e) {
      return new BadRequestException(e?.message);
    }
  }

}
