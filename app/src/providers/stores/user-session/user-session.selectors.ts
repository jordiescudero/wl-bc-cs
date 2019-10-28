import { createFeatureSelector, createSelector } from '@ngrx/store';

// Model
import { UserSessionStateModel } from '@core/models/user-session-state.model';

export const getUserSession = createFeatureSelector<UserSessionStateModel>('userSession');


