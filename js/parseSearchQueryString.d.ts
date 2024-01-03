import { Query } from ".";
export declare function parseSearchQueryString(qry: string, vals?: any): {
    query: Query;
    errors: string[];
};
