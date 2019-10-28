import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

import { Logger } from '@services/logger/logger.service';

import { Subscription, Observable, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { UserSessionStateModel } from '@core/models/user-session-state.model';
import * as fromUserSessionSelectors from '@stores/user-session/user-session.selectors';
const log = new Logger('AuthenticationGuard');

@Injectable({providedIn: 'root'})
export class AuthenticationGuard implements CanActivate {

  public userSession$: Subscription;
  private authenticated: Observable<boolean>;

  constructor(
    private router: Router,
    private store: Store<UserSessionStateModel>
    ) {
      this.userSession$ = this.store.select(fromUserSessionSelectors.getUserSession).subscribe(userSession => {
        if (userSession.accessTokenExpiration) {
          this.authenticated = of(true);
        } else {
          this.authenticated = of(false);
        }
      });
   }

  public canActivate(): Observable<boolean> {
    return  this.authenticated;
  }

}
