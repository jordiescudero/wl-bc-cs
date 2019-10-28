import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, ErrorHandler } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ApplicationDataStoreModule } from '@stores/application-data/application-data.module';
import { WalletStoreModule } from '@stores/wallet/wallet.module';
import { ApiKeyStoreModule } from '@stores/api-keys/api-keys.module';
import { ContractStoreModule } from '@stores/contracts/contracts.module';

import { environment } from '@env/environment';
import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';
import { HomeModule } from '@pages/home/home.module';
import { ShellModule } from '@shell/shell.module';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { Store } from '@ngrx/store';

import * as fromAppActions from '@stores/application-data/application-data.actions';
import * as fromWalletActions from '@stores/wallet/wallet.actions';
import * as fromApiKeysActions from '@stores/api-keys/api-keys.actions';
import * as fromContractsActions from '@stores/contracts/contracts.actions';

import * as fromUserSessionActions from '@stores/user-session/user-session.actions';

import * as fromAppSelectors from '@stores/application-data/application-data.selectors';
import * as fromWalletSelectors from '@stores/wallet/wallet.selectors';

import { skipWhile, first } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { devToolsConfig } from '@config/devtools.config';

import { LoginModule } from '@pages/login/login.module';
import { UserSessionStoreModule } from '@stores/user-session/user-session.module';
import { ResetModule } from '@pages/reset/reset.module';
import { RegisterModule } from '@pages/register/register.module';
import { GlobalErrorHandler } from '@core/error/global-error-handler';


export function onAppInit(store: Store<any>): () => Promise<any> {
  return (): Promise<any> => {
    return new Promise<any>((resolve, reject) => {

      const appInit$ = store.select(fromAppSelectors.getApplicationData).pipe(skipWhile((value) => {
        return !value;
      }), first());

      const walletInit$ = store.select(fromWalletSelectors.getWallet).pipe(skipWhile((value) => {
        return !value;
      }), first());

      forkJoin([appInit$, walletInit$]).subscribe(() => {
        resolve();
      });
      store.dispatch(new fromAppActions.InitAppData());
      store.dispatch(new fromWalletActions.InitWallet());
      store.dispatch(new fromUserSessionActions.InitUserSession());
      store.dispatch(new fromApiKeysActions.ApiKeyInit());
      store.dispatch(new fromContractsActions.ContractInit());
    });
  };
}

@NgModule({
  imports: [
    BrowserModule,
    ServiceWorkerModule.register('./ngsw-worker.js', {
      enabled: environment.production
    }),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    CoreModule,
    SharedModule,
    ShellModule,
    HomeModule,
    LoginModule,
    ResetModule,
    RegisterModule,
    FlexLayoutModule,
    ApplicationDataStoreModule,
    WalletStoreModule,
    ApiKeyStoreModule,
    ContractStoreModule,
    UserSessionStoreModule,
    StoreDevtoolsModule.instrument(devToolsConfig),
    AppRoutingModule // must be imported as the last module as it contains the fallback route
  ],
  declarations: [AppComponent],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: onAppInit,
      multi: true,
      deps: [Store]
    },
    {provide: ErrorHandler, useClass: GlobalErrorHandler}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
