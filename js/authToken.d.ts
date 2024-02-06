export interface AuthToken {
    id: string;
    name: string;
    roles: string[];
}
export declare function createAuthToken(user: any): string;
export declare function parseAuthToken(data: string): AuthToken | undefined;
