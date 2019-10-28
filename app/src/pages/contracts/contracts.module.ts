// Basic
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules

import { ContractsRoutingModule } from './contracts-routing.module';
import { GeneralDialogModule } from '@components/general-dialog/general-dialog.module';

// Home
import { ContractsComponent } from './contracts.component';
import { MaterialModule } from '@app/material.module';
import { MenuModule } from '@components/menu/menu.module';
import { SharedModule } from '@shared/shared.module';
import { CreateContractDialogModule } from '@components/create-contract-dialog/create-contract-dialog.module';


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
    ContractsRoutingModule,
    MenuModule,
    GeneralDialogModule,
    CreateContractDialogModule
  ],
  declarations: [ContractsComponent]
})
export class ContractsModule { }
