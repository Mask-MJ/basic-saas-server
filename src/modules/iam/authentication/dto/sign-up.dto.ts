import { IntersectionType, PickType } from '@nestjs/swagger';
import { CreateUserDto } from 'src/modules/system/user/user.dto';

export class SignUpDto extends IntersectionType(
  PickType(CreateUserDto, ['account', 'nickname', 'password']),
) {}
