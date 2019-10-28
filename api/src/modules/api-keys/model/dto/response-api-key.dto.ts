
import { ApiModelProperty } from '@nestjs/swagger';
import { ApiKey } from '@modules/api-keys/model/entity/api-key.entity';
import { ResponseContractDto } from '@modules/contracts/model/dto/response-contract.dto';

export class ResponseApiKeyDto implements ApiKey {

  @ApiModelProperty({ required: true })
  id: string;

  @ApiModelProperty({ required: true })
  name: string;

  @ApiModelProperty({ required: true })
  owner: string;

  @ApiModelProperty({ required: true })
  active: boolean;

  @ApiModelProperty({ required: true })
  description: string;

  @ApiModelProperty({ required: true })
  role: string;

  @ApiModelProperty({ required: true })
  contracts: ResponseContractDto[];

}
