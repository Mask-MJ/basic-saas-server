import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Headers,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiHeader } from '@nestjs/swagger';
import { Roles } from 'src/modules/iam/authorization/decorators/roles.decorator';
import { SignInEntity } from './authentication.entity';

@ApiTags('登录认证')
@Auth(AuthType.None)
@Roles()
@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('sign-up')
  @ApiOperation({ summary: '注册' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '注册成功' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '用户名已存在' })
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  @ApiOperation({ summary: '登录' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '登录成功',
    type: SignInEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '用户名或密码错误',
  })
  @ApiHeader({ name: 'X-Real-IP', description: '用户 IP', required: false })
  async signIn(
    @Body() signInDto: SignInDto,
    @Headers('X-Real-IP') ip?: string,
  ) {
    return this.authService.signIn(signInDto, ip);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  @ApiOperation({ summary: '刷新令牌' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
    type: SignInEntity,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: '令牌无效' })
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }
}
