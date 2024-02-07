"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapDataType = void 0;
__exportStar(require("./authToken"), exports);
// export * from "./sqliteStore";
__exportStar(require("./parseSearchQueryString"), exports);
__exportStar(require("./sensitiveDataCleaner"), exports);
__exportStar(require("./change"), exports);
function mapDataType(dt) {
    return (dt === 1 /* DataType.number */ || dt === "number") ? 1 /* DataType.number */ : 0 /* DataType.text */;
}
exports.mapDataType = mapDataType;
