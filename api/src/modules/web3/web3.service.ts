import { Injectable, Inject } from '@nestjs/common';
import * as AuthorisationContractJson from '../smartcontracts/authorisation/json/Authorisation.json';
import * as Web3 from 'web3';
const HDWalletProvider = require('truffle-hdwallet-provider');
import { ConfigService } from '@common/config/config.service';

const GAS = 9999999;

@Injectable()
export class Web3Service {
  public authorisationContract: any;
  public web3: any;
  public hdprovider: any;
  public address: any;
  public transactionObject: any;
  public mnemonic: any;
  public url: any;
  public network: any;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.mnemonic = this.configService.get('MNEMONIC');
    this.url = this.configService.get('ALASTRIA_RPC_URL');
    this.network = this.configService.get('ALASTRIA_NETWORK');

    this._initContext(this.mnemonic);

    this._eventListener();
  }

  _initContext(mnemonic: string) {
    this.hdprovider = new HDWalletProvider(mnemonic, this.url);
    this.web3 = new Web3(this.hdprovider);
    this.address = this.hdprovider.getAddress(0);

    this.transactionObject = {
      from: this.address,
      gas: 9999999,
      gasPrice: 0,
    };

    this.authorisationContract = new this.web3.eth.Contract(
      AuthorisationContractJson.abi,
      AuthorisationContractJson.networks[this.network].address,
    );
  }

  _removeContext() {
    //Finish the process elegantly
    this.hdprovider.engine.stop();
    this.hdprovider = null;
    this.web3 = null;
    this.address = null;
    this.transactionObject = null;
    this.authorisationContract = null;
  }

  _eventListener() {
    //LISTEN TO ALL EVENTS
    // this.authorisationContract.events.allEvents({
    //   fromBlock: 0
    // }, function(error,event) { console.log(event); })
    // .on('data', function(event) {
    //   console.log(event); //same results as the optional callback above
    // })
    // .on('changed', function(event) {
    //   //remove envent from local database
    // })
    // .on('error', console.error);
  }

  _checkTransaction(tx) {
    return new Promise((resolve, reject) => {
      setTimeout(() => this._tick(tx, resolve, reject), 1000);
    });
  }

  _tick(tx, resolve, reject) {
    this.web3.eth.getTransactionReceipt(tx, (err, receipt) => {
      if (err) {
        console.log('KO', err);
        reject(err);
      } else if (!receipt) {
        console.log('Checking transaction...');
        setTimeout(() => this._tick(tx, resolve, reject), 1000);
      } else if (!receipt.status) {
        console.log('Error', 'Transaction error.');
        reject();
      } else if (receipt.status) {
        console.log('Transaction mined.');
        resolve();
      }
    });
  }

}
