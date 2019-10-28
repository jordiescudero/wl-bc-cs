import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Delete,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './model/dto/create-contract.dto';
import { Roles } from '@common/decorators/roles.decorator';
import { ApiBearerAuth, ApiOkResponse, ApiImplicitQuery } from '@nestjs/swagger';
import { User } from '@common/decorators/user.decorator';
import { UpdateContractDto } from './model/dto/update-contract.dto';
import { ResponseContractDto } from './model/dto/response-contract.dto';
import { OptionalParseIntPipe } from '@common/pipes/optional-parse-int.pipe';
import { ResponseContractListDto } from './model/dto/response-contract-list.dto';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @Roles('user')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResponseContractDto})
  async create(@User('id') userId: string, @Body() createContractDto: CreateContractDto): Promise<ResponseContractDto> {
    return await this.contractsService.create(userId, createContractDto);
  }

  @Put(':contractId')
  @Roles('user')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResponseContractDto})
  async update(@User('id') userId: string,
               @Param('contractId') contractId: string,
               @Body() updateApiKeyDto: UpdateContractDto): Promise<ResponseContractDto> {
    return await this.contractsService.update(userId, contractId, updateApiKeyDto);

  }

  @Delete(':contractId')
  @Roles('user')
  @ApiBearerAuth()
  async delete(@User('id') userId: string, @Param('contractId') contractId: string) {
    await this.contractsService.delete(userId, contractId);
  }

  @Get()
  @Roles('user')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResponseContractListDto } )
  @ApiImplicitQuery({
    name: 'q',
    required: false,
    type: String,
  })
  @ApiImplicitQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiImplicitQuery({
    name: 'offset',
    required: false,
    type: Number,
  })
  async findAll(@User('id') userId: string, @Query('offset', new OptionalParseIntPipe('0')) offset: number,
                @Query('limit', new OptionalParseIntPipe('10')) limit: number, @Query('q') q: string = ''): Promise<ResponseContractListDto> {
    return await this.contractsService.find(userId, offset, limit, q);
  }

  @Get(':contractId')
  @Roles('user')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResponseContractDto})
  async findOne(@User('id') userId: string, @Param('contractId') contractId: string): Promise<ResponseContractDto> {
    return await this.contractsService.findOne(userId, contractId);
  }
}
