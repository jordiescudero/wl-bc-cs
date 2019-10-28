import { ApiKeyActionTypes, ApiKeyActions } from './api-keys.actions';
import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { ApiKeyModel } from '@core/models/api-key.model';

export interface ApiKeyState extends EntityState<ApiKeyModel> {
    query: string;
}

export const apiKeyAdapter = createEntityAdapter<ApiKeyModel>({
    selectId: (apiKey: ApiKeyModel) => apiKey.id
});

const apiKeyInitialState: ApiKeyState = apiKeyAdapter.getInitialState({
    query: null
});

export function apiKeyReducer(state: ApiKeyState = apiKeyInitialState, action: ApiKeyActions): ApiKeyState {
    switch (action.type) {
        case ApiKeyActionTypes.INIT_API_KEY_SUCCESS:
        case ApiKeyActionTypes.QUERY_API_KEY_SUCCESS:
        {
            return {...apiKeyAdapter.addAll(action.payload, state), ...{query: action.query}};
        }
        case ApiKeyActionTypes.RESET_API_KEY_SUCCESS: {
            return { ...apiKeyInitialState, ...{ query: null } };
        }
        default:
            return state;
    }
}

export const getCurrentQuery = (state: ApiKeyState) => state.query;
