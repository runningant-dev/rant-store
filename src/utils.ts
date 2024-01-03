import { Expression, ObjectDef, Query } from ".";
import { first } from "rant-utils";

export function firstObject(array: ObjectDef[]) {
    const item = first(array);
    if (item) {
        const result = JSON.parse(item.value);
        result.key = item.key;
        return result;
    }
    return undefined;
}
