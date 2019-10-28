// Basic
import { Component, Inject, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Logger } from '@services/logger/logger.service';
import { Observable, Subscription, fromEvent, timer } from 'rxjs';
import { Store } from '@ngrx/store';
import { ContractState } from '@stores/contracts/contracts.reducer';

import * as fromContractsSelector from '@stores/contracts/contracts.selectors';
import * as fromContractsActions from '@stores/contracts/contracts.actions';

import { ContractModel } from '@core/models/contract.model';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { map, debounce, distinctUntilChanged } from 'rxjs/operators';

const log = new Logger('create-api-key-dialog.component');


@Component({
  selector: 'blo-create-api-key-dialog',
  templateUrl: 'create-api-key-dialog.component.html',
  styleUrls: ['create-api-key-dialog.component.scss']
})
export class CreateApiKeyDialogComponent implements OnInit, AfterViewInit, OnDestroy {

  public contracts$: Observable<ContractModel[]>;
  public apiKeyForm: FormGroup;
  private searchEvent$: Subscription;

  @ViewChild('search', { static: false }) public search: ElementRef;

  constructor(
    private store: Store<ContractState>,
    public dialogRef: MatDialogRef<CreateApiKeyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) { }

  public ngOnInit() {
    this.apiKeyForm = this.fb.group({
      name: [
        {
          value: this.data ? this.data.name : '',
          disabled: this.data ? this.data.id : false
        }
      ],
      description: [this.data ? this.data.description : ''],
      role: [this.data ? this.data.role : ''],
      contracts: this.fb.array(this.data ? this.data.contracts : [], [Validators.minLength(1)])
    });

    this.doSearch();

    this.contracts$ = this.store.select(fromContractsSelector.selectAll);
  }

  public ngAfterViewInit() {
    this.searchEvent$ = fromEvent(this.search.nativeElement, 'keyup')
      .pipe(
        map((event: any) => event.target.value), // Get the value of the input
        debounce(() => timer(750)), // Make sure user’s can’t spam us
        distinctUntilChanged() // Only if the value has changed
      )
      .subscribe((text) => {
        this.doSearch(text);
      });
  }

  public ngOnDestroy() {
    this.searchEvent$.unsubscribe();
  }

  public onOptionSelected($event) {
    const option = $event.option.value;
    const contracts = this.apiKeyForm.get('contracts') as FormArray;
    if (!contracts.controls.find((optionArray => optionArray.value.address === option.address))) {
      contracts.push(this.fb.control(option));
    }
    this.search.nativeElement.value = '';
  }

  public onRemoveContract(contractAddress) {
    const contracts = this.apiKeyForm.get('contracts') as FormArray;
    contracts.removeAt(contracts.value.findIndex(contract => contract.address === contractAddress));
  }

  private doSearch(text = '') {
    this.store.dispatch(new fromContractsActions.ContractQuery(text));
  }

  public getErrorMessage(field) {
    const fieldForm = this.apiKeyForm.get(field);
    return fieldForm.hasError('required') ? 'You must enter a value' :
      fieldForm.hasError('email') ? 'Field not valid' :
        '';
  }
}
