"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSearchQueryString = void 0;
function parseSearchQueryString(qry, vals) {
    const result = {
        query: [],
        errors: [],
    };
    let stack = [result.query];
    let currentExpr = result.query;
    const errors = [];
    let i = 0;
    let token = 0 /* Token.Unknown */;
    const len = qry.length;
    function isWhitespace(c) {
        return /\s/g.test(c);
    }
    function isNameChar(c) {
        const valid = "abcdefghijklmnopqrstuvwxyz_.@1234567890";
        return (valid.indexOf(c) >= 0);
    }
    function getComparator() {
        let s = qry.substring(i, i + 2);
        if (s === "=="
            || s === "!="
            || s === "<="
            || s === ">=")
            return s;
        s = qry.substring(i, i + 1);
        if (s === "="
            || s === "<"
            || s === ">")
            return s;
        // s = qry.substring(i, i+2);
        // if (
        //     s === "in"
        // ) return s;
        s = qry.substring(i, i + 4);
        if (s === "like")
            return s;
        s = qry.substring(i, i + 8);
        if (s === "not like")
            return s;
        return "";
    }
    function getOperator() {
        let s = qry.substring(i, i + 2);
        if (s === "&&"
            || s === "||")
            return s;
        return "";
    }
    let c;
    let name = "";
    let comparator = "";
    let value = "";
    let op = "";
    function skipWhitespace() {
        while (i < len) {
            if (isWhitespace(c)) {
                i++;
                c = qry[i];
            }
            else {
                break;
            }
        }
    }
    function addCurrentComparison() {
        // check for param injection
        if (value.startsWith("@")) {
            value = vals ? vals[value.substring(1)] : undefined;
        }
        currentExpr.push({
            comparator,
            prop: name,
            value,
            op: op,
        });
        op = "";
    }
    while (i < len) {
        c = qry[i];
        if (token === 0 /* Token.Unknown */) {
            skipWhitespace();
            if (c === "(") {
                // console.log("(");
                const newExpr = [];
                currentExpr.push(newExpr);
                stack.push(currentExpr);
                currentExpr = newExpr;
                i++;
            }
            else if (c === ")") {
                // console.log(")");
                stack.pop();
                currentExpr = stack[stack.length - 1];
                i++;
            }
            else {
                const operator = getOperator();
                if (operator) {
                    op = operator;
                    // console.log(op);
                    i += op.length;
                    if (i < len)
                        c = qry[i];
                }
                else {
                    // console.log("Token.Name");
                    token = 1 /* Token.Name */;
                    name = "";
                }
            }
        }
        else if (token === 1 /* Token.Name */) {
            while (i < len) {
                if (isNameChar(c)) {
                    name += c;
                    i++;
                    if (i < len)
                        c = qry[i];
                }
                else {
                    // console.log("Token.Comparator");
                    token = 2 /* Token.Comparator */;
                    break;
                }
            }
        }
        else if (token === 2 /* Token.Comparator */) {
            skipWhitespace();
            comparator = getComparator();
            if (!comparator) {
                errors.push("Expecting comparator but instead have this: " + qry.substring(i));
                return result;
            }
            // console.log("Token.Value");
            token = 3 /* Token.Value */;
            i += comparator.length;
            value = "";
        }
        else if (token === 3 /* Token.Value */) {
            skipWhitespace();
            const hasQuote = (c === "'");
            if (hasQuote) {
                i++;
                if (i < len)
                    c = qry[i];
            }
            while (i < len) {
                if ((hasQuote && c === "'")
                    || (!hasQuote && (isWhitespace(c) || (c === ")")))) {
                    addCurrentComparison();
                    break;
                }
                value += c;
                i++;
                if (i < len)
                    c = qry[i];
            }
            if (i < len)
                token = 0 /* Token.Unknown */;
            if (hasQuote) {
                i++;
                if (i < len)
                    c = qry[i];
            }
        }
    }
    // if we get to end of string may have this last comparison to include
    if (token === 3 /* Token.Value */) {
        addCurrentComparison();
    }
    return result;
}
exports.parseSearchQueryString = parseSearchQueryString;
