import { ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  @MinLength(5)
  oneTimeTokenId!: string;

  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  @MinLength(5)
  password!: string;

}
