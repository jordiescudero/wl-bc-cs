import { AppState } from '@core/core.state';
import { Contract } from '@services/web3/contracts';

export interface WalletStateModel {
    active: boolean;
}

export interface State extends AppState {
    WalletStateModel: WalletStateModel;
}
