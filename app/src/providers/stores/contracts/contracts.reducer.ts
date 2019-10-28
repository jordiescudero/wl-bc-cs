import { ContractActionTypes, ContractActions } from './contracts.actions';
import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { ContractModel } from '@core/models/contract.model';

export interface ContractState extends EntityState<ContractModel> {
    query: string;
    count: number;
    limit: number;
    offset: number;
}

export const contractAdapter = createEntityAdapter<ContractModel>({
    selectId: (contract: ContractModel) => contract.address
});

const contractInitialState: ContractState = contractAdapter.getInitialState({
    query: null,
    count: 0,
    limit: 0,
    offset: 0
});

export function contractReducer(state: ContractState = contractInitialState, action: ContractActions): ContractState {
    switch (action.type) {
        case ContractActionTypes.INIT_CONTRACT_SUCCESS:
        case ContractActionTypes.QUERY_CONTRACT_SUCCESS:
            {
                return {
                    ...contractAdapter.addAll(action.payload.contracts, state),
                    ...{
                        query: action.query,
                        count: action.payload.count,
                        offset: action.payload.offset,
                        limit: action.payload.limit
                    }
                };
            }
        case ContractActionTypes.RESET_CONTRACT_SUCCESS: {
            return { ...contractInitialState, ...{ query: null, count: 0 } };
        }
        default:
            return state;
    }
}

export const getCurrentQuery = (state: ContractState) => state.query;

export const getCount = (state: ContractState) => state.count;
