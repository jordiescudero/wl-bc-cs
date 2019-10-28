import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromReducer from './api-keys.reducer';

export const apiKeyState = createFeatureSelector<fromReducer.ApiKeyState>('apiKey');

export const { selectAll, selectIds } = fromReducer.apiKeyAdapter.getSelectors(apiKeyState);

export const getCurrentQuery = createSelector(apiKeyState, fromReducer.getCurrentQuery);
