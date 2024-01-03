"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diff = void 0;
const rant_utils_1 = require("rant-utils");
const arrayCompare_1 = require("./arrayCompare");
function diff(existing, latest) {
    const result = [];
    function check(path, oExisting, oLatest) {
        // keep track of the props added and deleted
        // i.e. could it be that they were just renamed?
        const added = [];
        const deleted = [];
        const keysExisting = Object.keys(oExisting);
        const keysChecked = [];
        for (var m of keysExisting) {
            const valExisting = oExisting[m];
            const valLatest = oLatest[m];
            keysChecked.push(m);
            if ((valExisting !== undefined) && (valLatest === undefined)) {
                deleted.push({
                    type: "prop-delete",
                    prop: path + m,
                    value: valExisting, // NOTE: storing val temporarily to help with "rename" logic below
                });
            }
            else if ((valExisting === undefined) && (valLatest !== undefined)) {
                added.push({
                    type: "prop-add",
                    prop: path + m,
                    value: valLatest,
                });
            }
            else {
                const isExistingArray = Array.isArray(valExisting);
                const isLatestArray = Array.isArray(valLatest);
                if (isExistingArray && !isLatestArray
                    || !isExistingArray && isLatestArray) {
                    // type has changed from/to array, so just have to accept new value
                    result.push({
                        type: "prop-update",
                        prop: path + m,
                        value: valLatest,
                    });
                }
                else if (isExistingArray && isLatestArray) {
                    // perform comparison on the array elements
                    (0, arrayCompare_1.arrayCompare)(path + m, valExisting, valLatest, result);
                }
                else {
                    // if its an object then need to recurse into it
                    const isExistingObj = (0, rant_utils_1.isObject)(valExisting);
                    const isLatestObj = (0, rant_utils_1.isObject)(valLatest);
                    if (!isExistingObj && !isLatestObj) {
                        // both simple props
                        if (valExisting !== valLatest) {
                            result.push({
                                type: "prop-update",
                                prop: path + m,
                                value: valLatest,
                            });
                        }
                    }
                    else if (isExistingObj && isLatestObj) {
                        // drill down into objects
                        check(path + m + ".", valExisting, valLatest);
                    }
                    else {
                        // if only one is object and the other isn't then can't do precise comparsion
                        // so have to treat as whole thing being a change
                        result.push({
                            type: "prop-update",
                            prop: path + m,
                            value: valLatest,
                        });
                    }
                }
            }
        }
        // now check through keys of latest data to see if any new values there
        const keysLatest = Object.keys(oLatest);
        for (var m of keysLatest) {
            if (keysChecked.indexOf(m) >= 0)
                continue;
            const valLatest = oLatest[m];
            added.push({
                type: "prop-add",
                prop: path + m,
                value: valLatest,
            });
        }
        // check through the added/deleted items to see if any could better be represented as renames
        for (let a of added) {
            let wasRename = false;
            for (let i = 0; i < deleted.length; i++) {
                const d = deleted[i];
                if (d.value === a.value) {
                    result.push({
                        type: 'prop-rename',
                        prop: d.prop,
                        value: a.prop,
                    });
                    deleted.splice(i, 1);
                    wasRename = true;
                    break;
                }
            }
            if (!wasRename) {
                result.push(a);
            }
        }
        // any remaining deleted items need to be included
        for (let d of deleted) {
            delete d.value; // when deleting don't want to waste space with a copy of the value
            result.push(d);
        }
    }
    // recursively check objects
    check("", existing, latest);
    return result;
}
exports.diff = diff;
