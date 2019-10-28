// Basic
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';

import { Logger } from '@services/logger/logger.service';
import { ContractModel } from '@core/models/contract.model';
import { Store } from '@ngrx/store';
import { Observable, Subscription, fromEvent, timer, merge } from 'rxjs';
import * as fromContractsActions from '@stores/contracts/contracts.actions';
import * as fromContractsSelectors from '@stores/contracts/contracts.selectors';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { GeneralDialogComponent } from '@components/general-dialog/general-dialog.component';
import { map, filter, debounce, distinctUntilChanged, startWith, switchMap, tap } from 'rxjs/operators';
import { CreateContractDialogComponent } from '@components/create-contract-dialog/create-contract-dialog.component';
import { ContractsService } from '@services/contracts/contracts.service';
import { ContractsDataSource } from './contracts.datasource';

const log = new Logger('contracts.component');


/**
 * Home page
 */
@Component({
  selector: 'blo-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.scss']
})
export class ContractsComponent implements OnInit, AfterViewInit, OnDestroy {

  public count$: Subscription;
  public searchEvent$: Subscription;

  public displayedColumns: string[];
  public dataSource: ContractsDataSource;

  public resultsLength: number;

  private searchText: string;

  private paginator$: Subscription;

  @ViewChild('search', { static: false }) public search: ElementRef;

  @ViewChild(MatPaginator, { static: false }) public paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) public sort: MatSort;

  constructor(
    private store: Store<ContractModel>,
    public dialog: MatDialog,
    public contractApiServices: ContractsService
  ) { }

  public ngOnInit() {
    this.displayedColumns = ['id', 'name', 'address', 'public', 'description', 'actions'];
    this.dataSource = new ContractsDataSource(this.store);

    // Subscribe to the count of the search
    this.count$ = this.store.select(fromContractsSelectors.getCount).subscribe((count) => {
      this.resultsLength = count;
    });
  }

  public ngAfterViewInit() {

    // On change page do search with the new offset
    this.paginator$ = this.paginator.page.pipe(
      tap(() => this.doSearch(this.searchText))
    ).subscribe();

    // Search when 3 letters or more wroten
    this.searchEvent$ = fromEvent(this.search.nativeElement, 'keyup')
      .pipe(
        map((event: any) => event.target.value), // Get the value of the input
        filter((text) => !text.length || text.length > 2), // Only if the text is longer than 2
        debounce(() => timer(750)), // Make sure user’s can’t spam us
        distinctUntilChanged() // Only if the value has changed
      )
      .subscribe((text) => {
        this.searchText = text;
        this.doSearch(text);
      });

    this.doSearch();
  }

  public ngOnDestroy() {
    this.count$.unsubscribe();
    this.paginator$.unsubscribe();
  }


  public addContract() {
    const dialogRef = this.dialog.open(CreateContractDialogComponent, {
      width: '400px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(new fromContractsActions.ContractAdd({
          name: result.name,
          description: result.description,
          public: result.public,
          address: result.address
        }));
      }
    });
  }

  public async editContract(item) {
    const dialogRef = this.dialog.open(CreateContractDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        id: item.id,
        name: item.name,
        description: item.description,
        public: item.public,
        address: item.address
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(new fromContractsActions.ContractUpdate(item.id, {
          name: result.name,
          description: result.description,
          public: result.public,
        }));
      }
    });
  }

  public doSearch(text = '') {
    this.dataSource.loadContracts(text, 'asc', this.paginator.pageIndex * this.paginator.pageSize, this.paginator.pageSize);
  }

  public deleteContract(item) {
    const dialogRef = this.dialog.open(GeneralDialogComponent, {
      width: '250px',
      height: '200px',
      data: {
        title: `${item.name}`,
        description: 'You will delete this contract, Are you sure?',
        buttonAccept: 'yes!',
        buttonCancel: 'cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(new fromContractsActions.ContractDelete(item.id));
      }
    });
  }
}
