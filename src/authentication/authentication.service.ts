import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";


@Injectable()
export class AuthenticationService {
  constructor(private readonly jwtService: JwtService) {

  }

  async generateJwt(payload: any) {
    return this.jwtService.sign(payload);
  }
}
