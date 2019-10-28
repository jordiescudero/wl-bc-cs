import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

// import { SharedModule } from '@app/shared';
import { MaterialModule } from '@app/material.module';
import { ResetRoutingModule } from './reset-routing.module';
import { ResetComponent } from './reset.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    // SharedModule,
    FlexLayoutModule,
    MaterialModule,
    ResetRoutingModule
  ],
  declarations: [
    ResetComponent
  ]
})
export class ResetModule { }
