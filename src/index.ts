import { Change } from "./change";

export * from "./authToken";
// export * from "./sqliteStore";

export * from "./parseSearchQueryString";
export * from "./sensitiveDataCleaner";

export * from "./utils";

export * from "./change";

export const enum DataType {
    text,
    number
}

export type ObjectDef = any & {
    // key: string,
    // value?: any,
    key?: string,
}

export interface SensitivePropDef {
    name: string,
    role: string,
}

export interface SchemaDef {
    name: string,
    searchWithin?: PropDef[],
    sensitive?: SensitivePropDef[],
}

export interface ContainerDef extends SchemaDef {
    objects?: ObjectDef[],
}

export function mapDataType(dt: any) {
    return (dt === DataType.number || dt === "number") ? DataType.number : DataType.text;
}

export interface PropDef {
    name: string,
    dataType?: DataType,
}

export interface IndexDef {
    props: string[],
}

export interface Comparison {
    op?: "&&" | "||",
    prop: string,
    comparator: string,
    value: string,
}

export type Expression = Comparison | Comparison[];

export type Query = Expression[];

export interface TrackingOptions {
    track: boolean,
}

export type UserContext = ObjectDef;

export type SearchReturnType = "keys" | "array" | "map";

export interface SearchOptions {
    container: string,
    qry: Query | string,
    params?: any,
    returnType?: SearchReturnType, // return full objects, otherwise by default return just the keys
}

export interface Store {
    // open: (options?: any) => void,
    close: () => void,

    getContainer: (options: {
        name: string,
    }) => any,

    setContainer: (
        options: ContainerDef & {
            recreate?: boolean,
            delete?: boolean,
            user?: UserContext,
        },
        changeTracking: TrackingOptions,
    ) => void,

    containerExists: (options: {
        name: string,
    }) => Promise<boolean>,

    get: (options: {
        container: string, 
        key: string
    }) => Promise<any>,

    set: (
        options: {
            container: string, 
            object: ObjectDef,
            user?: UserContext,
        },
        changeTracking: TrackingOptions,
    ) => Promise<any>,

    del: (
        options: {
            container: string,
            key: string,
        },
        changeTracking: TrackingOptions,
    ) => Promise<any>,

    setSchema: (
        options: SchemaDef,
        changeTracking: TrackingOptions,
    ) => Promise<any>,

    getSchema: (options: {
        name: string,
    }) => Promise<any>,

    reset: (options: {

    }) => any,

    search: (options: SearchOptions) => Promise<any>,
    searchAll: (queries: SearchOptions[]) => Promise<any>,

    getChanges: (options: {
        since?: Date,
        from?: number, // id
    }) => Promise<any>,

    merge: (options: {
        changes: Change[],
    }) => Promise<any>,
    
}

