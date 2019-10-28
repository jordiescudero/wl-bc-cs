import { ApiModelProperty } from '@nestjs/swagger';
import { TokenDto } from './token.dto';

export class ResponseTokenDto {

  @ApiModelProperty()
  accessToken: TokenDto;

  @ApiModelProperty()
  refreshToken: TokenDto;

}
