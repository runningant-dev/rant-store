import { AuthToken } from "./authToken";
import { Change } from "./change";

export * from "./authToken";
// export * from "./sqliteStore";

export * from "./parseSearchQueryString";
export * from "./pruneSensitiveData";

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
            authToken?: AuthToken,
        },
        changeTracking?: TrackingOptions,
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
            authToken?: AuthToken,
            merge?: boolean, // leave as much of the current object intact as possible and just merge supplied .object changes into what is in db
        },
        changeTracking?: TrackingOptions,
    ) => Promise<any>,

    del: (
        options: {
            container: string,
            id: string,
        },
        changeTracking?: TrackingOptions,
    ) => Promise<any>,

    reset: (options: {

    }) => any,

    search: (options: SearchOptions) => Promise<any>,
    searchAll: (queries: SearchOptions[]) => Promise<any>,

    getChanges: (options: {
        from?: number, // id
    }) => Promise<any>,

    merge: (options: {
        changes: Change[],
    }) => Promise<any>,
    
}

