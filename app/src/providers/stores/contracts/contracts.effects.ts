import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';

// Constants
import { mergeMap, map, withLatestFrom, catchError } from 'rxjs/operators';

// Actions
import * as fromActions from './contracts.actions';
import * as fromUserSessionActions from '@stores/user-session/user-session.actions';
import * as fromApplicationDataActions from '@stores/application-data/application-data.actions';

import { Logger } from '@services/logger/logger.service';
import { of, from } from 'rxjs';
import { ContractsService } from '@services/contracts/contracts.service';
import { ContractsDatabaseService } from '@db/contracts-database.service';
import { CONTRACT_CONSTANTS } from '@core/constants/contract.constants';
import { Store, select } from '@ngrx/store';
import { ContractModel } from '@core/models/contract.model';

import * as fromContractsSelectors from '@stores/contracts/contracts.selectors';
import { APPLICATION_DATA_CONSTANTS, ERROR_CONTEXTS } from '@core/constants/application-data.constants';


const log = new Logger('contracts-data.effects');

@Injectable()
export class ContractEffects {

    constructor(
        private actions$: Actions<fromActions.ContractActions | fromUserSessionActions.UserSessionActionActions>,
        private contractsService: ContractsService,
        private contractsDatabaseService: ContractsDatabaseService,
        private store: Store<ContractModel>,
    ) { }

    public initContract = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.ContractActionTypes.INIT_CONTRACT),
            mergeMap(
                () => {
                    return this.contractsDatabaseService.get(CONTRACT_CONSTANTS.CONTRACT_STATE).pipe(
                        map((data: any) => {
                            if (data) {
                                return new fromActions.ContractInitSuccess(data.query, { contracts: data.contracts, count: data.count, limit: 10, offset: 0 });
                            } else {
                                return new fromActions.ContractInitSuccess('', { contracts: [], count: 0, limit: 0, offset: 0 });
                            }
                        })
                    );
                })
        )
    );

    public queryContract = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.ContractActionTypes.QUERY_CONTRACT),
            mergeMap(
                (action) => this.contractsService.search(action.query, action.limit, action.offset).pipe(
                    mergeMap((queryResult) =>
                        this.contractsDatabaseService.set(CONTRACT_CONSTANTS.CONTRACT_STATE, {
                            query: action.query,
                            contracts: queryResult.contracts,
                            count: queryResult.count
                        }).pipe(
                            map(() => new fromActions.ContractQuerySuccess(action.query, {
                                contracts: queryResult.contracts,
                                count: queryResult.count,
                                limit: action.limit,
                                offset: action.offset
                            }))
                        )
                    ),
                    catchError((error) => of(new fromApplicationDataActions.PopulateError(error, ERROR_CONTEXTS.CONTRACT)))
                )
            )
        )
    );

    public updateContract = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.ContractActionTypes.UPDATE_CONTRACT),
            withLatestFrom(
                this.store.select(fromContractsSelectors.contractState)
            ),
            map(([action, store]) => {
                return { action, store };
            }),
            mergeMap(
                (payload) => this.contractsService.update(payload.action.id, payload.action.item).pipe(
                    map(() => new fromActions.ContractQuery(
                        payload.store.query ? payload.store.query : '',
                        payload.store.limit,
                        payload.store.offset
                    )),
                    catchError((error) => of(new fromApplicationDataActions.PopulateError(error, ERROR_CONTEXTS.CONTRACT)))
                )
            )
        )
    );

    public deleteContract = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.ContractActionTypes.DELETE_CONTRACT),
            withLatestFrom(
                this.store.select(fromContractsSelectors.contractState)
            ),
            map(([action, store]) => {
                return { action, store };
            }),
            mergeMap(
                (payload) => this.contractsService.delete(payload.action.id).pipe(
                    map(() => new fromActions.ContractQuery(
                        payload.store.query ? payload.store.query : '',
                        payload.store.limit,
                        payload.store.offset
                    )),
                    catchError((error) => of(new fromApplicationDataActions.PopulateError(error, ERROR_CONTEXTS.CONTRACT)))
                )
            )
        )
    );

    public addContract = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.ContractActionTypes.ADD_CONTRACT),
            withLatestFrom(
                this.store.select(fromContractsSelectors.contractState)
            ),
            map(([action, store]) => {
                return { action, store };
            }),
            mergeMap(
                (payload) => this.contractsService.add(payload.action.item).pipe(
                    map(() => new fromActions.ContractQuery(
                        payload.store.query ? payload.store.query : '',
                        payload.store.limit,
                        payload.store.offset,
                    )),
                    catchError((error) => of(new fromApplicationDataActions.PopulateError(error, ERROR_CONTEXTS.CONTRACT)))
                )
            )
        )
    );

    public resetContract = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.ContractActionTypes.RESET_CONTRACT, fromUserSessionActions.UserSessionActionTypes.LOGOUT_USER_SESSION_SUCCESS),
            mergeMap(
                () => this.contractsDatabaseService.remove(CONTRACT_CONSTANTS.CONTRACT_STATE).pipe(
                    map(() => {
                        return new fromActions.ContractResetSuccess();
                    })
                )
            )
        )
    );
}
