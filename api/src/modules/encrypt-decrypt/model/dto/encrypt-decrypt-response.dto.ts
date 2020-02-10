
import { ApiModelProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class EncryptDecryptResponseDto {

    @ApiModelProperty({ required: false })
    @IsOptional()
    error: boolean;

    @ApiModelProperty({ required: false })
    @IsOptional()
    errorText: string;

    @ApiModelProperty({ required: false })
    @IsOptional()
    mnemonic: string;

}
