import { Expression, Query } from ".";

export function parseSearchQueryString(qry: string, vals?: any) {

    const result = {
        query: [] as Query,
        errors: [] as string[],
    };

    let stack = [result.query];
    let currentExpr = result.query;
    const errors: string[] = [];

    const enum Token {
        Unknown,
        Name,
        Comparator,
        Value,
    }

    let i = 0;
    let token = Token.Unknown;
    const len = qry.length;

    function isWhitespace(c: any) {
        return /\s/g.test(c);
    }

    function isNameChar(c: any) {
        const valid = "abcdefghijklmnopqrstuvwxyz_.@1234567890";
        return (valid.indexOf(c) >= 0);
    }

    function getComparator() {
        let s = qry.substring(i, i+2);
        if (
            s === "=="
            || s === "!="
            || s === "<="
            || s === ">="
        ) return s;

        s = qry.substring(i, i+1);
        if (
            s === "="
            || s === "<"
            || s === ">"
        ) return s;

		// s = qry.substring(i, i+2);
        // if (
        //     s === "in"
        // ) return s;

        s = qry.substring(i, i+4);
        if (
            s === "like"
        ) return s;

        s = qry.substring(i, i+8);
        if (
            s === "not like"
        ) return s;

        return "";
    }
    
    function getOperator() {
        let s = qry.substring(i, i+2);
        if (
            s === "&&"
            || s === "||"
        ) return s;

        return "";
    }

    let c: any;
    let name = "";
    let comparator = "";
    let value = "";
    let op = "";

    function skipWhitespace() {
        while (i < len) {
            if (isWhitespace(c)) {
                i++;
                c = qry[i];
            } else {
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
            op: op as any,
        })
        op = "";
    }

    while (i < len) {
        c = qry[i];

        if (token === Token.Unknown) {
            skipWhitespace();

            if (c === "(") {
                // console.log("(");
                const newExpr: Expression = [];
                currentExpr.push(newExpr);
                stack.push(currentExpr);
                currentExpr = newExpr;
                i++;
            } else if (c === ")") {
                // console.log(")");
                stack.pop();
                currentExpr = stack[stack.length-1];
                i++;
            } else {
                const operator = getOperator();
                if (operator) {
                    op = operator;
                    // console.log(op);
                    i += op.length;
                    if (i < len) c = qry[i];

                } else {
                    // console.log("Token.Name");
                    token = Token.Name;
                    name = "";                        
                }
            }
        
        } else if (token === Token.Name) {
            while (i < len) {
                if (isNameChar(c)) {
                    name += c;
                    i++;
                    if (i < len) c = qry[i];
                } else {
                    // console.log("Token.Comparator");
                    token = Token.Comparator;
                    break;    
                }
            }

        } else if (token === Token.Comparator) {
            skipWhitespace();
            comparator = getComparator();
            if (!comparator) {
                errors.push("Expecting comparator but instead have this: " + qry.substring(i));
                return result;
            }
            // console.log("Token.Value");
            token = Token.Value;
            i += comparator.length;
            value = "";

        } else if (token === Token.Value) {
            skipWhitespace();
            const hasQuote = (c === "'");
            if (hasQuote) {
                i++;
                if (i < len) c = qry[i];
            }

            while (i < len) {
                if (
                    (hasQuote && c === "'") 
                    || (!hasQuote && (isWhitespace(c) || (c === ")")))
                ) {
                    addCurrentComparison();
                    break;
                }

                value += c;

                i++;
                if (i < len) c = qry[i];
            }

            if (i < len) token = Token.Unknown;

            if (hasQuote) {
                i++;
                if (i < len) c = qry[i];
            }

        }

    }

    // if we get to end of string may have this last comparison to include
    if (token === Token.Value) {
        addCurrentComparison();
    }

    return result;
}