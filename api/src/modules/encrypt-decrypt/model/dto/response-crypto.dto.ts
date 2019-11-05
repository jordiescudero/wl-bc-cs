
import { ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ResponseCryptoDto {

  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  readonly text: string;

}
