"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pruneSensitiveData = void 0;
function pruneSensitiveData(store, schema, hasRole) {
    return __awaiter(this, void 0, void 0, function* () {
        const prune = (obj) => {
            // have to first cut out sensitive data before sending
            if (schema.sensitive) {
                for (let s of schema.sensitive) {
                    // does the user have role required for this data?
                    if (hasRole(s.role))
                        continue;
                    const parts = s.name.split(".");
                    let o = obj;
                    for (let i = 0; i < parts.length; i++) {
                        const p = parts[i];
                        if (!o)
                            break;
                        if (i == (parts.length - 1)) {
                            delete o[p];
                        }
                        else {
                            o = o[p];
                        }
                    }
                }
            }
            return obj;
        };
        return {
            prune,
            isPruneRequired: (schema && schema.sensitive && schema.sensitive.length > 0),
        };
    });
}
exports.pruneSensitiveData = pruneSensitiveData;
