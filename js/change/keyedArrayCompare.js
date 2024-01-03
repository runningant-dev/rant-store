"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyedArrayCompare = void 0;
const diff_1 = require("./diff");
// compare keyed array
function keyedArrayCompare(path, left, right, result) {
    // first build index for quicker lookup 
    function initIndex(arr) {
        const result = {};
        for (let i = 0; i < arr.length; i++) {
            const o = arr[i];
            if (result[o.key]) {
                // if we hit a duplicate key then can't reliably compare, so just replace the whole array
                result.push({
                    type: "prop-update",
                    prop: path,
                    value: right,
                });
                return;
            }
            result[o.key] = i;
        }
        return result;
    }
    const iLeft = initIndex(left);
    const iRight = initIndex(right);
    let hadDeletions = false;
    let hadAdditions = false;
    let needsSorting = false;
    // deleted items will be in left but no longer in right
    for (let i = 0; i < left.length; i++) {
        const l = left[i];
        const iRightIndex = iRight[l.key];
        if (iRightIndex === undefined) {
            result.push({
                type: "array-delete",
                key: l.key,
            });
            hadDeletions = true;
        }
        else {
            // need to check for changes within previously existing objects
            const r = right[iRightIndex];
            const changes = (0, diff_1.diff)(l, r);
            if (changes.length > 0) {
                result.push({
                    type: "array-update",
                    key: r.key,
                    value: changes,
                });
            }
        }
    }
    // new items will be in right but not in left
    const order = [];
    for (let i = 0; i < right.length; i++) {
        const r = right[i];
        const leftIndex = iLeft[r.key];
        const rightIndex = iRight[r.key];
        if (!needsSorting && leftIndex !== rightIndex)
            needsSorting = true;
        order.push(r.key);
        if (leftIndex === undefined) {
            result.push({
                type: "array-add",
                value: r,
                index: rightIndex,
            });
            hadAdditions = true;
        }
    }
    if (needsSorting || hadAdditions || hadDeletions) {
        result.push({
            type: "array-order",
            value: order,
        });
    }
}
exports.keyedArrayCompare = keyedArrayCompare;
