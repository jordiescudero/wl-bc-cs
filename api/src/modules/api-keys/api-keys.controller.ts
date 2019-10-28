import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './model/dto/create-api-key.dto';
import { ApiKey } from './model/interfaces/api-key.interface';
import { Roles } from '@common/decorators/roles.decorator';
import { User } from '@common/decorators/user.decorator';
import { ApiBearerAuth, ApiOkResponse, ApiImplicitQuery } from '@nestjs/swagger';
import { UpdateApiKeyDto } from './model/dto/update-api-key.dto';
import { ResponseApiKeyDto } from './model/dto/response-api-key.dto';
import { OptionalParseIntPipe } from '@common/pipes/optional-parse-int.pipe';
import { ResponseApiKeyListDto } from './model/dto/response-api-key-list.dto';

@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @Roles('user')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResponseApiKeyDto})
  async create(@User('id') userId: string, @Body() createApiKeyDto: CreateApiKeyDto): Promise<ResponseApiKeyDto> {
    return await this.apiKeysService.create(userId, createApiKeyDto);
  }

  @Put(':apiKeyId')
  @Roles('user')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResponseApiKeyDto})
  async update(@User('id') userId: string,
               @Param('apiKeyId') apiKeyId: string,
               @Body() updateApiKeyDto: UpdateApiKeyDto): Promise<ResponseApiKeyDto> {
    return await this.apiKeysService.update(userId, apiKeyId, updateApiKeyDto);
  }

  @Delete(':apiKeyId')
  @Roles('user')
  @ApiBearerAuth()
  async delete(@User('id') userId: string, @Param('apiKeyId') apiKeyId: string) {
    await this.apiKeysService.delete(userId, apiKeyId);
  }

  @Put(':apiKeyId/enable')
  @Roles('user')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResponseApiKeyDto})
  async enable(@User('id') userId: string, @Param('apiKeyId') apiKeyId: string): Promise<ResponseApiKeyDto> {
    return await this.apiKeysService.enable(userId, apiKeyId, true);
  }

  @Put(':apiKeyId/disable')
  @Roles('user')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResponseApiKeyDto})
  async disable(@User('id') userId: string, @Param('apiKeyId') apiKeyId: string): Promise<ResponseApiKeyDto> {
    return await this.apiKeysService.enable(userId, apiKeyId, false);
  }

  @Get()
  @Roles('user')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResponseApiKeyListDto})
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
  async find(@User('id') userId: string, @Query('offset', new OptionalParseIntPipe('0')) offset: number = 0,
             @Query('limit', new OptionalParseIntPipe('10')) limit: number = 10, @Query('q') q: string = ''): Promise<ResponseApiKeyListDto> {
    return await this.apiKeysService.find(userId, offset, limit, q);
  }

  @Get(':apiKeyId')
  @Roles('user')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResponseApiKeyDto})
  async findOne(@User('id') userId: string, @Param('apiKeyId') apiKeyId: string): Promise<ResponseApiKeyDto> {
    return await this.apiKeysService.findOne(userId, apiKeyId);
  }

  @Put(':apiKeyId/redeem')
  @Roles('user')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResponseApiKeyDto})
  async redeem(@User('id') userId: string, @Param('apiKeyId') apiKeyId: string): Promise<ApiKey> {
    this.apiKeysService.redeem(userId, apiKeyId);
    return;
  }

}
