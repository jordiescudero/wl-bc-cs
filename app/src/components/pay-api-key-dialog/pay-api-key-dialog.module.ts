// Basic
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { MaterialModule } from '@app/material.module';

// Components
import { PayApiKeyDialogComponent } from './pay-api-key-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    TranslateModule,
    RouterModule,
    FlexLayoutModule,
    MaterialModule,
    QRCodeModule,
    ClipboardModule
  ],
  declarations: [PayApiKeyDialogComponent],
  exports: [PayApiKeyDialogComponent],
  entryComponents: [PayApiKeyDialogComponent]
})
export class PayApiKeyDialogModule { }
