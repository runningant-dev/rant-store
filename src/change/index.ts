
export type ContainerChangeType = 
    "container-set" // value (same options sent to setContainer)
    // | "container-set-schema" // value (same options for setSchema)
    ;

export type ObjectChangeType = 
    "object-add" // container, value (includes key)
    | "object-delete" // container, key
    | "object-update" // container, key, changes
    ;

export type ArrayChangeType =
    "array-add" // value, index
    | "array-update" // type, key, value
    | "array-delete" // type, key
    | "array-order" // type, value (array of keys in correct order)
    ;

// TODO: doesn't seem to be value in prop-add and prop-udpate - just rename to prop-set?

export type PropChangeType =
    "prop-add" // prop, value
    | "prop-update" // prop, value
    | "prop-delete" // prop
    | "prop-rename" // prop, value (new prop name)
    ;

export type ChangeType = ContainerChangeType | ObjectChangeType | ArrayChangeType | PropChangeType;

export interface Change {
    type: ChangeType,

    container?: string,
    
    id?: string,

    prop?: string,
    value?: any, 

    changes?: Change[],

    index?: number,
    toIndex?: number,
}

export interface ChangeLogItem {
    change_id: number,
    container: string,
    id: string,
    change: string, // json
    timeStamp: string,
}

export type ChangeLog = ChangeLogItem[];

export * from "./arrayCompare"
export * from "./diff"
export * from "./keyedArrayCompare"
export * from "./simpleArrayCompare"