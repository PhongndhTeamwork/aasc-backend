import { Module } from "@nestjs/common";
import { UserModule } from "@model/user/user.module";
import { BitrixModule } from './bitrix/bitrix.module';


@Module({
  imports: [UserModule, BitrixModule],
  exports: [UserModule]
})
export class ModelModule {
}
