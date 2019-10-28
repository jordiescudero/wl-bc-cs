import { Action } from '@ngrx/store';
import { ERROR_CONTEXTS } from '@core/constants/application-data.constants';

export enum ApplicationDataActionTypes {
    INIT_APP_DATA = '[Application Data] init application data async initialState',
    CHANGE_FIRST_RUN = '[Application Data] change first run',
    CHANGE_THEME = '[Application Data] change theme',
    POPULATE_ERROR = '[Application Data] populate error'
}

export class ChangeTheme implements Action {
    public readonly type = ApplicationDataActionTypes.CHANGE_THEME;
    constructor(public readonly payload: { theme: string }) { }
}

export class ChangeFirstRun implements Action {
    public readonly type = ApplicationDataActionTypes.CHANGE_FIRST_RUN;
    constructor(public readonly payload: { isFirstRun: boolean }) { }
}

export class InitAppData implements Action {
    public readonly type = ApplicationDataActionTypes.INIT_APP_DATA;
}

export class PopulateError implements Action {
    public readonly type = ApplicationDataActionTypes.POPULATE_ERROR;
    constructor(public readonly error: any, public readonly context: ERROR_CONTEXTS) { }
}


export type ApplicationDataActions = ChangeTheme | ChangeFirstRun | InitAppData;
