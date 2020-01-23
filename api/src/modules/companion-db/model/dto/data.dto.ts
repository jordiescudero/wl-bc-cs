import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsDate, IsEnum } from 'class-validator';

export class DataDto {

  @ApiModelProperty({ required: true })
  @IsString()
  name: string;

  @ApiModelProperty({ required: true })
  @IsString()
  email: string;

  @ApiModelProperty({ required: true })
  @IsDate()
  birth_date: string;

  @ApiModelProperty({ required: true })
  @IsString()
  gender: string;
  
  @ApiModelProperty({ required: true })
  @IsString()
  city: string;
  
}
