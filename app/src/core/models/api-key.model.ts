export interface ApiKeyModel {
    id?: string;
    name?: string;
    owner?: string;
    active?: boolean;
    description: string;
    role?: string;
    contracts?: string[];
}

