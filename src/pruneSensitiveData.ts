import { SchemaDef, Store } from ".";

export async function pruneSensitiveData(store: Store, schema: SchemaDef, hasRole: (role: string) => boolean) {

    const prune = (obj: any) => {
        // have to first cut out sensitive data before sending
        if (schema.sensitive) {
            for(let s of schema.sensitive) {
                // does the user have role required for this data?
                if (hasRole(s.role)) continue;

                const parts = s.name.split(".");
                let o = obj;
                for(let i=0;i<parts.length;i++) {
                    const p = parts[i];
                    if (!o) break;
                    if (i == (parts.length-1)) {
                        delete o[p];
                    } else {
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
}