
import { ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ResponseContractDto } from '@modules/contracts/model/dto/response-contract.dto';

export class UpdateApiKeyDto {

  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  readonly description: string;

  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  readonly role: string;

  @ApiModelProperty()
  @IsOptional()
  readonly contracts: ResponseContractDto[];

}
