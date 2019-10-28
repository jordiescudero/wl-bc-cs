import { Injectable, Logger, NotAcceptableException, UnauthorizedException } from '@nestjs/common';
import { Contract } from './model/entity/contract.entity';
import { MongoRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { CreateContractDto } from './model/dto/create-contract.dto';
import { UpdateContractDto } from './model/dto/update-contract.dto';
import { ResponseContractDto } from './model/dto/response-contract.dto';
import { ResponseContractListDto } from './model/dto/response-contract-list.dto';

@Injectable()
export class ContractsService {

  private log = new Logger('ContractsService', true);

  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: MongoRepository<Contract>,
  ) {}

  async create(owner: string, createContractDto: CreateContractDto): Promise<ResponseContractDto> {
    const newApiKey = this.contractRepository.create(createContractDto);
    newApiKey.owner = owner;
    try {
      const newItem = await this.contractRepository.save(newApiKey);
      return { ...newItem , ...{id: newItem.id.toString(), owner : true }};
    } catch (err) {
      this.log.error(err);
      throw new NotAcceptableException('Duplicated');
    }
  }

  async update(owner: string, contractId: string, updateContractDto: UpdateContractDto): Promise<ResponseContractDto> {
    const result = await this.contractRepository.updateOne({_id: new ObjectId(contractId), owner}, {$set: updateContractDto}, { upsert: true});
    if (result.matchedCount > 0) {
      return await this.findOne(owner, contractId);
    } else {
      this.log.debug(`Not owner ${owner}  ${contractId}`);
      throw new UnauthorizedException('Not owner or not exist');
    }
  }

  async delete(owner: string, contractId: string): Promise<boolean> {
    const result =  await this.contractRepository.deleteOne({_id: new ObjectId(contractId), owner});
    if (result.deletedCount > 0) {
      return true;
    } else {
      this.log.debug(`Not owner ${owner}  ${contractId}`);
      throw new UnauthorizedException('Not owner or not exist');
    }
  }

  async findOne(owner: string, contractId: string): Promise<ResponseContractDto> {

    const contract = await this.contractRepository.findOne({
      where: {
          $and: [
              {
                _id : new ObjectId(contractId),
              },
              {
                $or: [{ owner}, {public: true} ],
              },
          ],
      },
    });

    if (contract) {
      return {...contract, ...{id: contract.id.toString(), owner: contract.owner === owner}};
    } else {
      this.log.debug(`Not owner ${owner}  ${contractId}`);
      throw new UnauthorizedException('Not owner or not exist');
    }
  }

  async find(userId: string, offset: number, limit: number, q: string): Promise<ResponseContractListDto> {
    const [result, count] = await this.contractRepository.findAndCount({
      where: {
          $and: [
              {
                name :  {
                  $regex: `.*${q}.*`,
                  $options: 'i',
                },
              },
              {
                $or: [{ owner: userId}, {public: true} ],
              },
          ],
      },
      take: limit,
      skip: offset,
      order: {
        name: 'ASC',
      },
    });

    const items: ResponseContractDto[] = [];

    result.forEach( (item: any) => {
      // TODO: por alguna razon el transformer no se aplica a esta nueva clase
      const newItem = {...item, ...{id: item.id.toString(), owner: (item.owner === userId)}};
      items.push(newItem);
    } );

    return {items, count, limit, offset};
  }
}
