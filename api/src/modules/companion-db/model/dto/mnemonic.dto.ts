import { ApiModelProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MnemonicDto {

  @ApiModelProperty()
  @IsString()
  mnemonic: string;
  
}
