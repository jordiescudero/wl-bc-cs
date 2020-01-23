import { ApiModelProperty } from '@nestjs/swagger';
import { DataDto } from './data.dto';
import { IsArray } from 'class-validator';

export class DataListDto {

  @ApiModelProperty({ type: DataDto, isArray: true })
  @IsArray()
  data: DataDto[];

}
