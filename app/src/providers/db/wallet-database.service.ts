// Basic
import { Injectable } from '@angular/core';
import { NgForage } from 'ngforage';
import { from, Observable} from 'rxjs';

// Services
import { StorageService } from '@services/storage/storage.service';

// Config
import { walletConfig } from '@config/wallet.db.config';

/**
 * Application data database service to access to the persistance data.
 */
@Injectable({ providedIn: 'root' })
export class WalletDatabaseService {

  /**
   * Application data database instance
   */
  private walletDatabase: NgForage;

  /**
   * Constructor where we import all needed in the service.
   * @param storageService instance of the storage general service.
   */
  constructor(private storageService: StorageService) {
    this.walletDatabase = this.storageService.create(walletConfig.databaseConfig);
  }

  /**
   * Method to get an application data stored inside database.
   * @param key Primary key to get the value inside the database.
   */
  public get(key: string): Observable<any> {
    return from(this.storageService.get(this.walletDatabase, walletConfig.encryption, key));
  }

  /**
   * Method to set an application data inside database.
   * @param key Primary key to be stored inside the database.
   * @param value Value to be stored inside the database
   */
  public set(key: string, value: any): Observable<any> {
    return from(this.storageService.set(this.walletDatabase, walletConfig.encryption, key, value));
  }

  /**
   * Delete the application data of the key provided by parameter.
   * @param key Primary key to delete the value.
   */
  public remove(key: string): Observable<any> {
    return from(this.storageService.remove(this.walletDatabase, key));
  }
}
