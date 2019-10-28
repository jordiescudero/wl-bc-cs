// Basic
import { Observable, Subject } from 'rxjs';

// Environment
import { environment } from '@env/environment';

// Services
import { Web3Service } from '@services/web3/web3.service';
import { TransactionService } from '@services/web3/transactions/transaction.service';
import { Logger } from '@services/logger/logger.service';

const log = new Logger('contract');

export class Listener {
  constructor(
    public eventName: string,
    public filter: any
  ) { }
}

export abstract class Contract {
  protected events: Subject<any>;
  protected address: string;
  protected args: any;

  private listeners: Listener[];

  public static get ABI(): any { return null; }

  constructor(
    protected contractAddress: string,
    protected contract: any,
    protected web3Service: Web3Service,
    protected transactionService: TransactionService
  ) {

    this.events = new Subject<any>();
    this.listeners = [];

    this.args = {
       from: null,
       value: environment.eth.contractConfig.default.value,
       gasPrice: environment.eth.contractConfig.default.gasPrice,
       gas: environment.eth.contractConfig.default.gas
    };

    this.web3Service.getAddress().subscribe((address) => {
      log.debug('new address', address);
      this.updateAddress(address);
    });
  }

  public getContractAddress(): string {
    return this.contractAddress;
  }

  public getEvents(): Observable<any> {
    return this.events.asObservable();
  }

  protected addEventListener(listener: Listener) {
    this.listeners.push(listener);
  }

  protected updateAddress(newAddress: string) {
    this.args.from = newAddress;
    this.address = newAddress;
  }

  protected clearListeners() {
    this.listeners = [];
  }

  private publishEvent(event: any) {
    this.events.next(event);
  }


}
