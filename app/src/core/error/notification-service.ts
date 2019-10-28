import { Injectable} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ERROR_CONTEXTS } from '@core/constants/application-data.constants';
import { Observable, Subject, BehaviorSubject, Subscription} from 'rxjs';
import { share, refCount, publish, tap, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private contextSubjects = {};
  private contextObservables = {};
  private contextCounter = {};

  constructor(public snackBar: MatSnackBar) {
    Object.keys(ERROR_CONTEXTS).forEach((item) => {
      // Context Observer creation.
      if (isNaN(Number(item))) {
        const subject = new Subject<string>();
        this.contextSubjects[item] = subject;
        this.contextCounter[item] = 0;
        const observable = subject.asObservable().pipe(share());
        this.contextObservables[item] = observable;
      }
    });

   }

  public showError(message: string, context: ERROR_CONTEXTS): void {
    if (this.contextCounter[ERROR_CONTEXTS[context]] === 0 ) {
      this.snackBar.open(message, 'X', {panelClass: ['error'], duration: 3000});
    } else {
      const subject = this.contextSubjects[ERROR_CONTEXTS[context]];
      subject.next(message);
    }
  }

  public getSubscription(context: ERROR_CONTEXTS, callback: any): Subscription {
    this.contextCounter[ERROR_CONTEXTS[context]]++;
    const subscription: Subscription = this.contextObservables[ERROR_CONTEXTS[context]].subscribe(callback);
    const unSubsFunc = subscription.unsubscribe;
    subscription.unsubscribe = () => {
      this.contextCounter[ERROR_CONTEXTS[context]]--;
      unSubsFunc.bind(subscription)();
    };
    return subscription;
  }

}
