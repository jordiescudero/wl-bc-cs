import { Action } from '@ngrx/store';
import { ApiKeyModel } from '@core/models/api-key.model';

export enum ApiKeyActionTypes {
    INIT_API_KEY = '[ApiKey] init ApiKey initialState',
    INIT_API_KEY_SUCCESS = '[ApiKey] init ApiKey initialState success',
    QUERY_API_KEY = '[ApiKey] Query ApiKey',
    QUERY_API_KEY_SUCCESS = '[ApiKey] Query ApiKey  success',
    UPDATE_API_KEY = '[ApiKey] Update  ApiKey',
    DELETE_API_KEY = '[ApiKey] Delete ApiKey',
    ADD_API_KEY = '[ApiKey] Add ApiKey',
    PAY_API_KEY = '[ApiKey] Pay ApiKey',
    RESET_API_KEY = '[ApiKey] Reset ApiKey',
    RESET_API_KEY_SUCCESS = '[ApiKey] Reset ApiKey  success',
}

export class ApiKeyInit implements Action {
    public readonly type = ApiKeyActionTypes.INIT_API_KEY;
    constructor() { }
}

export class ApiKeyInitSuccess implements Action {
    public readonly type = ApiKeyActionTypes.INIT_API_KEY_SUCCESS;
    constructor(public readonly query: string, public readonly payload: ApiKeyModel[]) { }
}

export class ApiKeyQuery implements Action {
    public readonly type = ApiKeyActionTypes.QUERY_API_KEY;
    constructor(public readonly query: string) { }
}

export class ApiKeyQuerySuccess implements Action {
    public readonly type = ApiKeyActionTypes.QUERY_API_KEY_SUCCESS;
    constructor(public readonly query: string, public readonly payload: ApiKeyModel[]) { }
}

export class ApiKeyUpdate implements Action {
    public readonly type = ApiKeyActionTypes.UPDATE_API_KEY;
    constructor(public readonly id: string, public readonly item: ApiKeyModel) { }
}

export class ApiKeyDelete implements Action {
    public readonly type = ApiKeyActionTypes.DELETE_API_KEY;
    constructor(public readonly id: string) { }
}

export class ApiKeyAdd implements Action {
    public readonly type = ApiKeyActionTypes.ADD_API_KEY;
    constructor(public readonly item: ApiKeyModel) { }
}

export class ApiKeyReset implements Action {
    public readonly type = ApiKeyActionTypes.RESET_API_KEY;
    constructor() { }
}

export class ApiKeyResetSuccess implements Action {
    public readonly type = ApiKeyActionTypes.RESET_API_KEY_SUCCESS;
    constructor() { }
}

export class ApiKeyPay implements Action {
    public readonly type = ApiKeyActionTypes.PAY_API_KEY;
    constructor(public readonly name: string, public readonly amount: number ) { }
}

export type ApiKeyActions = ApiKeyInit | ApiKeyInitSuccess | ApiKeyQuery | ApiKeyQuerySuccess |
                             ApiKeyUpdate | ApiKeyDelete | ApiKeyAdd | ApiKeyReset | ApiKeyPay | ApiKeyResetSuccess;
