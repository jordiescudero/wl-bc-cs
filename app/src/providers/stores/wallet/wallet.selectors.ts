import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromReducer from './wallet.reducer';

// Model
import { WalletStateModel } from '@core/models/wallet-state.model';

export const getWallet = createFeatureSelector<WalletStateModel>('wallet');

export const isActive = createSelector(getWallet, fromReducer.isActive);

