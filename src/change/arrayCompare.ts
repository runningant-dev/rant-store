import { isObject } from "rant-utils";
import { keyedArrayCompare } from "./keyedArrayCompare";
import { Change } from ".";
import { simpleArrayCompare } from "./simpleArrayCompare";

export function arrayCompare(path: string, left: any[], right: any[], result: Change[]) {
    // for now support two types of arrays:
    // 1. simple string arrays
    // 2. keyed arrays
    
    if (left.length <= 0 && right.length <= 0) return;

    if (
        (left.length > 0 && isObject(left[0]) && left[0].key)
        || (right.length > 0 && isObject(right[0] && right[0].key))
    ) {
        // compare a keyed array
        keyedArrayCompare(path, left, right, result);
    } else {
        // simple compare
        simpleArrayCompare(path, left, right, result);
    }

    for(let l of left) {

    }
}