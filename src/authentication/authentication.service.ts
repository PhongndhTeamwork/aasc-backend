import { Injectable } from "@nestjs/common";
import { UserService } from "@model/user/user.service";
import { JwtService } from "@nestjs/jwt";


@Injectable()
export class AuthenticationService {
  constructor(private readonly jwtService: JwtService) {

  }

  async generateJwt(payload: any) {
    return this.jwtService.sign(payload);
  }
}
