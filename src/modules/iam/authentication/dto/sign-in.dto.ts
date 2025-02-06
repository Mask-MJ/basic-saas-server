import { MinLength } from 'class-validator';

export class SignInDto {
  /**
   * 账号
   * @example 'admin'
   */
  @MinLength(4)
  username: string;

  /**
   * 密码
   * @example '123456'
   */
  @MinLength(4)
  password: string;
}
