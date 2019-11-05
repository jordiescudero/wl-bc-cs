
import { ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CompanyDto {

  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  readonly authHash: string;
}
