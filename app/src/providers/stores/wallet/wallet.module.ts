import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '@shared/shared.module';

import { WalletReducer } from './wallet.reducer';
import { EffectsModule } from '@ngrx/effects';
import { WalletEffects } from './wallet.effects';

@NgModule({
    imports: [
        SharedModule,
        StoreModule.forFeature('wallet', WalletReducer),
        EffectsModule.forFeature([
            WalletEffects
        ])
    ]
})

export class WalletStoreModule { }
