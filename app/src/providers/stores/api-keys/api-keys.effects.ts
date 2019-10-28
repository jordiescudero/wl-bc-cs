import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';

// Constants
import { map, withLatestFrom, catchError, mergeMap} from 'rxjs/operators';

// Actions
import * as fromActions from './api-keys.actions';
import * as fromUserSessionActions from '@stores/user-session/user-session.actions';
import * as fromApplicationDataActions from '@stores/application-data/application-data.actions';

import { Logger } from '@services/logger/logger.service';
import { of } from 'rxjs';
import { ApiKeysService } from '@services/api-keys/api-keys.service';
import { ApiKeysDatabaseService } from '@db/api-keys-database.service';
import { API_KEY_CONSTANTS } from '@core/constants/api-key.constants';
import { Store } from '@ngrx/store';
import { ApiKeyModel } from '@core/models/api-key.model';
import * as fromApiKeysSelectors from '@stores/api-keys/api-keys.selectors';
import { ERROR_CONTEXTS } from '@core/constants/application-data.constants';

const log = new Logger('api-keys-data.effects');

@Injectable()
export class ApiKeyEffects {

    constructor(
        private actions$: Actions<fromActions.ApiKeyActions |
                                  fromUserSessionActions.UserSessionActionActions >,
        private apiKeysService: ApiKeysService,
        private apiKeysDatabaseService: ApiKeysDatabaseService,
        private store: Store<ApiKeyModel>,
    ) { }

    public initApiKey = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.ApiKeyActionTypes.INIT_API_KEY),
            mergeMap(
                () => this.apiKeysDatabaseService.get(API_KEY_CONSTANTS.API_KEY_STATE).pipe(
                    map((data: any) => {
                        if (data) {
                            return new fromActions.ApiKeyInitSuccess(data.query, data.items);
                        } else {
                            return new fromActions.ApiKeyResetSuccess();
                        }
                    })
                )
            )
        )
    );

    public queryApiKey = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.ApiKeyActionTypes.QUERY_API_KEY),
            mergeMap(
                (action) => this.apiKeysService.search(action.query).pipe(
                    mergeMap( (queryResult) =>
                        this.apiKeysDatabaseService.set(API_KEY_CONSTANTS.API_KEY_STATE, {query: action.query, items: queryResult }).pipe(
                           map( () => new fromActions.ApiKeyQuerySuccess(action.query, queryResult))
                        )
                    ),
                    catchError((error) => of(new fromApplicationDataActions.PopulateError(error, ERROR_CONTEXTS.API_KEY)))
                )
            )
        )
    );

    public updateApiKey = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.ApiKeyActionTypes.UPDATE_API_KEY),
            withLatestFrom(
                this.store.select(fromApiKeysSelectors.getCurrentQuery)
            ),
            map(([action, query]) => {
                return {action, query};
            }),
            mergeMap((payload) => this.apiKeysService.update(payload.action.id, payload.action.item).pipe(
                    map( () => new fromActions.ApiKeyQuery(payload.query ? payload.query : '') ),
                    catchError((error) => of(new fromApplicationDataActions.PopulateError(error, ERROR_CONTEXTS.API_KEY)))
                )
            )
        )
    );

    public deleteApiKey = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.ApiKeyActionTypes.DELETE_API_KEY),
            withLatestFrom(
                this.store.select(fromApiKeysSelectors.getCurrentQuery)
            ),
            map(([action, query]) => {
                return {action, query};
            }),
            mergeMap((payload) => this.apiKeysService.delete(payload.action.id).pipe(
                    map(() => new fromActions.ApiKeyQuery(payload.query ? payload.query : '')),
                    catchError((error) => of(new fromApplicationDataActions.PopulateError(error, ERROR_CONTEXTS.API_KEY)))
                )
            )
        )
    );

    public addApiKey = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.ApiKeyActionTypes.ADD_API_KEY),
            withLatestFrom(
                this.store.select(fromApiKeysSelectors.getCurrentQuery)
            ),
            map(([action, query]) => {
                return {action, query};
            }),
            mergeMap((payload) => this.apiKeysService.add(payload.action.item).pipe(
                    map(user => new fromActions.ApiKeyQuery(payload.query ? payload.query : '')),
                    catchError((error) => of(new fromApplicationDataActions.PopulateError(error, ERROR_CONTEXTS.API_KEY)))
                )
            )
        )
    );

    public payApiKey = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.ApiKeyActionTypes.PAY_API_KEY),
            map((payload) => this.apiKeysService.pay(payload.name, payload.amount))
        )
        , { dispatch: false });

    public resetApiKey = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.ApiKeyActionTypes.RESET_API_KEY, fromUserSessionActions.UserSessionActionTypes.LOGOUT_USER_SESSION_SUCCESS),
            mergeMap(() => this.apiKeysDatabaseService.remove(API_KEY_CONSTANTS.API_KEY_STATE).pipe(
                    map(() => new fromActions.ApiKeyResetSuccess()),
                    catchError((error) => of(new fromApplicationDataActions.PopulateError(error, ERROR_CONTEXTS.API_KEY)))
                )
            )
        )
    );
}





