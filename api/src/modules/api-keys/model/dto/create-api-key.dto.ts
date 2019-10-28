
import { ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { UpdateApiKeyDto } from './update-api-key.dto';

export class CreateApiKeyDto extends UpdateApiKeyDto {

  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  readonly name: string;

}
