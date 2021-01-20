import { Injectable } from '@nestjs/common';
import getAllValuesSample from './getAllValues.response.json';
import axios from "axios";

@Injectable()
export class BlockchainMiddlewareService {

    private cbURL = "http://147.102.19.185:5555/api/";

    private getAllValuesURL = this.cbURL + "getAllValues"; //GET
    private createNewAccountURL = this.cbURL + "createNewAccount"; //GET
    private insertNewValueURL = this.cbURL + "insertNewValue"; //GET

    private headers =  {
        headers: { 'content-type': 'application/x-www-form-urlencoded',  'accept': 'application/json'}
    };

    constructor() {

    }

    async createNewAccount(userName: string, password: any) {
        const newAccountParams = {
            userName,
            password
        }

        // return axios.post( this.createNewAccountURL, newAccountParams, this.headers );

        return {
            userName,
            password,
            publicKey: "0x4b88f711f59c84964036c6bf3939273b14aa8f491577e88958438adfbf954c30",
            privateKey: "0xD98931daB81f9bEA796E9AaEA377D222B057bF7B"
        }
    }

    async insertNewValue(publicKey: string, data: any ) {
        const newValueParams = {
            publicKey,
            value: data
        }

        // return axios.post( this.insertNewValueURL, newValueParams, this.headers );

        return {
            message: "Successfully inserted value",
            value: data,
            owner: publicKey
        }
        
    }
    
    async getAllValues() {
     
        // return axios.get( this.getAllValuesURL, this.headers );

        return getAllValuesSample;
    }



}

