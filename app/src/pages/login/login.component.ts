import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { environment } from '@env/environment';
// Services

import { UserSessionStateModel } from '@core/models/user-session-state.model';

import * as fromUserSessionActions from '@stores/user-session/user-session.actions';
import * as fromUserSessionSelectors from '@stores/user-session/user-session.selectors';

import { Subscription } from 'rxjs';
import { Logger } from '@services/logger/logger.service';
import { NotificationService } from '@core/error/notification-service';
import { ERROR_CONTEXTS } from '@core/constants/application-data.constants';
const log = new Logger('Login');

@Component({
  selector: 'blo-app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  public userSession$: Subscription;
  public notifierUserSession$: Subscription;
  private loginForm: FormGroup;
  public error;


  constructor(private router: Router,
              private store: Store<UserSessionStateModel>,
              private formBuilder: FormBuilder,
              private notificationService: NotificationService) {
    this.createForm();
  }

  public ngOnInit() {
    this.notifierUserSession$ = this.notificationService.getSubscription(ERROR_CONTEXTS.USER_SESSION, (error) => this.error = error );
    this.userSession$ = this.store.select(fromUserSessionSelectors.getUserSession).subscribe(userSession => {
      if ((userSession.accessTokenExpiration) && (userSession.accessTokenExpiration.getTime() > new Date().getTime())) {
        this.router.navigate(['/home'], { replaceUrl: true });
      }
    });
  }

  public ngOnDestroy() {
    this.userSession$.unsubscribe();
    this.notifierUserSession$.unsubscribe();
  }

  public login() {
    this.store.dispatch(new fromUserSessionActions.LoginUserSession(this.loginForm.value));
  }

  private createForm() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      remember: true
    });
  }

}
