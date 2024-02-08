import { hash } from "rant-utils";

export interface AuthToken {
    id: string,
    name: string,
    roles: string[],
}

