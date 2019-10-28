import { ResponseContractDto } from '@modules/contracts/model/dto/response-contract.dto';

export interface ApiKey {

  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly owner: string;
  readonly role: string;
  readonly contracts: ResponseContractDto[];
  readonly active: boolean;

}
