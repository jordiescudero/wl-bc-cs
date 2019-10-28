
import { ApiModelProperty } from '@nestjs/swagger';
import { ResponseApiKeyDto } from './response-api-key.dto';

export class ResponseApiKeyListDto  {
  @ApiModelProperty({ required: true })
  items: ResponseApiKeyDto[];
  @ApiModelProperty({ required: true })
  count: number;
  @ApiModelProperty({ required: true })
  limit: number;
  @ApiModelProperty({ required: true })
  offset: number;
}
