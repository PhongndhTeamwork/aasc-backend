import { Controller, Get, Query, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiTags } from "@nestjs/swagger";
import { PaginationInterceptor } from "@interceptor/pagination.interceptor";



@Controller("user")
@ApiTags("User")
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @Get()
  // @UseGuards(JwtAuthGuard)
  @UseInterceptors(PaginationInterceptor)
  async getAllUser(@Query("pageNumber") _pageNumber?: string,
                   @Query("pageSize") _pageSize?: string,
                   @Query("email") email?: string,
                   @Query("orderBy") orderBy?: string
  ): Promise<any> {
    return this.userService.users({
      // cursor: { id: parseInt(cursor, 10) } : undefined,
      where: email && email.trim() !== "" ? {
        account: {
          contains: email
        }
      } : undefined,
      orderBy: orderBy === "name" || orderBy === "id" ? { [orderBy]: "asc" } : undefined
    });
  }

  @Get("/get")
  async getSomething(){
    return "GET";
  }

}
