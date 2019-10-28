import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError, Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { LoginRequestDTO, CredentialsDTO, RegisterRequestDTO } from '@core/models/user-session.model';
import * as fromUserSessionSelectors from '@stores/user-session/user-session.selectors';
import { Store } from '@ngrx/store';
import { UserSessionStateModel } from '@core/models/user-session-state.model';

/**
 * Provides a base for authentication workflow.
 * The Credentials interface as well as login/logout methods should be replaced with proper implementation.
 */
@Injectable({providedIn: 'root'})
export class AuthenticationService {

  public userSession$: Subscription;

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private store: Store<UserSessionStateModel>
  ) {
    this.userSession$ = this.store.select(fromUserSessionSelectors.getUserSession).subscribe(userSession => {
      if ((!userSession.accessTokenExpiration) || (userSession.accessTokenExpiration.getTime() <= new Date().getTime())) {
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    });
  }

  public login(context: LoginRequestDTO): Observable<CredentialsDTO> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/x-www-form-urlencoded'
      })
    };
    return this.httpClient
    .post('/auth/login', `email=${context.username}&password=${context.password}`, httpOptions)
    .pipe(
        map((body: any) => body)
    );
  }

  public register(context: RegisterRequestDTO): Observable<any> {
    return this.httpClient
    .post('/auth/user/register', context)
    .pipe(
        map((body: any) => body)
    );
  }

  public reset(context: RegisterRequestDTO): Observable<any> {
    return this.httpClient
    .post('/auth/user/remember', context)
    .pipe(
        map((body: any) => body)
    );
  }

  public refresh(): Observable<CredentialsDTO>  {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/x-www-form-urlencoded'
      })
    };
    return this.httpClient
    .post('/auth/token/refresh', {}, httpOptions)
    .pipe(
        map((body: any) => body)
    );
  }

  public getMe(): Observable<CredentialsDTO>  {
    return this.httpClient
    .get('/auth/user/me')
    .pipe(
        map((body: any) => body)
    );
  }

  public logout(): Observable<boolean>  {
    return this.httpClient
    .get('/auth/logout')
    .pipe(
        map(() => true)
    );
  }
}
