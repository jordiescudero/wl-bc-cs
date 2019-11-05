
import { ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RequestCryptoDto {

  @ApiModelProperty({ required: false })
  @IsNotEmpty()
  readonly authHash: string;

  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  readonly text: string;

}
