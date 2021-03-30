import { Injectable } from '@nestjs/common';
import getAllValuesSample from './getAllValues.response.json';
import axios from "axios";
import { ConfigService } from '@common/config/config.service';

@Injectable()
export class BlockchainMiddlewareService {

    private cbURL = this.configService.blockchainMiddlewareAPIUrl;

    private getAllValuesURL = this.cbURL + "getAllValues"; //GET
    private createNewAccountURL = this.cbURL + "createNewAccount"; //GET
    private insertNewValueURL = this.cbURL + "insertNewValue"; //GET

    private postHeaders =  {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded',  'accept': 'application/json'}
    };

    private getHeaders =  {
        headers: { 'accept': 'application/json' }
    };

    constructor(
        private readonly configService: ConfigService,
    ) {}

    async createNewAccount(userName: string, password: any) {
        
        const newAccountParams = new URLSearchParams();
        newAccountParams.append('userName', userName);
        newAccountParams.append('password', password);

        return axios.post( this.createNewAccountURL, newAccountParams, this.postHeaders );

    }
    
    async insertNewValue(publicKey: string, data: any ) {

        const newValueParams = new URLSearchParams();
        newValueParams.append('publicKey', publicKey);
        newValueParams.append('value', data);

        return axios.post( this.insertNewValueURL, newValueParams, this.postHeaders );

    }
    
    async getAllValues() {
        return axios.get( this.getAllValuesURL, this.getHeaders );
    }



}

