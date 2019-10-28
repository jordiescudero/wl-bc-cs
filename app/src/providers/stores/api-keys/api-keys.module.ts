import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '@shared/shared.module';

import { apiKeyReducer } from './api-keys.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ApiKeyEffects } from './api-keys.effects';

@NgModule({
    imports: [
        SharedModule,
        StoreModule.forFeature('apiKey', apiKeyReducer),
        EffectsModule.forFeature([
            ApiKeyEffects
        ])
    ]
})

export class ApiKeyStoreModule { }
