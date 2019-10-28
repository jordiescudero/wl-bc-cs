import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { merge } from 'rxjs';

// Store
import { Store, select } from '@ngrx/store';
import * as fromSelectors from '@stores/application-data/application-data.selectors';

// Constants
import { withLatestFrom, map, mergeMap, catchError } from 'rxjs/operators';

// Actions
import * as fromActions from './application-data.actions';
import { Logger } from '@services/logger/logger.service';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationDataStateModel } from '@core/models/application-data-state.model';
import { ApplicationDataDatabaseService } from '@db/application-data-database.service';
import { APPLICATION_DATA_CONSTANTS } from '@core/constants/application-data.constants';
import { THEMES } from '@core/constants/themes.constants';

import { PreloadImages } from '@services/preload-images/preload-images.service';
import { ErrorService } from '@core/error/error-service';

const log = new Logger('application-data.effects');

@Injectable()
export class ApplicationDataEffects {

    constructor(
        private actions$: Actions<fromActions.ApplicationDataActions>,
        private overlayContainer: OverlayContainer,
        private store: Store<ApplicationDataStateModel>,
        private applicationDataDatabase: ApplicationDataDatabaseService,
        private errorService: ErrorService
    ) { }

    public populateError = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.ApplicationDataActionTypes.POPULATE_ERROR),
            map((action: any) => {
                this.errorService.populateError(action.error, action.context);
            })
        )
    , { dispatch: false });

    public persistFirstRun = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.ApplicationDataActionTypes.CHANGE_FIRST_RUN),
            withLatestFrom(this.store.select(fromSelectors.getIsFirstRun)),
            map(([action, isFirstRun]) => {
                this.applicationDataDatabase.set(APPLICATION_DATA_CONSTANTS.FIRST_RUN, isFirstRun);
            })
        )
    , { dispatch: false });

    public persistTheme =  createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.ApplicationDataActionTypes.CHANGE_THEME),
            withLatestFrom(this.store.select(fromSelectors.getTheme)),
            map(([action, theme]) => {
                this.applicationDataDatabase.set(APPLICATION_DATA_CONSTANTS.THEME, theme);
            })
        )
    , { dispatch: false });

    public updateApplicationData = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.ApplicationDataActionTypes.INIT_APP_DATA),
            mergeMap(() => {
                const firstRun$ = this.applicationDataDatabase.get(APPLICATION_DATA_CONSTANTS.FIRST_RUN).pipe(
                    map((value) => {
                        return {
                            type: APPLICATION_DATA_CONSTANTS.FIRST_RUN,
                            value
                        };
                    })
                );
                const theme$ = this.applicationDataDatabase.get(APPLICATION_DATA_CONSTANTS.THEME).pipe(
                    map((value) => {
                        return {
                            type: APPLICATION_DATA_CONSTANTS.THEME,
                            value
                        };
                    })
                );
                return merge(firstRun$, theme$).pipe(
                    map((element: any) => {
                        switch (element.type) {
                            case APPLICATION_DATA_CONSTANTS.FIRST_RUN: {
                                const isFirstRun = element.value || element.value === undefined;
                                return new fromActions.ChangeFirstRun({ isFirstRun });
                            }
                            case APPLICATION_DATA_CONSTANTS.THEME: {
                                const theme = element.value ? element.value : THEMES['DEMO-DAPP'];
                                return new fromActions.ChangeTheme({ theme });
                            }
                        }
                    })
                );
            })
        )
    );

    public updateTheme = createEffect(() =>
            this.actions$.pipe(
            ofType(fromActions.ApplicationDataActionTypes.CHANGE_THEME),
            withLatestFrom(this.store.select(fromSelectors.getTheme)),
            map(([action, effectiveTheme]) => {
                const classList = this.overlayContainer.getContainerElement().classList;
                const toRemove = Array.from(classList).filter((item: string) =>
                    item.includes('-theme')
                );
                if (toRemove.length) {
                    classList.remove(...toRemove);
                }
                classList.add(effectiveTheme);
            })
        )
    , { dispatch: false });
}





