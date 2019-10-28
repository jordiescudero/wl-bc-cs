import { ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateUserDto {

    @ApiModelProperty({ required: true })
    @IsNotEmpty()
    firstName!: string;

    @ApiModelProperty({ required: true })
    @IsNotEmpty()
    lastName!: string;
}
