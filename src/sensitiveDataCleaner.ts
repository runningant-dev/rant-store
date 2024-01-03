import { Store } from ".";

export async function sensitiveDataCleaner(store: Store, hasRole: (role: string) => boolean, container: string) {
    const schema = await store.getSchema({ name: container });

    const cleaner = (obj: any) => {
        // have to first cut out sensitive data before sending
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
        return obj;
    };

    return {
        schema,
        cleaner,
        isCleanRequired: (schema && schema.sensitive && schema.sensitive.length > 0),
    };
}