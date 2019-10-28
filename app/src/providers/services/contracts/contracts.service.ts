import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContractModel } from '@core/models/contract.model';
import { map, catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class ContractsService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  public search(q: string = '', limit: number = 20, offset: number = 0): Observable<{ contracts: ContractModel[], count: number }> {
    return this.httpClient
      .get('/contracts', {
        params: {
          q,
          limit: limit + '',
          offset: offset + '',
        }
      })
      .pipe(
        map((body: any) => {
          return {
            contracts: body.items,
            count: body.count
          };
        })
      );
  }

  public add(item: ContractModel): Observable<ContractModel> {
    return this.httpClient
      .post('/contracts', item)
      .pipe(
        map((body: any) => body)
      );
  }

  public update(id: string, item: ContractModel): Observable<ContractModel> {
    return this.httpClient
      .put(`/contracts/${id}`, item)
      .pipe(
        map((body: any) => body)
      );
  }

  public get(id: string): Observable<ContractModel> {
    return this.httpClient
      .get(`/contracts/${id}`)
      .pipe(
        map((body: ContractModel) => body)
      );
  }

  public delete(id: string) {
    return this.httpClient
      .delete(`/contracts/${id}`)
      .pipe(
        map((body: any) => body)
      );
  }

}
