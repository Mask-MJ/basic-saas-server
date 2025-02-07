import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { Redis } from 'ioredis';

export class InvalidatedRefreshTokenError extends Error {}

@Injectable()
export class RefreshTokenIdsStorage
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  @Inject(ConfigService)
  private configService: ConfigService;

  private redisClient: Redis;

  onApplicationBootstrap() {
    const host = this.configService.get('REDIS_HOST');
    const port = this.configService.get('REDIS_PORT');
    const password = this.configService.get('REDIS_PASSWORD');
    console.log(host);
    this.redisClient = new Redis({ host, port, password, lazyConnect: true });
  }

  // 当程序退出时, 关闭 redis 客户端
  onApplicationShutdown() {
    return this.redisClient.quit();
  }

  // 插入
  async insert(user: User, tokenId: string): Promise<void> {
    // 通过 redis 的 hmset 方法插入 user 和 token
    await this.redisClient.hmset(
      this.getKey(user.id),
      'tokenId',
      tokenId,
      'id',
      user.id,
      'user',
      JSON.stringify(user),
    );
  }
  // 验证
  async validate(userId: number, tokenId: string): Promise<boolean> {
    // 从 redis 中取出 id 对应的 token , 和传入的 token 做对比
    const storedId = (
      await this.redisClient.hmget(this.getKey(userId), 'tokenId')
    )[0];
    if (storedId !== tokenId) {
      throw new InvalidatedRefreshTokenError();
    }
    return storedId === tokenId;
  }
  // 无效化 通过删除 id 来使得 token 无效
  async invalidate(userId: number): Promise<void> {
    // 删除 redis 中 id 对应的数据
    // 如果有人使用过期的令牌来查询, validate 将返回 false, 因为数据库中不再存在该用户id
    await this.redisClient.del(this.getKey(userId));
  }
  // 通过用户 id 获取 key
  private getKey(userId: number): string {
    return `user-${userId}`;
  }
}
