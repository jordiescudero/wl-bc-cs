// Basic
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Logger } from '@services/logger/logger.service';
import { Store } from '@ngrx/store';
import { ApiKeyModel } from '@core/models/api-key.model';
import * as fromApiKeysActions from '@stores/api-keys/api-keys.actions';
import * as fromApiKeysSelectors from '@stores/api-keys/api-keys.selectors';
import { Observable, fromEvent, timer, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';
import { GeneralDialogComponent } from '@components/general-dialog/general-dialog.component';
import { filter, map, debounce, distinctUntilChanged } from 'rxjs/operators';
import { CreateApiKeyDialogComponent } from '@components/create-api-key-dialog/create-api-key-dialog.component';
import { ContractsService } from '@services/contracts/contracts.service';
import { PayApiKeyDialogComponent } from '@components/pay-api-key-dialog/pay-api-key-dialog.component';


const log = new Logger('api-keys.component');


/**
 * Home page
 */
@Component({
  selector: 'blo-api-keys',
  templateUrl: './api-keys.component.html',
  styleUrls: ['./api-keys.component.scss']
})
export class ApiKeysComponent implements OnInit, AfterViewInit, OnDestroy {

  public apiKeyList$: Observable<ApiKeyModel[]>;
  public searchEvent$: Subscription;

  @ViewChild('search', { static: false }) public search: ElementRef;

  constructor(
    private store: Store<ApiKeyModel>,
    public dialog: MatDialog,
    private contractsService: ContractsService
  ) { }


  public ngOnInit() {
    this.apiKeyList$ = this.store.select(fromApiKeysSelectors.selectAll);
    this.doSearch();
  }

  public ngAfterViewInit() {
    this.searchEvent$ = fromEvent(this.search.nativeElement, 'keyup')
      .pipe(
        map((event: any) => event.target.value), // Get the value of the input
        filter((text) => !text.length || text.length > 2), // Only if the text is longer than 2
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

  public addApiKey() {
    const dialogRef = this.dialog.open(CreateApiKeyDialogComponent, {
      width: '400px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(new fromApiKeysActions.ApiKeyAdd({
          name: result.name,
          description: result.description,
          role: result.role,
          contracts: result.contracts
        }));
      }
    });
  }

  public async editApiKey(item) {
    const dialogRef = this.dialog.open(CreateApiKeyDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        id: item.id,
        name: item.name,
        description: item.description,
        role: item.role,
        contracts: item.contracts
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(new fromApiKeysActions.ApiKeyUpdate(item.id, {
          description: result.description,
          role: result.role,
          contracts: result.contracts
        }));
      }
    });
  }

  private doSearch(text = '') {
    this.store.dispatch(new fromApiKeysActions.ApiKeyQuery(text));
  }

  public deleteApiKey(item) {
    const dialogRef = this.dialog.open(GeneralDialogComponent, {
      width: '250px',
      height: '200px',
      data: {
        title: `${item.name}`,
        description: 'You will delete this apiKey, Are you sure?',
        buttonAccept: 'yes!',
        buttonCancel: 'cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(new fromApiKeysActions.ApiKeyDelete(item.id));
        log.debug('deleteItem');
      }
    });
  }

  public paymentApiKey(item) {
    const dialogRef = this.dialog.open(PayApiKeyDialogComponent, {
      width: '400px',
      height: '400px',
      data: {
        name: item.name,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(new fromApiKeysActions.ApiKeyPay(item.name, result));
      }
    });
  }
}
