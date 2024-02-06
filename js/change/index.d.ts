export declare type ContainerChangeType = "container-set" | "container-set-schema";
export declare type ObjectChangeType = "object-add" | "object-delete" | "object-update";
export declare type ArrayChangeType = "array-add" | "array-update" | "array-delete" | "array-order";
export declare type PropChangeType = "prop-add" | "prop-update" | "prop-delete" | "prop-rename";
export declare type ChangeType = ContainerChangeType | ObjectChangeType | ArrayChangeType | PropChangeType;
export interface Change {
    type: ChangeType;
    container?: string;
    id?: string;
    prop?: string;
    value?: any;
    changes?: Change[];
    index?: number;
    toIndex?: number;
}
export interface ChangeLogItem {
    change_id: number;
    container: string;
    id: string;
    change: string;
    timeStamp: string;
}
export declare type ChangeLog = ChangeLogItem[];
export * from "./arrayCompare";
export * from "./diff";
export * from "./keyedArrayCompare";
export * from "./simpleArrayCompare";
