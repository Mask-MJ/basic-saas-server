import helmet from 'helmet';
import { mw } from 'request-ip';
import { NestExpressApplication } from '@nestjs/platform-express';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.DailyRotateFile({
        level: 'info',
        dirname: 'logs',
        filename: '%DATE%.log',
        datePattern: 'YYYY-MM-DD-HH',
      }),
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          nestWinstonModuleUtilities.format.nestLike(),
        ),
      }),
    ],
  });
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger,
  });
  // 获取环境变量
  const config = app.get(ConfigService);
  const PREFIX = config.get<string>('PREFIX') || 'api';
  const NAME = config.get<string>('APP_NAME');
  const PORT = config.get<number>('PORT', 3000);
  const { httpAdapter } = app.get(HttpAdapterHost);

  // 设置 api 访问前缀
  app.setGlobalPrefix(PREFIX);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter(logger));
  // prisma 异常过滤器
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  // web 安全，防常见漏洞
  app.use(helmet());

  const swaggerOptions = new DocumentBuilder()
    .setTitle(`${NAME} 接口文档`)
    .setDescription(`The ${NAME} API escription`)
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'bearer',
      description: '基于 JWT token',
    })
    .build();
  const document = SwaggerModule.createDocument(app, swaggerOptions);
  // 项目依赖当前文档功能，最好不要改变当前地址
  // 生产环境使用 nginx 可以将当前文档地址 屏蔽外部访问
  SwaggerModule.setup(`doc`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: `${NAME} API Docs`,
  });
  // 获取真实 ip
  app.use(mw({ attributeName: 'ip' }));
  await app.listen(PORT);
  console.log(
    `服务启动成功 `,
    '\n',
    '服务地址',
    `http://localhost:${PORT}/${PREFIX}/`,
    '\n',
    '文档地址',
    `http://localhost:${PORT}/doc/`,
  );
}
bootstrap().catch((err) => {
  console.error(err);
});
