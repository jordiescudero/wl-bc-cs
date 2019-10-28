import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromReducer from './contracts.reducer';

export const contractState = createFeatureSelector<fromReducer.ContractState>('contract');

export const { selectAll, selectIds } = fromReducer.contractAdapter.getSelectors(contractState);

export const getCurrentQuery = createSelector(contractState, fromReducer.getCurrentQuery);

export const getCount = createSelector(contractState, fromReducer.getCount);
