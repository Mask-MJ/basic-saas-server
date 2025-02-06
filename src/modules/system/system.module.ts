// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import jwtConfig from '../iam/config/jwt.config';
// import { ConfigModule } from '@nestjs/config';
// import { HashingService } from '../iam/hashing/hashing.service';
// import { BcryptService } from '../iam/hashing/bcrypt.service';
// import { MinioService } from 'src/common/minio/minio.service';
// import { RedisStorage } from 'src/common/redis/redis.storage';
// import { BullModule } from '@nestjs/bullmq';
// import { UserConsumer } from './user/user.processor';
// import { systemControllers, systemProviders } from './index';

// @Module({
//   imports: [
//     JwtModule.registerAsync(jwtConfig.asProvider()),
//     ConfigModule.forFeature(jwtConfig),
//     BullModule.registerQueue({ name: 'user' }),
//   ],
//   controllers: systemControllers,
//   providers: [
//     { provide: HashingService, useClass: BcryptService },
//     MinioService,
//     RedisStorage,
//     UserConsumer,
//     ...systemProviders,
//   ],
// })
// export class SystemModule {}
