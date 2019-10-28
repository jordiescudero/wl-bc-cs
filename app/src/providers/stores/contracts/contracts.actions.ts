import { Action } from '@ngrx/store';
import { ContractModel } from '@core/models/contract.model';

export enum ContractActionTypes {
    INIT_CONTRACT = '[Contract] init Contract initialState',
    INIT_CONTRACT_SUCCESS = '[Contract] init Contract initialState success',
    QUERY_CONTRACT = '[Contract] Query Contract',
    QUERY_CONTRACT_SUCCESS = '[Contract] Query Contract  success',
    UPDATE_CONTRACT = '[Contract] Update  Contract',
    DELETE_CONTRACT = '[Contract] Delete Contract',
    ADD_CONTRACT = '[Contract] Add Contract',
    RESET_CONTRACT = '[Contract] Reset Contract',
    RESET_CONTRACT_SUCCESS = '[Contract] Reset Contract  success',
}

export class ContractInit implements Action {
    public readonly type = ContractActionTypes.INIT_CONTRACT;
    constructor() { }
}

export class ContractInitSuccess implements Action {
    public readonly type = ContractActionTypes.INIT_CONTRACT_SUCCESS;
    constructor(public readonly query: string, public readonly payload: { contracts: ContractModel[], count: number, limit: number, offset: number }) { }
}

export class ContractQuery implements Action {
    public readonly type = ContractActionTypes.QUERY_CONTRACT;
    constructor(public readonly query: string, public readonly limit?: number, public readonly offset?: number) { }
}

export class ContractQuerySuccess implements Action {
    public readonly type = ContractActionTypes.QUERY_CONTRACT_SUCCESS;
    constructor(public readonly query: string, public readonly payload: { contracts: ContractModel[], count: number, limit: number, offset: number }) { }
}

export class ContractUpdate implements Action {
    public readonly type = ContractActionTypes.UPDATE_CONTRACT;
    constructor(public readonly id: string, public readonly item: ContractModel) { }
}

export class ContractDelete implements Action {
    public readonly type = ContractActionTypes.DELETE_CONTRACT;
    constructor(public readonly id: string) { }
}

export class ContractAdd implements Action {
    public readonly type = ContractActionTypes.ADD_CONTRACT;
    constructor(public readonly item: ContractModel) { }
}

export class ContractReset implements Action {
    public readonly type = ContractActionTypes.RESET_CONTRACT;
    constructor() { }
}

export class ContractResetSuccess implements Action {
    public readonly type = ContractActionTypes.RESET_CONTRACT_SUCCESS;
    constructor() { }
}


export type ContractActions = ContractInit | ContractInitSuccess | ContractQuery | ContractQuerySuccess |
    ContractUpdate | ContractDelete | ContractAdd | ContractReset | ContractResetSuccess;
