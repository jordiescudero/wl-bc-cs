import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '@shared/shared.module';

import { contractReducer } from './contracts.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ContractEffects } from './contracts.effects';

@NgModule({
    imports: [
        SharedModule,
        StoreModule.forFeature('contract', contractReducer),
        EffectsModule.forFeature([
            ContractEffects
        ])
    ]
})

export class ContractStoreModule { }
