import { ApiModelProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DataDto {
  
  @ApiModelProperty()
  @IsString()
  dataHash!: string;
  
  @ApiModelProperty({ required: true })
  @IsString()
  data!: string;
  
}
