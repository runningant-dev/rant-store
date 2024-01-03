"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleArrayCompare = void 0;
function simpleArrayCompare(path, left, right, result) {
    // deletions
    for (let l of left) {
        if (right.indexOf(l) < 0) {
            result.push({
                type: "array-delete",
                value: l,
            });
        }
    }
    // additions
    for (let r of right) {
        if (left.indexOf(r) < 0) {
            result.push({
                type: "array-update",
                value: r,
            });
        }
    }
}
exports.simpleArrayCompare = simpleArrayCompare;
