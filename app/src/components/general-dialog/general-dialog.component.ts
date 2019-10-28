// Basic
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Logger } from '@services/logger/logger.service';

const log = new Logger('general-dialog.component');


@Component({
  selector: 'blo-general-dialog',
  templateUrl: 'general-dialog.component.html',
  styleUrls: ['general-dialog.component.scss']
})
export class GeneralDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<GeneralDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  public closeDialog() {
    this.dialogRef.close();
  }
}
