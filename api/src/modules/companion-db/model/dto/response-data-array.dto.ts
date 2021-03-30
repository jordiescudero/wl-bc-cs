import { ApiModelProperty } from '@nestjs/swagger';
import { DataDto } from './data.dto';
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class ResponseDataArrayDto {

  @ApiModelProperty({ type: DataDto, isArray: true })
  @IsArray()
  items: DataDto[];

  @ApiModelProperty()
  @IsNotEmpty()
  @IsNumber()
  count: number;

}
