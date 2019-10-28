// Basic
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { SharedModule } from '@shared/shared.module';
import { MaterialModule } from '@app/material.module';
import { ApiKeysRoutingModule } from './api-keys-routing.module';
import { GeneralDialogModule } from '@components/general-dialog/general-dialog.module';

// Home
import { ApiKeysComponent } from './api-keys.component';
import { MenuModule } from '@components/menu/menu.module';
import { CreateApiKeyDialogModule } from '@components/create-api-key-dialog/create-api-key-dialog.module';
import { PayApiKeyDialogModule } from '@components/pay-api-key-dialog/pay-api-key-dialog.module';


/**
 * Module to import and export all the components for the home page.
 */
@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    SharedModule,
    FlexLayoutModule,
    MaterialModule,
    ApiKeysRoutingModule,
    MenuModule,
    GeneralDialogModule,
    PayApiKeyDialogModule,
    CreateApiKeyDialogModule
  ],
  declarations: [ApiKeysComponent]
})
export class ApiKeysModule { }
