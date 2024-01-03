import { hash } from "rant-utils";

export interface AuthToken {
    key: string,
    name: string,
    roles: string[],
}

export function createAuthToken(user: any) {
	const items: string[] = [];

	function add(name: string, val: string) {
		items.push(encodeURIComponent(name) + "=" + encodeURIComponent(val));
	}

	add("key", user.key);
	add("name", user.name.first + " " + user.name.last);
	add("roles", user.roles.join("|"));

	const val = items.join("&") + items.join("&");

	const calcHash = hash(val);

	return val + "&hash=" + calcHash;
}

export function parseAuthToken(data: string) {
    if (!data) return undefined;

    const i = data.lastIndexOf("&hash=");
    if (i < 0) return;

    const s = data.substring(0, i);
    const h = data.substring(i+6);
    if (hash(s) !== h) {
        return undefined;
    }

    const result = {} as any;
    const lines = s.split("&");
    for(let l of lines) {
        const parts = l.split("=");
        const name = decodeURIComponent(parts[0]);
        const value = decodeURIComponent(parts[1]);

        if (name === "roles") {
            result.roles = value.split("|");
        } else {
            result[name] = value;
        }
    }

    return result as AuthToken;
}
