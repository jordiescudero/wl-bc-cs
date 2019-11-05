import { Controller, Get, Render, Post, HttpStatus, Body, Req, HttpException, Res, Query, Delete, Put, Param } from '@nestjs/common';
// import { Request, Response } from 'express';
import { CompanionDBService } from './companion-db.service';
import { ApiBearerAuth, ApiResponse, ApiConsumes, ApiProduces, ApiOkResponse } from '@nestjs/swagger';
// import { Roles } from '@common/decorators/roles.decorator';
// import { User } from '@common/decorators/user.decorator';
import { SensiDataDto } from './model/dto/sensiData.dto';
import { ResponseTokenDto } from './model/dto/response-token.dto';
// import * as i18n from 'i18n';

@Controller('companionDB')
export class CompanionDBController {

  constructor(
    private readonly companionDBService: CompanionDBService,
    ) {}

// MAYBE WE SHOULD USE IT IN THE FUTURE
  //@ApiBearerAuth()
  //@Roles('user')
  //@ApiResponse({status: HttpStatus.ACCEPTED, description: 'Successful Registration', })
  //@ApiOkResponse({ type: SensiDataDto})


  @Get(':id')
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  findOne(@Param('id') id: string): Promise<any> {
    return null;
  }

  @Get()
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  find(@Param('id') idBulck: string[], @Body() payload: SensiDataDto[]) {
    return null;
  }

  @Post()
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  insert(@Body() sensiData: SensiDataDto): Promise<ResponseTokenDto> {
    return null;
  }

  @Post('bulk_insert')
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  bulk_insert(@Body() sensiDataBulck: SensiDataDto[]): Promise<ResponseTokenDto> {
    return null;
  }

  @Put(':id')
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  update(@Param('id') id: string, @Body() payload: SensiDataDto): Promise<SensiDataDto> {
    return null;
  }

  @Put()
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  bulk_update(@Param('id') id: string[], @Body() payload: SensiDataDto[]) {
    return null;
  }

  @Delete(':id')
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  delete(@Param('id') id: string ): Promise<ResponseTokenDto> {
    return null;
  }

  @Delete('bulk_delete')
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  bulk_delete(@Param('id') id: string[] ): Promise<ResponseTokenDto> {
    return null;
  } 

}