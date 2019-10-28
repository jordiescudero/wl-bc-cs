import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '@shared/shared.module';

import { userSessionReducer } from './user-session.reducer';
import { EffectsModule } from '@ngrx/effects';
import { UserSessionEffects } from './user-session.effects';

@NgModule({
    imports: [
        SharedModule,
        StoreModule.forFeature('userSession', userSessionReducer),
        EffectsModule.forFeature([
            UserSessionEffects
        ])
    ]
})

export class UserSessionStoreModule { }
