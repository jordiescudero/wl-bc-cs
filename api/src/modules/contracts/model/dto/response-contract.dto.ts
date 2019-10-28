
import { Contract } from '@modules/contracts/model/interfaces/contract.interface';
import { ApiModelProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ResponseContractDto implements Contract {
  @Transform(value => value.toString())
  @ApiModelProperty({ required: true })
  id: string;
  @ApiModelProperty({ required: true })
  name: string;
  @ApiModelProperty({ required: true })
  address: string;
  @ApiModelProperty({ required: true })
  description: string;
  @ApiModelProperty({ required: true })
  public: boolean;
  @ApiModelProperty({ required: true })
  owner: boolean;
}
