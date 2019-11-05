import { ApiModelProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SensiDataDto {

  @ApiModelProperty()
  name!: string;

  @ApiModelProperty()
  email!: string;

  @ApiModelProperty()
  birht_date!: string;

  @ApiModelProperty()
  gender!: string;
  
  @ApiModelProperty()
  city!: string;
}
