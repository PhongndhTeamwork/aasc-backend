import { Controller } from "@nestjs/common";
import { AuthenticationService } from "./authentication.service";
import { ApiTags } from "@nestjs/swagger";
import { UserService } from "@model/user/user.service";

@Controller("auth")
@ApiTags("Authentication")
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService, private readonly userService: UserService) {
  }

}
