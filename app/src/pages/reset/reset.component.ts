import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { environment } from '@env/environment';
// Services
import { Logger } from '@services/logger/logger.service';
import { UserSessionStateModel } from '@core/models/user-session-state.model';

import * as fromUserSessionActions from '@stores/user-session/user-session.actions';
import * as fromUserSessionSelectors from '@stores/user-session/user-session.selectors';

import { Subscription } from 'rxjs';
import { AuthenticationService } from '@services/authentication/authentication.service';
import { finalize } from 'rxjs/operators';

const log = new Logger('Reset');

@Component({
  selector: 'blo-app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss']
})
export class ResetComponent implements OnInit, OnDestroy {

  public userSession$: Subscription;
  private resetForm: FormGroup;
  private successfulRequest: boolean;

  constructor(private router: Router,
              private store: Store<UserSessionStateModel>,
              private authenticationService: AuthenticationService,
              private formBuilder: FormBuilder) {
    this.createForm();
    this.successfulRequest = false;
  }

  public ngOnInit() {
    this.userSession$ = this.store.select(fromUserSessionSelectors.getUserSession).subscribe(userSession => {
      if ((userSession.accessTokenExpiration) && (userSession.accessTokenExpiration.getTime() > new Date().getTime())) {
        this.router.navigate(['/home'], { replaceUrl: true });
      }
    });
  }

  public ngOnDestroy() {
    this.userSession$.unsubscribe();
  }

  public reset() {
    this.authenticationService.reset(this.resetForm.value)
     .pipe(finalize(() => {
       log.debug('Reset request finalized');
     }))
     .subscribe( resp => {
         // resultado OK
         log.debug(resp);
         this.successfulRequest = true;
       }, error => {
         // resultado ERROR
         log.debug(error);
       }
     );
   }

  private createForm() {
    this.resetForm = this.formBuilder.group({
      email: ['', Validators.required],
    });
  }

}
