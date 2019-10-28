import { Title } from '@angular/platform-browser';
import { Component, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';

import { Store } from '@ngrx/store';
import * as fromSelectors from '@stores/application-data/application-data.selectors';
import { ApplicationDataStateModel } from '@core/models/application-data-state.model';

import { BloButtonsHostDirective } from '@directives/shell-dapp-options.directive';
import { BloBackButtonHostDirective } from '@directives/shell-back-button.directive';

import { Router, NavigationEnd, ActivatedRoute, Route } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Logger } from '@services/logger/logger.service';

import { TransactionService, Transaction } from '@services/web3/transactions/transaction.service';
import { Subscription, interval } from 'rxjs';
import { MediaObserver } from '@angular/flex-layout';
import * as fromUserSessionActions from '@stores/user-session/user-session.actions';
import * as fromUserSessionSelectors from '@stores/user-session/user-session.selectors';

const log = new Logger('blo-shell');

@Component({
  selector: 'blo-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit, OnDestroy {

  public imgToolbar: string;
  public isLoading = false;
  private transactionSubscription: Subscription;
  public userSession$: Subscription;
  public autoLogout$: Subscription;
  private autoLogoutTime: number;

  @ViewChild(BloButtonsHostDirective, { static: true }) public bloButtons: BloButtonsHostDirective;
  @ViewChild(BloBackButtonHostDirective, { static: true }) public bloBackButton: BloBackButtonHostDirective;

  constructor(
    private titleService: Title,
    private store: Store<ApplicationDataStateModel>,
    private componentFactoryResolver: ComponentFactoryResolver,
    private media: MediaObserver,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private transactionService: TransactionService,
  ) {
  }

  public ngOnDestroy() {
    this.unregister();
    this.userSession$.unsubscribe();
    this.autoLogout$.unsubscribe();
  }

  public ngOnInit() {
    this.register();

    this.userSession$ = this.store.select(fromUserSessionSelectors.getUserSession).subscribe(userSession => {
      if (userSession.accessTokenExpiration) {
        this.autoLogoutTime = userSession.accessTokenExpiration.getTime();
      }
    });

    this.autoLogout$ = interval(1000).subscribe(() => {
      const deltaTime = this.autoLogoutTime - new Date().getTime();
      // log.debug(deltaTime);
      if (deltaTime <= 0) {
        this.logout();
      }
    });

    this.store.select(fromSelectors.getTheme).subscribe((theme) => {
      this._themeChanges(theme);
    });

    this.findChildRoute(this.activatedRoute).data.subscribe(event => {
      this.loadAuxiliarOptions(event);
    });

    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map((route) => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter((route) => route.outlet === 'primary'),
      mergeMap((route) => route.data)
    ).subscribe((event) => {
      this.loadAuxiliarOptions(event);
    });
  }

  private findChildRoute(route): Route {
    if (route.firstChild === null) {
      return route;
    } else {
      return this.findChildRoute(route.firstChild);
    }
  }

  private loadAuxiliarOptions(event) {
    this.bloButtons.viewContainerRef.clear();
    if (event.shellOptions && event.shellOptions.auxiliarOptionsComponent) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(event.shellOptions.auxiliarOptionsComponent);
      this.bloButtons.viewContainerRef.createComponent(componentFactory);
    }
  }

  get title(): string {
    return this.titleService.getTitle();
  }

  get isMobile(): boolean {
    return this.media.isActive('xs') || this.media.isActive('sm');
  }

  private _themeChanges(theme) {
    switch (theme) {
      default:
        this.imgToolbar = 'logo_bloomen';
    }
  }

  private register() {

    this.transactionSubscription = this.transactionService
      .getTransactions()
      .subscribe((transactions: Transaction[]) => {
        this.isLoading = transactions.length > 0;
      });
  }
  private unregister() {
    this.transactionSubscription.unsubscribe();
    this.transactionSubscription = null;
  }

  public logout() {
    this.store.dispatch(new fromUserSessionActions.LogoutUserSession());
  }
}
