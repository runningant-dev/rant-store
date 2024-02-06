"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAuthToken = exports.createAuthToken = void 0;
const rant_utils_1 = require("rant-utils");
function createAuthToken(user) {
    const items = [];
    function add(name, val) {
        items.push(encodeURIComponent(name) + "=" + encodeURIComponent(val));
    }
    add("id", user.id);
    add("name", user.name.first + " " + user.name.last);
    add("roles", user.roles.join("|"));
    const val = items.join("&") + items.join("&");
    const calcHash = (0, rant_utils_1.hash)(val);
    return val + "&hash=" + calcHash;
}
exports.createAuthToken = createAuthToken;
function parseAuthToken(data) {
    if (!data)
        return undefined;
    const i = data.lastIndexOf("&hash=");
    if (i < 0)
        return;
    const s = data.substring(0, i);
    const h = data.substring(i + 6);
    if ((0, rant_utils_1.hash)(s) !== h) {
        return undefined;
    }
    const result = {};
    const lines = s.split("&");
    for (let l of lines) {
        const parts = l.split("=");
        const name = decodeURIComponent(parts[0]);
        const value = decodeURIComponent(parts[1]);
        if (name === "roles") {
            result.roles = value.split("|");
        }
        else {
            result[name] = value;
        }
    }
    return result;
}
exports.parseAuthToken = parseAuthToken;
