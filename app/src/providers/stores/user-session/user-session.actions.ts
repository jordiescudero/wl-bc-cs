import { Action } from '@ngrx/store';
import { UserSessionStateModel } from '@core/models/user-session-state.model';
import { LoginRequestDTO } from '@core/models/user-session.model';

export enum UserSessionActionTypes {
    INIT_USER_SESSION = '[User Session] init user session',
    INIT_USER_SESSION_SUCCESS = '[User Session] init user session success',
    REFRESH_USER_SESSION = '[User Session] refresh user session',
    REFRESH_USER_SESSION_SUCCESS = '[User Session] refresh user session success',
    LOGIN_USER_SESSION = '[User Session] login user session',
    LOGIN_USER_SESSION_ERROR = '[User Session] login user session error',
    LOGIN_USER_SESSION_SUCCESS = '[User Session] login user session success',
    LOGOUT_USER_SESSION = '[User Session] logout user session',
    LOGOUT_USER_SESSION_SUCCESS = '[User Session] logout user session success',
}

export class LoginUserSessionError implements Action {
    public readonly type = UserSessionActionTypes.LOGIN_USER_SESSION_ERROR;
    constructor(public readonly payload?: UserSessionStateModel) { }
}

export class InitUserSession implements Action {
    public readonly type = UserSessionActionTypes.INIT_USER_SESSION;
}
export class InitUserSessionSuccess implements Action {
    public readonly type = UserSessionActionTypes.INIT_USER_SESSION_SUCCESS;
    constructor(public readonly payload?: UserSessionStateModel) { }
}
export class RefreshUserSession implements Action {
    public readonly type = UserSessionActionTypes.REFRESH_USER_SESSION;
}
export class RefreshUserSessionSuccess implements Action {
    public readonly type = UserSessionActionTypes.REFRESH_USER_SESSION_SUCCESS;
    constructor(public readonly payload?: UserSessionStateModel) { }
}
export class LoginUserSession implements Action {
    public readonly type = UserSessionActionTypes.LOGIN_USER_SESSION;
    constructor(public readonly payload?: LoginRequestDTO) { }
}
export class LoginUserSessionSuccess implements Action {
    public readonly type = UserSessionActionTypes.LOGIN_USER_SESSION_SUCCESS;
    constructor(public readonly payload?: UserSessionStateModel) { }
}
export class LogoutUserSession implements Action {
    public readonly type = UserSessionActionTypes.LOGOUT_USER_SESSION;
    constructor() { }
}
export class LogoutUserSessionSuccess implements Action {
    public readonly type = UserSessionActionTypes.LOGOUT_USER_SESSION_SUCCESS;
    constructor() { }
}
export type UserSessionActionActions = RefreshUserSession | RefreshUserSessionSuccess |  InitUserSession | InitUserSessionSuccess |
     LoginUserSession | LoginUserSessionSuccess | LogoutUserSession | LogoutUserSessionSuccess | LoginUserSessionError;
