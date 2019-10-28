import { AppState } from '@core/core.state';

export interface UserSessionStateModel {
    accessTokenExpiration?: Date;
    refreshTokenExpiration?: Date;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
}

export interface State extends AppState {
    userSessionStateModel: UserSessionStateModel;
}
