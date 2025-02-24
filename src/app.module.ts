import { HttpStatus, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  CustomPrismaModule,
  providePrismaClientExceptionFilter,
} from 'nestjs-prisma';
import { validate } from 'src/common/validate/env.validation';
import { extendedPrismaClient } from 'src/common/pagination/prisma.extension';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RouterModule } from '@nestjs/core';
import { IamModule } from 'src/modules/iam/iam.module';
import { SystemModule } from './modules/system/system.module';

const envFilePath = [`.env.${process.env.NODE_ENV || `development`}`, '.env'];

@Module({
  imports: [
    ConfigModule.forRoot({ validate, isGlobal: true, envFilePath }),
    CustomPrismaModule.forRootAsync({
      isGlobal: true,
      name: 'PrismaService',
      useFactory: () => extendedPrismaClient,
    }),
    EventEmitterModule.forRoot(),
    RouterModule.register([
      { path: 'system', module: SystemModule },
      // { path: 'monitor', module: MonitorModule },
    ]),
    IamModule,
    SystemModule,
    // MonitorModule,
  ],
  controllers: [],
  providers: [
    providePrismaClientExceptionFilter({
      // Prisma Error Code: HTTP Status Response
      P2000: HttpStatus.BAD_REQUEST,
      P2002: HttpStatus.CONFLICT,
      P2025: HttpStatus.NOT_FOUND,
    }),
  ],
})
export class AppModule {}
