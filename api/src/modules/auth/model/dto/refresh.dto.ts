import { ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RefreshDto {

  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  accessToken!: string;

  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  refreshToken!: string;
}
