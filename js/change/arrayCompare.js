"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayCompare = void 0;
const rant_utils_1 = require("rant-utils");
const keyedArrayCompare_1 = require("./keyedArrayCompare");
const simpleArrayCompare_1 = require("./simpleArrayCompare");
function arrayCompare(path, left, right, result) {
    // for now support two types of arrays:
    // 1. simple string arrays
    // 2. keyed arrays
    if (left.length <= 0 && right.length <= 0)
        return;
    if ((left.length > 0 && (0, rant_utils_1.isObject)(left[0]) && left[0].id)
        || (right.length > 0 && (0, rant_utils_1.isObject)(right[0] && right[0].id))) {
        // compare a keyed array
        (0, keyedArrayCompare_1.keyedArrayCompare)(path, left, right, result);
    }
    else {
        // simple compare
        (0, simpleArrayCompare_1.simpleArrayCompare)(path, left, right, result);
    }
}
exports.arrayCompare = arrayCompare;
