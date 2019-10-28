import { WalletStateModel } from '@models/wallet-state.model';
import { WalletActionTypes, WalletActionActions } from './wallet.actions';

export function WalletReducer(state: WalletStateModel, action: WalletActionActions): WalletStateModel {
    switch (action.type) {
        case WalletActionTypes.UPDATE_WALLET_SUCCESS:
        case WalletActionTypes.INIT_WALLET_SUCCESS:
            return { ...{}, ...state, ...action.payload };
        default:
            return state;
    }
}

export const isActive = (state: WalletStateModel) => state ? state.active : false;
