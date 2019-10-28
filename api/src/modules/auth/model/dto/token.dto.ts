import { ApiModelProperty } from '@nestjs/swagger';

export class TokenDto {

  @ApiModelProperty()
  expiresAt: Date;

  @ApiModelProperty()
  token: string;

}
