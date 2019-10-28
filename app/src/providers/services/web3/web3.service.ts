// Basic
import { Injectable, Injector } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

// Services
import { Logger } from '@services/logger/logger.service';

const log = new Logger('web3.service');
import { environment } from '@env/environment';
import Web3 from 'web3';
import { Contract } from './contracts';
declare global {
  interface Window {
    web3: any;
    ethereum: any;
  }
}

@Injectable({providedIn: 'root'})
export class Web3Service {
  private _isReady: boolean;
  private _firstRun = true;
  private web3: any;
  private watiningCallbacks: Array<any>;
  private _contractRegistry = {};
  private myAddress: BehaviorSubject<string>;

  constructor() {
    this._isReady = false;
    this.watiningCallbacks = [];
    this.myAddress = new BehaviorSubject<string>(undefined);
    this.web3 = window.web3;
  }

  public isReady(): boolean {
    return this._isReady;
  }

  public ready(callback: any) {
    if (this._isReady) {
      callback();
    } else {
      this.watiningCallbacks.push(callback);
    }
  }

  public createContract(abi: any, address: string) {
    return new this.web3.eth.Contract(abi, address);
  }

  public getAddress(): Observable<string> {
    return this.myAddress.asObservable();

  }

  public checkTransactionStatus(txhash: string): Promise<any> {
    return this.web3.eth.getTransactionReceipt(txhash);
  }

  public fromAscii(secret: string): any {
    return this.web3.utils.fromAscii(secret);
  }

  public keccak256(secret: string): any {
    return this.web3.utils.keccak256(secret);
  }

  public registerContract(contractAddress: string, contract: Contract) {
    this._contractRegistry[contractAddress] = contract;
  }

  public getContract(contractAddress: string) {
    if (this._isReady) {
      return this._contractRegistry[contractAddress];
    } else {
      return undefined;
    }
  }

  public deactivateWallet() {
    if (this._isReady) {
      this.web3 = undefined;
      this.myAddress.next(undefined);
      this._isReady = false;
    }
  }


  public activateWallet(): Promise<boolean> {

    return new Promise((resolve, reject) => {

      if (this._isReady) {
        resolve(true);
      }

      if ((typeof window.web3 !== 'undefined') && (typeof window.ethereum !== 'undefined')) {
        const web3Options = {
          transactionConfirmationBlocks: environment.eth.web3Options.transactionConfirmationBlocks,
          transactionPollingTimeout: environment.eth.web3Options.transactionPollingTimeout,
        };

        window.ethereum.enable()
        .catch(function (reason) {
          if (reason === 'User rejected provider access') {
            reject('User rejected provider access');
          } else {
            log.error('There was an issue signing you in.', reason);
            reject('There was an issue signing you in.');
          }
        })
        .then((accounts) => {
          const desiredNetwork = environment.eth.contractConfig.networkId;
          if (window.ethereum.networkVersion !== desiredNetwork) {
            reject('This application requires the main network, please switch it in your MetaMask UI.');
          }
          this.myAddress.next(accounts[0]);
          if (this._firstRun) {
            window.ethereum.publicConfigStore.on('update', (data) => {
              this.myAddress.next(data.selectedAddress);
            });
            this._firstRun = false;
          }
          this.web3 = new Web3(window.web3.currentProvider, null, web3Options);
          this._isReady = true;
          resolve(true);
        });

      } else {
        log.debug('No web3? You should consider trying MetaMask!');
        resolve(false);
      }

    });
  }

}
