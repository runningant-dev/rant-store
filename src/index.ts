import { Change } from "./change";

export * from "./authToken";
// export * from "./sqliteStore";

export * from "./parseSearchQueryString";
export * from "./sensitiveDataCleaner";

export * from "./change";

export const enum DataType {
    text,
    number
}

export type ObjectDef = any & {
    id?: string,
}

export interface SensitivePropDef {
    name: string,
    role: string,
}

export interface SchemaDef {
    name: string,
    indexes?: PropDef[],
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

export type SearchReturnType = "ids" | "array" | "map";

export interface SearchOptions {
    container: string,
    qry: Query | string,
    params?: any,
    returnType?: SearchReturnType, // return full objects, otherwise by default return just the ids

    // by default sensitive data is cleaned out because no roles are provided
    // but if roles available they will be checked against the sensitive data specified on the container attributes
    roles?: string[],
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

    get: (options: {
        container: string, 
        id: string,

        // by default sensitive data is cleaned out because no roles are provided
        // but if roles available they will be checked against the sensitive data specified on the container attributes
        roles?: string[],
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
            id: string,
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
        from?: number, // id

        // may remove datetime - not as precise as from: id and can't think of why would use it
        since?: string, // e.g. 2024-02-06T22:59:42.733Z - from rant-utils/formatDateTime()
    }) => Promise<any>,

    merge: (options: {
        changes: Change[],
    }) => Promise<any>,
    
}

