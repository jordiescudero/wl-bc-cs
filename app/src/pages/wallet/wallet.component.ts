// Basic
import { Component, OnInit, OnDestroy } from '@angular/core';

import { Logger } from '@services/logger/logger.service';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

import { MatDialog } from '@angular/material';

import * as fromWalletSelectors from '@stores/wallet/wallet.selectors';
import * as fromActions from '@stores/wallet/wallet.actions';
import { WalletStateModel } from '@core/models/wallet-state.model';
import { Web3Service } from '@services/web3/web3.service';
import { ERC223Contract } from '@core/core.module';


const log = new Logger('wallet.component');


/**
 * Home page
 */
@Component({
  selector: 'blo-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit, OnDestroy {

  public wallet$: Subscription;
  public address$: Observable<string>;

  public wallet: WalletStateModel;


  constructor(
    private store: Store<WalletStateModel>,
    private web3Service: Web3Service,
    public dialog: MatDialog
  ) { }

  public ngOnInit() {
    this.wallet$ = this.store.select(fromWalletSelectors.getWallet).subscribe((wallet: WalletStateModel) => {
      this.wallet = wallet;
    });
    this.address$ = this.web3Service.getAddress();
  }

  public ngOnDestroy() {
    this.wallet$.unsubscribe();
  }

  public activate() {
    this.store.dispatch(new fromActions.ActivateWallet());
  }

  public deactivate() {
    this.store.dispatch(new fromActions.DeactivateWallet());
  }

  // TODO:
  public async testMeta() {
    log.debug('testMeta');
    try {
      await (<ERC223Contract>this.web3Service.getContract(ERC223Contract.ADDRESS)).buy(1, 'aaa');
    } catch (err) {
      log.error('TX ERROR', err);
    }
  }
}
