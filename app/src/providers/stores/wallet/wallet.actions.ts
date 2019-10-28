import { Action } from '@ngrx/store';
import { WalletStateModel } from '@core/models/wallet-state.model';

export enum WalletActionTypes {
    INIT_WALLET = '[Wallet] init wallet',
    INIT_WALLET_SUCCESS = '[Wallet] init wallet success',
    ACTIVATE_WALLET = '[Wallet] activate wallet',
    DEACTIVATE_WALLET = '[Wallet] deactivate wallet',
    UPDATE_WALLET_SUCCESS = '[Wallet] update wallet success',
}

export class ActivateWallet implements Action {
    public readonly type = WalletActionTypes.ACTIVATE_WALLET;
    constructor() { }
}

export class DeactivateWallet implements Action {
    public readonly type = WalletActionTypes.DEACTIVATE_WALLET;
    constructor() { }
}

export class UpdateWalletSuccess implements Action {
    public readonly type = WalletActionTypes.UPDATE_WALLET_SUCCESS;
    constructor(public readonly payload?: WalletStateModel) { }
}

export class InitWallet implements Action {
    public readonly type = WalletActionTypes.INIT_WALLET;
}

export class InitWalletSuccess implements Action {
    public readonly type = WalletActionTypes.INIT_WALLET_SUCCESS;
    constructor(public readonly payload?: WalletStateModel) { }
}

export type WalletActionActions = ActivateWallet | DeactivateWallet | UpdateWalletSuccess |  InitWallet | InitWalletSuccess;
