
import { ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { UpdateContractDto } from './update-contract.dto';

export class CreateContractDto extends UpdateContractDto {
  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  readonly name: string;
  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  readonly address: string;
}
