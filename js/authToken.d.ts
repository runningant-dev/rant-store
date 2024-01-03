export interface AuthToken {
    key: string;
    name: string;
    roles: string[];
}
export declare function createAuthToken(user: any): string;
export declare function parseAuthToken(data: string): AuthToken | undefined;
