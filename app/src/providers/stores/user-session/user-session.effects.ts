import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { from, of, throwError } from 'rxjs';

// Store
import { Store, Action} from '@ngrx/store';

// Constants
import { mergeMap, map, catchError } from 'rxjs/operators';

// Actions
import * as fromActions from './user-session.actions';
import * as fromApplicationDataActions from '@stores/application-data/application-data.actions';
import { Logger } from '@services/logger/logger.service';
import { UserSessionStateModel } from '@core/models/user-session-state.model';
import { AuthenticationService } from '@services/authentication/authentication.service';
import { UserSessionDatabaseService } from '@db/user-session-database.service';
import { USER_SESSION_CONSTANTS } from '@core/constants/user-session.constants';

// Environment
import { environment } from '@env/environment';
import { APPLICATION_DATA_CONSTANTS, ERROR_CONTEXTS } from '@core/constants/application-data.constants';

const log = new Logger('user-session.effects');

@Injectable()
export class UserSessionEffects {

    private accessTokenScheduledTime = 0;
    private accessTokenScheduledTimeTimer: any;
    private refreshTokenScheduledTime = 0;
    private refreshTokenScheduledTimeTimer: any;

    constructor(
        private actions$: Actions<fromActions.UserSessionActionActions>,
        private store: Store<UserSessionStateModel>,
        private authenticationService: AuthenticationService,
        private userSessionDatabaseService: UserSessionDatabaseService
    ) { }

    public initUserSession = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.UserSessionActionTypes.INIT_USER_SESSION),
            mergeMap((action) => {
                return this.userSessionDatabaseService.get(USER_SESSION_CONSTANTS.USER_SESSION).pipe(
                    map((userSessionStateModel) => {
                        this.scheduleRefresh(userSessionStateModel);
                        return new fromActions.InitUserSessionSuccess(userSessionStateModel);
                    })
                );
            })
        )
    );

    public refreshUserSession = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.UserSessionActionTypes.REFRESH_USER_SESSION),
            mergeMap(() => this.authenticationService.refresh().pipe(
                    mergeMap(async (refreshResult: any) => {
                            log.debug('Perform refresh');
                            const userSessionStateModel =
                                <UserSessionStateModel> await this.userSessionDatabaseService.get(USER_SESSION_CONSTANTS.USER_SESSION).toPromise();
                            if (refreshResult.accessToken) {
                                userSessionStateModel.accessTokenExpiration = new Date(refreshResult.accessToken.expiresAt);
                            }
                            if (refreshResult.refreshToken) {
                                userSessionStateModel.refreshTokenExpiration = new Date(refreshResult.refreshToken.expiresAt);
                            }

                            await this.userSessionDatabaseService.set(USER_SESSION_CONSTANTS.USER_SESSION, userSessionStateModel);
                            this.scheduleRefresh(userSessionStateModel);
                            return new fromActions.RefreshUserSessionSuccess(userSessionStateModel);
                    }),
                    catchError((error) => of(new fromApplicationDataActions.PopulateError(error, ERROR_CONTEXTS.USER_SESSION)))
                )
            )
        )
    );

    public loginUserSession = createEffect(() =>
    this.actions$.pipe(
        ofType(fromActions.UserSessionActionTypes.LOGIN_USER_SESSION),
        mergeMap( (action) => this.authenticationService.login(action.payload).pipe(
            mergeMap(async (loginResult) => {
                const userData = await this.authenticationService.getMe().toPromise();

                const userSessionStateModel: UserSessionStateModel = {
                    accessTokenExpiration :  new Date(loginResult.accessToken.expiresAt),
                    refreshTokenExpiration :  new Date(loginResult.refreshToken.expiresAt),
                    ...userData
                };

                await this.userSessionDatabaseService.set(USER_SESSION_CONSTANTS.USER_SESSION, userSessionStateModel);
                this.scheduleRefresh(userSessionStateModel);
                return new fromActions.LoginUserSessionSuccess(userSessionStateModel);
            }),
            catchError((error) => of(new fromApplicationDataActions.PopulateError(error, ERROR_CONTEXTS.USER_SESSION)))
         ))
    ));

    public logoutUserSession = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.UserSessionActionTypes.LOGOUT_USER_SESSION),
            mergeMap((action) => this.authenticationService.logout().pipe(
                    map( () => this.clearLoginState.bind(this)()),
                    catchError((error) => {
                        // TODO: Not logged out on server side ...
                        this.store.dispatch(this.clearLoginState.bind(this)());
                        return of(new fromApplicationDataActions.PopulateError(error, ERROR_CONTEXTS.USER_SESSION));
                    })
                )
            )
        )
    );

    private clearLoginState() {
        this.userSessionDatabaseService.remove(USER_SESSION_CONSTANTS.USER_SESSION);
        clearTimeout(this.accessTokenScheduledTimeTimer);
        clearTimeout(this.refreshTokenScheduledTimeTimer);
        return new fromActions.LogoutUserSessionSuccess();
    }

    private scheduleRefresh(userSessionStateModel: UserSessionStateModel) {
        const now = new Date().getTime();

        if ((userSessionStateModel) &&
            (userSessionStateModel.accessTokenExpiration) &&
            (userSessionStateModel.accessTokenExpiration.getTime() > now) &&
            (this.accessTokenScheduledTime !== userSessionStateModel.accessTokenExpiration.getTime())
           ) {
                clearTimeout(this.accessTokenScheduledTimeTimer);
                this.accessTokenScheduledTime = userSessionStateModel.accessTokenExpiration.getTime();
                this.accessTokenScheduledTimeTimer = setTimeout(
                    () => {
                      this.store.dispatch( new fromActions.RefreshUserSession());
                    }, userSessionStateModel.accessTokenExpiration.getTime() - now - environment.accessTokenRequesTimeWindow);
        }

        if ((userSessionStateModel) &&
            (userSessionStateModel.refreshTokenExpiration) &&
            (userSessionStateModel.refreshTokenExpiration.getTime() > now) &&
            (this.refreshTokenScheduledTime !== userSessionStateModel.refreshTokenExpiration.getTime())
           ) {
                clearTimeout(this.refreshTokenScheduledTimeTimer);
                this.refreshTokenScheduledTime = userSessionStateModel.refreshTokenExpiration.getTime();
                this.refreshTokenScheduledTimeTimer = setTimeout(
                    () => {
                      this.store.dispatch( new fromActions.RefreshUserSession());
                    }, userSessionStateModel.refreshTokenExpiration.getTime() - now -  environment.refreshTokenRequestTimeWindow);
        }
    }
}





