import { ApiModelProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RememberDto {

  @ApiModelProperty({ required: true })
  @IsEmail()
  email!: string;
}
