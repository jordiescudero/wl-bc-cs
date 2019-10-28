// Basic
import { Component, Inject, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Logger } from '@services/logger/logger.service';
import { Observable, Subscription, fromEvent, timer } from 'rxjs';
import { ContractModel } from '@core/models/contract.model';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { WalletStateModel } from '@core/models/wallet-state.model';
import * as fromSelectors from '@stores/wallet/wallet.selectors';
import { ApiKeysContract } from '@core/core.module';

const log = new Logger('pay-api-key-dialog.component');

@Component({
  selector: 'blo-pay-api-key-dialog',
  templateUrl: 'pay-api-key-dialog.component.html',
  styleUrls: ['pay-api-key-dialog.component.scss']
})
export class PayApiKeyDialogComponent implements OnInit, OnDestroy {

  public contracts$: Observable<ContractModel[]>;
  public payApiKeyForm: FormGroup;
  public walletActive = false;
  public value: number;
  public payQR: string;

  @ViewChild('search', { static: false }) public search: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<PayApiKeyDialogComponent>,
    private store: Store<WalletStateModel>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) { }

  public ngOnInit() {
    this.payApiKeyForm = this.fb.group({
      name: [
        {
          value: this.data ? this.data.name : '',
          disabled: this.data ? this.data.id : false
        }
      ],
      description: [this.data ? this.data.description : '']
    });

    this.store.select(fromSelectors.isActive).subscribe((active) => {
      this.walletActive = active;
    });
    this.onChange(1);
  }

  public ngOnDestroy() {

  }

  public onChange(newValue) {
    this.payQR = `raw://${ApiKeysContract.ADDRESS}#${newValue}#${encodeURI('Api Payment')}#${this.data.name}`;
  }

  public formatLabel(value: number | null) {
    if (!value) {
      return '1 $';
    } else {
      return `${value} $`;
    }
  }

}
