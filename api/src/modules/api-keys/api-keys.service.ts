import { Injectable, NotAcceptableException, UnauthorizedException, Logger } from '@nestjs/common';
import { ApiKey } from './model/entity/api-key.entity';
import { MongoRepository, ObjectID } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateApiKeyDto } from './model/dto/create-api-key.dto';
import { UpdateApiKeyDto } from './model/dto/update-api-key.dto';
import { ResponseApiKeyDto } from './model/dto/response-api-key.dto';
import { ConfigService } from '@common/config/config.service';

import { ResponseApiKeyListDto } from './model/dto/response-api-key-list.dto';

@Injectable()
export class ApiKeysService {

  private log = new Logger('ApiKeysService', true);
  private apiKeysContract: any;
  private web3: any;

  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeysRepository: MongoRepository<ApiKey>,
    private readonly configService: ConfigService,
  ) {

    // this.web3 = new Web3(new Web3.providers.HttpProvider(this.configService.get('ALASTRIA_RPC_URL')));
    // this.apiKeysContract = new this.web3.eth.Contract(JSON.abi, JSON.networks[this.configService.get('ALASTRIA_NETWORK')].address);
  }

  async create(owner: string, createApiKeyDto: CreateApiKeyDto): Promise<ResponseApiKeyDto> {
    const newApiKey = this.apiKeysRepository.create(createApiKeyDto);
    newApiKey.owner = owner;
    try {
      return await this.apiKeysRepository.save(newApiKey);
    } catch (err) {
      this.log.error(err);
      throw new NotAcceptableException('Duplicated');
    }
  }

  async update(owner: string, apiKeyId: string, updateApiKeyDto: UpdateApiKeyDto): Promise<ResponseApiKeyDto> {
    const result = await this.apiKeysRepository.updateOne({_id: new ObjectID(apiKeyId), owner}, {$set: updateApiKeyDto}, { upsert: true});
    if (result.matchedCount > 0) {
      return await this.findOne(owner, apiKeyId);
    } else {
      this.log.debug(`Not owner ${owner}  ${apiKeyId}`);
      throw new UnauthorizedException('Not owner or not exist');
    }
  }

  async enable(owner: string, apiKeyId: string, enable: boolean): Promise<ResponseApiKeyDto> {
    const result = await this.apiKeysRepository.updateOne({_id: new ObjectID(apiKeyId), owner}, {$set: { active: enable}}, { upsert: true});
    if (result.matchedCount > 0) {
      return await this.findOne(owner, apiKeyId);
    } else {
      this.log.debug(`Not owner ${owner}  ${apiKeyId}`);
      throw new UnauthorizedException('Not owner or not exist');
    }
  }

  async delete(owner: string, apiKeyId: string): Promise<boolean> {
    const result =  await this.apiKeysRepository.deleteOne({_id: new ObjectID(apiKeyId), owner});
    if (result.deletedCount > 0) {
      return true;
    } else {
      this.log.debug(`Not owner ${owner}  ${apiKeyId}`);
      throw new UnauthorizedException('Not owner or not exist');
    }
  }

  async findOne(owner: string, apiKeyId: string): Promise<ResponseApiKeyDto> {
    const apiKey = await this.apiKeysRepository.findOne({
      where: {
          $and: [
              {
                _id : new ObjectID(apiKeyId),
              },
              {
                owner,
              },
          ],
      },
    });

    if (apiKey) {
      return apiKey;
    } else {
      this.log.debug(`Not owner ${owner}  ${apiKeyId}`);
      throw new UnauthorizedException('Not owner or not exist');
    }
  }

  async find(userId: string, offset: number, limit: number, q: string): Promise<ResponseApiKeyListDto> {
    const [items, count] = await this.apiKeysRepository.findAndCount({
      where: {
          $and: [
              {
                name :  {
                  $regex: `.*${q}.*`,
                  $options: 'i',
                },
              },
              {
                owner: userId,
              },
          ],
      },
      take: limit,
      skip: offset,
      order: {
        name: 'ASC',
      },
    });

    return {items, count, limit, offset};
  }

  async redeem(owner: string, apiKeyId: string) {
    /*
     cogemos el nuevo tiempo de vida de la BC y lo guardamos en la BD
    const permissions = await this.devicesContract.methods.checkOwnershipMultipleAssetsForDevice(this.web3.utils.keccak256(request.deviceId)
      , request.assets
      , request.dappId).call();
    */
    return;
  }

}
