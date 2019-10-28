import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiKeyModel } from '@core/models/api-key.model';
import { map, catchError } from 'rxjs/operators';
import { throwError, Observable, of } from 'rxjs';
import { ERC223Contract } from '@core/core.module';
import { Web3Service } from '@services/web3/web3.service';


@Injectable({providedIn: 'root'})
export class ApiKeysService {

  constructor(
    private httpClient: HttpClient,
    private web3Service: Web3Service,
  ) {}

  public search(q: string = '', limit: number = 20, offset: number = 0): Observable<ApiKeyModel[]>  {
    return this.httpClient
    .get('/api-keys', {
      params: {
        q,
        limit: limit + '',
        offset: offset + '',
      }
    })
    .pipe(
        map((body: any) => body.items)
    );
  }

  public add(item: ApiKeyModel): Observable<ApiKeyModel>  {
    return this.httpClient
    .post('/api-keys', item)
    .pipe(
        map((body: any) => body)
    );
  }


  public pay(name: string, amount: number)  {
    (<ERC223Contract>this.web3Service.getContract(ERC223Contract.ADDRESS)).buy(amount, name);
  }

  public update(id: string, item: ApiKeyModel): Observable<ApiKeyModel>  {
    return this.httpClient
    .put(`/api-keys/${id}`, item)
    .pipe(
        map((body: any) => body)
    );
  }

  public delete(id: string)  {
    return this.httpClient
    .delete(`/api-keys/${id}`)
    .pipe(
        map((body: any) => body)
    );
  }

}
