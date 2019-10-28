import { ApiModelProperty } from '@nestjs/swagger';

export class ResponseUserDto {

    @ApiModelProperty()
    firstName: string;

    @ApiModelProperty()
    lastName: string;

    @ApiModelProperty()
    email: string;

    @ApiModelProperty()
    role: string;
}
