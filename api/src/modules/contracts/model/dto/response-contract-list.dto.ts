
import { ApiModelProperty } from '@nestjs/swagger';
import { ResponseContractDto } from './response-contract.dto';

export class ResponseContractListDto  {
  @ApiModelProperty({ required: true })
  items: ResponseContractDto[];
  @ApiModelProperty({ required: true })
  count: number;
  @ApiModelProperty({ required: true })
  limit: number;
  @ApiModelProperty({ required: true })
  offset: number;
}
