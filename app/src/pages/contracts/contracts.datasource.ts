import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { Inject } from '@angular/core';
import { ContractModel } from '@core/models/contract.model.js';
import { Store } from '@ngrx/store';

import * as fromContractsActions from '@stores/contracts/contracts.actions';
import * as fromContractsSelectors from '@stores/contracts/contracts.selectors';

export class ContractsDataSource implements DataSource<ContractModel> {

    public contractsStore$: Subscription;
    private contracts$ = new BehaviorSubject<ContractModel[]>([]);

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(
        @Inject(Store) private store: Store<ContractModel>
    ) {
        this.contractsStore$ = this.store.select(fromContractsSelectors.selectAll).subscribe({
            complete: () => this.contracts$.complete(),
            error: x => this.contracts$.error(x),
            next: contracts => this.contracts$.next(contracts)
        });
    }

    public connect(collectionViewer: CollectionViewer): Observable<ContractModel[]> {
        return this.contracts$;
    }

    public disconnect(collectionViewer: CollectionViewer) {
        this.contractsStore$.unsubscribe();
        this.contracts$.complete();
        this.loadingSubject.complete();
    }

    public loadContracts(filter = '', sortDirection = 'asc', pageIndex = 0, pageSize = 10) {
        this.store.dispatch(new fromContractsActions.ContractQuery(filter, pageSize, pageIndex));
    }
}
