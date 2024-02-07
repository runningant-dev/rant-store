import { SchemaDef, Store } from ".";
export declare function pruneSensitiveData(store: Store, schema: SchemaDef, hasRole: (role: string) => boolean): Promise<{
    prune: (obj: any) => any;
    isCleanRequired: boolean | undefined;
}>;
