import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from './error-service';
import { Logger } from '@services/logger/logger.service';
const log = new Logger('GlobalErrorHandler');
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

    private errorService: ErrorService;

    // Error handling is important and needs to be loaded first.
    // Because of this we should manually inject the services with Injector.
    constructor(private injector: Injector) { }

    public handleError(error: Error | HttpErrorResponse) {
        if (!this.errorService) {
          this.errorService = this.injector.get(ErrorService);
        }
        this.errorService.populateError(error);
    }
}
