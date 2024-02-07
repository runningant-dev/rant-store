import { SchemaDef, Store } from ".";
export declare function sensitiveDataCleaner(store: Store, hasRole: (role: string) => boolean, schema: SchemaDef): Promise<{
    schema: SchemaDef;
    cleaner: (obj: any) => any;
    isCleanRequired: boolean | undefined;
}>;
