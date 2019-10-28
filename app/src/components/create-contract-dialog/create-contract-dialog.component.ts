// Basic
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Logger } from '@services/logger/logger.service';

import { FormGroup, FormBuilder } from '@angular/forms';

const log = new Logger('create-contract-dialog.component');


@Component({
  selector: 'blo-create-contract-dialog',
  templateUrl: 'create-contract-dialog.component.html',
  styleUrls: ['create-contract-dialog.component.scss']
})
export class CreateContractDialogComponent implements OnInit {

  public contractForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CreateContractDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) { }

  public ngOnInit() {
    console.log(this.data);
    this.contractForm = this.fb.group({
      name: [
        {
          value: this.data ? this.data.name : '',
          disabled: this.data ? this.data.id : false
        }
      ],
      description: [this.data ? this.data.description : ''],
      public: [this.data ? this.data.public : false],
      address: [
        {
          value: this.data ? this.data.address : '',
          disabled: this.data ? this.data.id : false
        }
      ]
    });
  }

  public getErrorMessage(field) {
    const fieldForm = this.contractForm.get(field);
    return fieldForm.hasError('required') ? 'You must enter a value' :
      fieldForm.hasError('email') ? 'Field not valid' :
        '';
  }
}
