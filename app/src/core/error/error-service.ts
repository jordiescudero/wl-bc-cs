import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Logger } from '@services/logger/logger.service';
import { NotificationService } from './notification-service';
import { ERROR_CONTEXTS } from '@core/constants/application-data.constants';
import { UserSessionStateModel } from '@core/models/user-session-state.model';
import { Store } from '@ngrx/store';
import * as fromUserSessionActions from '@stores/user-session/user-session.actions';

const log = new Logger('ErrorService');
@Injectable({
    providedIn: 'root'
})
export class ErrorService {

    constructor(private notificationService: NotificationService,
        private store: Store<UserSessionStateModel>) { }

    public populateError(error: any, context: ERROR_CONTEXTS = ERROR_CONTEXTS.GLOBAL) {
        let message;
        let stackTrace;

        if (error instanceof HttpErrorResponse) {
            // Server Error
            if ((!error.url.endsWith('/logout')) && (error.status === 403)) {
                this.store.dispatch(new fromUserSessionActions.LogoutUserSession());
            } else {
                message = this.getServerMessage(error);
                stackTrace = this.getServerStack(error);
                this.notificationService.showError(message, context);
            }
        } else {
            // Client Error
            message = this.getClientMessage(error);
            stackTrace = this.getClientStack(error);
            this.notificationService.showError(message, context);
        }

        log.error(error, context);
    }

    private getClientMessage(error: Error): string {
        if (!navigator.onLine) {
            return 'No Internet Connection';
        }
        return error.message ? error.message : error.toString();
    }

    private getClientStack(error: Error): string {
        return error.stack;
    }

    private getServerMessage(error: HttpErrorResponse): string {
        return error.message;
    }

    private getServerStack(error: HttpErrorResponse): string {
        // handle stack trace
        return 'stack';
    }
}
