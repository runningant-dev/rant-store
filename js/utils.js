"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firstObject = void 0;
const rant_utils_1 = require("rant-utils");
function firstObject(array) {
    const item = (0, rant_utils_1.first)(array);
    if (item) {
        const result = JSON.parse(item.value);
        result.id = item.id;
        return result;
    }
    return undefined;
}
exports.firstObject = firstObject;
