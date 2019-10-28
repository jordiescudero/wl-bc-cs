
import { ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateContractDto {
  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  readonly public: boolean;

  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  readonly description: string;
}
