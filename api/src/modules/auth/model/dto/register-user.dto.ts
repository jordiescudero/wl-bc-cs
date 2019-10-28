import { ApiModelProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { UpdateUserDto } from './update-user.dto';

export class RegisterUserDto extends UpdateUserDto {

  @ApiModelProperty({ required: true })
  @IsEmail()
  email!: string;

}
