import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as session from "express-session";
import * as passport from "passport";


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  const config = new DocumentBuilder()
    .setTitle("CSM API")
    .setDescription("The CMS API description")
    .addBearerAuth()
    .build()
  ;
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  app.enableCors({
    origin: ["https://aasc-frontend-ivory.vercel.app", "http://localhost:7000","https://dinhphong.bitrix24.vn"],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });
  await app.listen(8000);
}

bootstrap().then(() => {
  console.log("App is running on port 8000");
});
