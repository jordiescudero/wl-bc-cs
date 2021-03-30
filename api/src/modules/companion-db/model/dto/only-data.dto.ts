import { ApiModelProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class OnlyDataDto {
  
  @ApiModelProperty({ required: true })
  @IsString()
  data!: string;
  
}
