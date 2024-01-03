import { Change } from ".";

export function simpleArrayCompare(path: string, left: any[], right: any[], result: Change[]) {
    
    // deletions
    for(let l of left) {
        if (right.indexOf(l) < 0) {
			result.push({
				type: "array-delete",
				value: l,
			});            
        }
    }

    // additions
    for(let r of right) {
        if (left.indexOf(r) < 0) {
            result.push({
                type: "array-update",
                value: r,
            });            
        }
    }
    
}