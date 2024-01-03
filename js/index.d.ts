import { Change } from "./change";
export * from "./authToken";
export * from "./parseSearchQueryString";
export * from "./sensitiveDataCleaner";
export * from "./utils";
export * from "./change";
export declare const enum DataType {
    text = 0,
    number = 1
}
export declare type ObjectDef = any & {
    key?: string;
};
export interface SensitivePropDef {
    name: string;
    role: string;
}
export interface SchemaDef {
    name: string;
    searchWithin?: PropDef[];
    sensitive?: SensitivePropDef[];
}
export interface ContainerDef extends SchemaDef {
    objects?: ObjectDef[];
}
export declare function mapDataType(dt: any): DataType;
export interface PropDef {
    name: string;
    dataType?: DataType;
}
export interface IndexDef {
    props: string[];
}
export interface Comparison {
    op?: "&&" | "||";
    prop: string;
    comparator: string;
    value: string;
}
export declare type Expression = Comparison | Comparison[];
export declare type Query = Expression[];
export interface TrackingOptions {
    track: boolean;
}
export declare type UserContext = ObjectDef;
export declare type SearchReturnType = "keys" | "array" | "map";
export interface SearchOptions {
    container: string;
    qry: Query | string;
    params?: any;
    returnType?: SearchReturnType;
}
export interface Store {
    close: () => void;
    getContainer: (options: {
        name: string;
    }) => any;
    setContainer: (options: ContainerDef & {
        recreate?: boolean;
        delete?: boolean;
        user?: UserContext;
    }, changeTracking: TrackingOptions) => void;
    get: (options: {
        container: string;
        key: string;
    }) => Promise<any>;
    set: (options: {
        container: string;
        object: ObjectDef;
        user?: UserContext;
    }, changeTracking: TrackingOptions) => Promise<any>;
    del: (options: {
        container: string;
        key: string;
    }, changeTracking: TrackingOptions) => Promise<any>;
    setSchema: (options: SchemaDef, changeTracking: TrackingOptions) => Promise<any>;
    getSchema: (options: {
        name: string;
    }) => Promise<any>;
    reset: (options: {}) => any;
    search: (options: SearchOptions) => Promise<any>;
    searchAll: (queries: SearchOptions[]) => Promise<any>;
    getChanges: (options: {
        since?: Date;
        from?: number;
    }) => Promise<any>;
    merge: (options: {
        changes: Change[];
    }) => Promise<any>;
}
