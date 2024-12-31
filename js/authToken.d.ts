export interface AuthToken {
    account: string;
    id: string;
    name: string;
    roles: string[];
    time: number;
    impersonating?: boolean;
}
