import { UserSessionStateModel } from '@models/user-session-state.model';
import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { UserSessionActionTypes, UserSessionActionActions } from './user-session.actions';

export interface UserSessionState extends EntityState<UserSessionStateModel> {}

export const userSessionAdapter = createEntityAdapter<UserSessionStateModel>();

const userSessionInitialState: UserSessionState = userSessionAdapter.getInitialState({});

export function userSessionReducer(state: UserSessionState = userSessionInitialState, action: UserSessionActionActions): UserSessionState {
    switch (action.type) {
        case UserSessionActionTypes.LOGIN_USER_SESSION_SUCCESS:
        case UserSessionActionTypes.LOGIN_USER_SESSION_ERROR:
        case UserSessionActionTypes.INIT_USER_SESSION_SUCCESS:
            return { ...{}, ...userSessionInitialState, ...action.payload };
        case UserSessionActionTypes.REFRESH_USER_SESSION_SUCCESS:
            return { ...{}, ...state, ...action.payload };
        case UserSessionActionTypes.LOGOUT_USER_SESSION_SUCCESS:
            return userSessionInitialState;
        default:
            return state;
    }
}


