import { Store } from ".";
export declare function sensitiveDataCleaner(store: Store, hasRole: (role: string) => boolean, container: string): Promise<{
    schema: any;
    cleaner: (obj: any) => any;
    isCleanRequired: any;
}>;
