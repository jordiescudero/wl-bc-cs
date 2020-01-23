
import { ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReaderDto {

  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  readonly authHash: string;
  
}
