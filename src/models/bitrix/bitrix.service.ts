import { Injectable } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class BitrixService {
  private readonly BITRIX_WEBHOOK: string;
  constructor(private readonly configService : ConfigService) {
    this.BITRIX_WEBHOOK = this.configService.get<string>('BITRIX_WEBHOOK_CRM');
  }

  async callBitrix(method: string, params: any = {}): Promise<any> {
    try {
      const url = `${this.BITRIX_WEBHOOK}${method}`;
      const response = await axios.post(url, params);
      return response.data;
    } catch (error) {
      console.error('Bitrix24 API Error:', error.response?.data || error.message);
      throw new Error('Bitrix24 API Request Failed');
    }
  }


  // Example: Get list of users
  async getUsers() {
    return this.callBitrix('user.get');
  }

  // Example: Add a new lead
  async addLead(name: string, lastName: string, phone: string) {
    return this.callBitrix('crm.lead.add', {
      fields: {
        TITLE: `New Lead: ${name} ${lastName}`,
        NAME: name,
        LAST_NAME: lastName,
        PHONE: [{ VALUE: phone, VALUE_TYPE: 'WORK' }],
      },
    });
  }
}
