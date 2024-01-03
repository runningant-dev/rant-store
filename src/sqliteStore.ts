// import { open } from 'sqlite';
// import { Database } from 'sqlite3';

// import { Comparison, ContainerDef, DataType, Expression, IndexDef, ObjectDef, PropDef, Query, SchemaDef, SearchOptions, SearchReturnType, Store, TrackingOptions, UserContext, mapDataType, parseSearchQueryString } from "./index";
// import { formatDateTime, isString, uuid } from 'rant-utils';
// import { Change } from './change';
// import { diff } from './change/diff';

// export function SqliteConnectionFactory(filename: string) {
//     return {
//         create: async function() {
//             return sqliteStore({
//                 filename,
//             });  
//         },
//         destroy: async function(store: Store) {
//             await store.close();
//         },
//     }
// }

// export async function sqliteStore(options: {
//     filename: string,
// }) {

//     // open the database
//     let db = await open({
//         filename: options.filename,
//         driver: Database,
//     });

//     checkForBaseRequirements();

//     async function checkForBaseRequirements() {
//         // check for base requirements
//         if (!(await isTableExist("schema"))) {
//             await db.exec(`
//                 CREATE TABLE schema (container TEXT NOT NULL, indexes TEXT, sensitive TEXT, dateUpdated TEXT); 
//                 CREATE UNIQUE INDEX idx_schema_container ON schema (container);

//                 CREATE TABLE changes (id integer primary key autoincrement, container TEXT NOT NULL, key TEXT, change TEXT NOT NULL, timestamp TEXT); 
//             `);
//         }
//     }
    
//     async function isTableExist(name: string) {
//         const result = await db.get(`SELECT name from sqlite_master WHERE name = :name`, fixParams({ name, }));
//         return (result && result.name === name);
//     }

//     //sqlite requires params to be specified like ":name" etc, but want to work in rest of code with "clean" js objects
//     function fixParams(params?: any) {
//         if (!params) return undefined;

//         const result: any = {};
//         for(let m in params) {
//             result[":" + m] = params[m];
//         }

//         return result;
//     }
//     async function getContainer(options: {
//         name: string,
//     }) {
//         if (!db) return;

//         const name = options.name.toLowerCase();

//         return db.get("SELECT * from schema WHERE container = :name", fixParams({ name, }));
//     }
//     async function containerExists(options: {
//         name: string,
//     }) {
//         if (!db) return false;
//         const name = options.name.toLowerCase();
//         const exists = await db.get("SELECT container from schema WHERE container = :name", fixParams({ name, }));
//         return (exists ? (exists.container === name) : false);
//     }

//     async function setContainer(options: 
//         ContainerDef & {
//             recreate?: boolean,
//             delete?: boolean,
//             user?: UserContext,
//         },
//         changeTracking: TrackingOptions,
//     ) {
//         if (!db) return;

//         const name = options.name.toLowerCase();
//         // console.log(`store.setContainer: ${name}`)

//         async function deleteContainer() {
//             // console.log(`Attempting to delete ${name}`);
//             if (await isTableExist(name)) {
//                 // console.log(`Removing table '${name}'`)
//                 await db.run(`DELETE FROM schema WHERE container = '${name}';`);
//                 await db.run(`DELETE FROM changes WHERE container = '${name}';`);
//                 await db.run(`DROP TABLE IF EXISTS ${getSearchTableName(name)};`);
//                 await db.run(`DROP TABLE IF EXISTS ${name};`);
//                 // console.log(`Deleted ${name}`);
//             } else {
//                 // console.log(`${name} not found`);
//             }
//         }

//         try {

//             if (options.delete) {
//                 await deleteContainer();
//                 return;
//             }

//             if (options.recreate) {
//                 await deleteContainer();
//             }

//             // console.log("Checking table exists: " + name);
//             if (!(await isTableExist(name))) {
//                 // console.log(`Creating container table '${options.name}'`)
//                 await db.exec(`
//                     CREATE TABLE ${name} (key TEXT NOT NULL PRIMARY KEY, value TEXT, meta TEXT, version INT); 
//                     CREATE UNIQUE INDEX idx_${name}_key ON ${name} (key);
//                     INSERT INTO schema (container) VALUES ('${name}');
//                 `);
//             }

//             if (options.searchWithin) {
//                 await setSchema(
//                     options, 
//                     {
//                         track: false, // don't track this change because tracked with the setContainer change
//                     }, 
//                 );
//             }

//         } finally {
//             if (changeTracking.track) {
//                 logChange(name, "", {
//                     type: "container-set",
//                     value: options,
//                 });    
//             }
//         }

//         return true;
//     }

//     function getSearchTableName(container: string) {
//         return container + "_search";
//     }

//     interface DbPropDef {
//         name: string,
//         dataType?: DataType,
//         parts: string[],
//     }

//     function parseSearchWithin(searchWithin: PropDef[] | undefined) {
//         if (!searchWithin) return [];

//         const props: DbPropDef[] = [];
//         for(let i=0;i<searchWithin.length;i++) {
//             const sw = searchWithin[i];

//             props.push({
//                 name: sw.name.replace(".", "_"),
//                 parts: sw.name.split("."),
//                 dataType: sw.dataType,
//             });
//         }
//         return props;
//     }

//     async function searchTableExists(container: string) {
//         const searchTableName = getSearchTableName(container);
//         const exists = await db.get("SELECT name from sqlite_master WHERE name = :attrTableName", fixParams({ attrTableName: searchTableName, }));
//         return exists;
//     }

//     async function setSchema(
//         options: SchemaDef,
//         changeTracking: TrackingOptions,
//     ) {
//         const {
//             name,
//             searchWithin,
//             sensitive,
//         } = options;

//         if (!searchWithin && !sensitive) return;

//         const baseTableName = name;
//         const searchTableName = getSearchTableName(name);

//         const updates = [];
//         if (searchWithin) updates.push("indexes=:indexes");
//         if (sensitive) updates.push("sensitive=:sensitive");

//         await db.run(
//             `UPDATE schema SET ${updates.join(",")} WHERE container=:container`,
//             fixParams({
//                 container: name,
//                 indexes: JSON.stringify({
//                     searchWithin,
//                 }),
//                 sensitive: JSON.stringify(sensitive)
//             })
//         );

//         // update indexes 
//         if (searchWithin) {
//             // does table exist?
//             let isNewTable = false;
//             if (!await searchTableExists(name)) {
//                 await db.run(`
//                     CREATE TABLE ${searchTableName} (key TEXT NOT NULL PRIMARY KEY)
//                 `);
//                 isNewTable = true;
//             }

//             // get existing columns on the tbl
//             const existing = await db.all(`
//                 SELECT 
//                     p.name, p.type
//                 FROM sqlite_master m
//                 left outer join pragma_table_info((m.name)) p
//                     on m.name <> p.name
//                 WHERE m.name = :attrTableName
//             `, fixParams({
//                 attrTableName: searchTableName,
//             }));

//             const props = parseSearchWithin(searchWithin);

//             const toPopulate = [];

//             // what columns need to be added?
//             const namesRequired = ["key"];
//             for(let prop of props) {
//                 namesRequired.push(prop.name);

//                 // does col already exist?
//                 let ignore = false;
//                 for(let row of existing) {
//                     if (row.name === prop.name) {
//                         ignore = true;
//                         break;
//                     }
//                 }
//                 if (ignore) {
//                     continue;
//                 }

//                 const dt = (mapDataType(prop.dataType) == DataType.number) ? "INT" : "TEXT";
//                 await db.run(`ALTER TABLE ${searchTableName} ADD ${prop.name} ${dt}`);
//                 toPopulate.push(prop);
//             }

//             // are there any indexes to delete?
//             for(let row of existing) {
//                 if (namesRequired.indexOf(row.name) < 0) {
//                     await db.run(`ALTER TABLE ${searchTableName} DROP ${row.name}`);
//                 }
//             }

//             if (toPopulate.length > 0) {
//                 const { rebuildIndex } = indexUpdater(options.name, toPopulate);

//                 const data = await db.all(`SELECT key, value FROM ${baseTableName}`);
//                 for(let row of data) {
//                     const value = JSON.parse(row.value);
//                     await rebuildIndex(row.key, value, isNewTable);
//                 }
//             }
//         }

//         if (changeTracking.track) {
//             logChange(name, "", {
//                 type: "container-set-schema",
//                 value: options,
//             });
//         }

//         return true;
//     }

//     function indexUpdater(container: string, props: DbPropDef[]) {
//         // populate new columns

//         let attribColumnNames = props.map((def) => def.name ).join(",");
//         let attribValueParams = props.map((def) => ":" + def.name ).join(",");
//         let attribUpdatePairs = props.map((def) => def.name + "=:" + def.name ).join(",");

//         const attrTableName = getSearchTableName(container);

//         async function doInsert(params: any, key: string) {
//             params[":key"] = key;
//             await db.run(
//                 `INSERT INTO ${attrTableName} (key, ${attribColumnNames}) VALUES (:key, ${attribValueParams})`,
//                 params,
//             );
//         }
//         async function doUpdate(params: any, key: string) {
//             const result = await db.run(
//                 `UPDATE ${attrTableName} SET ${attribUpdatePairs} WHERE key='${key}'`,
//                 params,
//             );
//             if (!result.changes) {
//                 await doInsert(params, key);
//             }
//         }

//         // NOTE: value is object not json
//         async function rebuildIndex(
//             key: string, value: any, 
//             // if know for sure its a new object then slightly faster to just insert instead try update and fallback to insert
//             isNewObject?: boolean
//         ) {
//             // console.log("rebuildIndex: " + key + ": " + JSON.stringify(value));

//             const params = {} as any;

//             for(let prop of props) {
//                 let v;

//                 if (!value) {
//                     // no value
//                 } else if (prop.parts.length <= 1) {
//                     // direct map to prop on value
//                     v = value[prop.name];
//                 } else {
//                     // have to navigate through object to get to value
//                     let o = value;
//                     let isValid = true;
//                     for(let i=0;i<prop.parts.length;i++) {
//                         const part = prop.parts[i];
//                         o = o[part];
//                         if (o === undefined) {
//                             isValid = false;
//                             break;
//                         }
//                     }
//                     if (isValid) {
//                         v = o;
//                     }
//                 }

//                 params[":" + prop.name] = v;
//             }

//             if (isNewObject) {
//                 await doInsert(params, key);
//             } else {
//                 await doUpdate(params, key);
//             }
//         }

//         return {
//             rebuildIndex,
//         }

//     }

//     async function close() {
//         return db.close();
//     }

//     async function getRow(qry: string, params?: any) {
//         return db.get(qry, fixParams(params));
//     }
//     async function getRows(qry: string, params?: any) {
//         return db.all(qry, fixParams(params));
//     }

//     async function get(options: {
//         container: string, 
//         key: string,
//     }) {
//         const row = await getRow(`SELECT value FROM ${options.container} WHERE key like :key`, {
//             key: options.key,
//         });
//         if (row) {
//             return row.value;
//         } else {
//             return undefined;
//         }
//     }

//     async function logChange(container: string, key: string, change: Change) {
//         const sql = `
//             INSERT INTO changes (container, key, change, timestamp)
//             VALUES (:container, :key, :change, :timestamp)
//         `;
//         // console.log(sql);
//         const result = db.run(sql, fixParams({
//             container,
//             key,
//             change: JSON.stringify(change),
//             timestamp: formatDateTime(new Date())
//         }))
//     }

//     // get existing value
//     async function getExisting(container: string, key: string) {
//         const result = await db.get(`SELECT value, version FROM ${container} WHERE key=:key`, fixParams({ key, }));
//         // console.log("existing: " + JSON.stringify(result));
//         return result;
//     }

//     async function set(
//         options: {
//             container: string, 
//             object: ObjectDef,
//             user?: UserContext,
//         },

//         // indicates that diffs should be determined and saved
//         changeTracking: TrackingOptions,
//     ) {

//         const container = options.container;

//         // get the key
//         let key = options.object.key;

//         if (!key) {
//             // if inserting, auto create a key
//             key = uuid();
//         }

//         // and remove from the supplied object because don't want key saved into value
//         delete options.object["key"];

//         const existing = await getExisting(container, key);
//         if (existing) {
//             options.object.updated = formatDateTime(new Date());
//             if (options.user) options.object.updated_by = options.user.key;
//             await update(existing, 0);
//         } else {
//             options.object.created = formatDateTime(new Date());
//             if (options.user) options.object.created_by = options.user.key;
//             await insert();
//         }

//         async function update(existing: any, retryCount: number) {
//             if (!existing.version) existing.version = 1;
//             const newVersion = existing.version + 1;
            
//             const valueAsString = JSON.stringify(options.object);

//             const params = fixParams({
//                 key,
//                 value: valueAsString,
//                 existingVersion: existing.version,
//                 version: newVersion,
//             });
//             const sql = `UPDATE ${container} SET value=:value, version=:version WHERE key=:key and version=:existingVersion`;
//             //console.log(params);
//             const result = await db.run(sql, params);
//             //console.log(result);
//             if (!result.changes) {
//                 // failed to update, is it because another update happened?
//                 const maxRetries = 3;
//                 if (++retryCount < maxRetries) {
//                     const existing = await getExisting(container, key!);
//                     await update(existing, retryCount);
//                 } else {
//                     throw `Unable to update ${container}/${key} after ${maxRetries} retries`;
//                 }
//             }

//             // check what has changed
//             const objExisting = JSON.parse(existing.value);
//             const changes = diff(objExisting, options.object);
//             if (changes.length > 0) {
//                 if (changeTracking.track) {
//                     logChange(
//                         container,
//                         key!,
//                         {
//                             type: "object-update",
//                             container,
//                             key,
//                             changes,
//                         }
//                     );
//                 }
//             }
//         }

//         async function insert() {
//             const sql = `INSERT INTO ${container} (key, value, version) VALUES (:key, :value, :version)`;

//             const valueAsString = JSON.stringify(options.object);

//             const params = fixParams({
//                 key,
//                 value: valueAsString,
//                 version: existing ? existing.version : 1,
//             });
//             const result = await db.run(sql, params);
//             if (!result.changes) {
//                 throw "Failed attempt to insert ${container}/${key}";
//             }

//             options.object.key = key;
//             if (changeTracking.track) {
//                 logChange(container, key!, {
//                     type: "object-add",
//                     container: container,
//                     value: options.object,
//                 });
//             }
//         }

//         // const sql = `
//         //     INSERT INTO ${container} (key, value)
//         //     VALUES (:key, :value)
//         //     ON CONFLICT (key)
//         //     DO UPDATE SET value=:value
//         // `;


//         // update indexes
//         const indexes = await getIndexes(container);
//         if (indexes) {
//             const props = parseSearchWithin(indexes.searchWithin);
//             const { rebuildIndex } = indexUpdater(container, props);
//             await rebuildIndex(key, options.object);
//         }

//         // put the key back back onto the object
//         options.object.key = key;

//         return result;
//     }

//     async function del(
//         options: {
//             container: string,
//             key: string,
//         },
//         changeTracking: TrackingOptions,
//     ) {
//         const { container, key } = options;

//         const existing = await getExisting(container, key);
//         if (existing) {
//             const params = fixParams({
//                 key,
//             });

//             await db.run(`DELETE FROM ${container} WHERE key=:key`, params);
//             await db.run(`DELETE FROM ${getSearchTableName(container)} WHERE key=:key`, params);

//             if (changeTracking.track) {
//                 logChange(container, key, {
//                     type: "object-delete",
//                     container,
//                     key,
//                 });
//             }
//         } else {
//             throw `Item ${container}/${key} not found`;
//         }

//         return true;
//     }

//     async function getIndexes(container: string) {
//         const result = await db.get(`
//             SELECT indexes
//             FROM schema 
//             WHERE container = :container
//         `, fixParams({
//             container,
//         }));

//         return result ? JSON.parse(result.indexes) : undefined;
//     }

//     async function getSchema(options: {
//         name: string,
//     }) {
//         const item = await db.get("SELECT * FROM schema WHERE container = :container", fixParams({ container: options.name }));
//         if (!item) return undefined;

//         return {
//             name: options.name,
//             indexes: JSON.parse(item.indexes),
//             sensitive: JSON.parse(item.sensitive),
//         }
//     }

//     async function reset(options: {

//     }) {
//         // get all existing tables
//         const names = await db.all("SELECT name from sqlite_master where type='table'");
//         if (!names) return;

//         const ignore = [
//             "sqlite_sequence",
//         ];

//         const sql = [];
//         for(let row of names) {
//             if (ignore.indexOf(row.name) < 0) {
//                 sql.push(`DROP TABLE ${row.name}`);
//             }
//         }

//         await db.exec(sql.join(";"));

//         return checkForBaseRequirements();
//     }

//     async function searchAll(queries: SearchOptions[]) {
//         const results = [];

//         for(let q of queries) {
//             results.push(search(q));
//         }

//         return Promise.all(results);
//     }

//     async function search(options: SearchOptions) {

//         const crit: string[] = [];
//         const vals = {} as any;
//         let paramCounter = 0;

//         const returnType = options.returnType ? options.returnType : "keys";

//         let qry = options.qry;

//         // get the props that have been indexed 
//         // ... as we parse the query need to confirm that only those are being referenced
//         const indexes = await getIndexes(options.container);
//         const availableIndexes = {} as any;
//         if (indexes && indexes.searchWithin) {
//             for(let i=0;i<indexes.searchWithin.length;i++) {
//                 const sw = indexes.searchWithin[i];
//                 availableIndexes[sw.name] = true;
//             }
//         }
//         // console.log("availableIndexes: " + JSON.stringify(availableIndexes));

//         function hasIndex(name: string) {
//             return (availableIndexes[name] !== undefined);
//         }
        
//         function parseComparison(ex: Comparison) {
//             if (!hasIndex(ex.prop)) {
//                 throw `Attempting to query a property '${ex.prop}' in container '${options.container}' that has not been indexed`;
//             }

//             const paramName = ":p" + paramCounter++;
//             crit.push(
//                 "s." + ex.prop.replace(".", "_") + " " + ex.comparator + " " + paramName
//             );
//             vals[paramName] = ex.value;
//         }
//         function parseComparisonArray(items: Expression[]) {
//             if (items.length <= 0) return;

//             for(let i=0;i<items.length;i++) {
//                 const comparison = items[i] as Comparison;

//                 if (Array.isArray(comparison)) {
//                     if (comparison.length > 0) {
//                         if (i > 0) {
//                             const first = comparison[0];
//                             crit.push(" " + ((first.op == "||") ? "OR" : "AND") + " ");
//                         }
//                         crit.push("(");
//                         parseComparisonArray(comparison);    
//                         crit.push(")");
//                     }
//                 } else {
//                     if (i > 0) {
//                         crit.push(" " + ((comparison.op == "||") ? "OR" : "AND") + " ");
//                     }
//                     parseComparison(comparison);    
//                 }

//             }
//         }

//         if (qry) {
//             // were we provide an already built query or just a string?
//             if (isString(qry)) {
//                 // first build query object 
//                 const parsed = parseSearchQueryString(qry as any, options.params);
//                 if (parsed.errors && parsed.errors.length > 0) {
//                     return parsed.errors;
//                 }
//                 qry = parsed.query;
//             }

//             if (Array.isArray(qry)) {
//                 parseComparisonArray(qry);
//             } else {
//                 parseComparison(qry as any);
//             }            
//         }

//         let sql = `
//             SELECT t.key${((returnType !== "keys") ? ", t.value" : "")}
//             FROM ${options.container} t
//             INNER JOIN ${getSearchTableName(options.container)} s ON t.key = s.key
//         `;
//         if (crit.length > 0) {
//             sql += `WHERE ${crit.join("")}`;
//         }
//         // console.log(sql);

//         const items = await db.all(sql, vals);
//         if (returnType !== "map") return items;

//         // map
//         const map: any = {};
//         for(let i of items) {
//             map[i.key] = i;
//             delete i.key;
//         }
//         return map;
//     }

//     async function getChanges(options: {
//         since?: Date,
//         from?: number, // id
//     }) {
//         //let sql = "SELECT id, container, key, change, timestamp FROM changes";
//         let sql = "SELECT change FROM changes";

//         const params = {} as any;
//         const where = [];
//         if (options.since) {
//             where.push("timestamp >= :since");
//             params.since = options.since;
//         }
//         if (options.from) {
//             where.push("id >= :fromID");
//             params.fromID = options.from;
//         }
//         if (where.length > 0) {
//             sql += " WHERE (" + where.join(" AND ") + ")";
//         }

//         sql += " ORDER BY id";

//         const items = await db.all(sql, fixParams(params));
//         const result = [];
//         for(let item of items) {
//             result.push(JSON.parse(item.change));
//         }
//         return result;
//     }

//     async function merge(options: {
//         changes: Change[],
//     }) {

//         for(let change of options.changes) {
//             if (change.type === "object-add") {
//                 const container = change.container;
//                 const object = change.value;
//                 if (container) {
//                     await set(
//                         {
//                             container, 
//                             object,
//                         }, 
//                         {
//                             track: false, // don't track this change
//                         }, 
//                     );
//                 }
            
//             } else if (change.type === 'object-update') {
//                 if (change.container && change.key && change.changes) {
//                     await applyChangesToObject(
//                         change.container,
//                         change.key,
//                         change.changes
//                     );
//                 }

//             } else if (change.type === "object-delete") {
//                 const container = change.container;
//                 const key = change.key;
//                 if (container && key) {
//                     await set(
//                         {
//                             container,
//                             object: {
//                                 key,
//                             },
//                         },
//                         {
//                             track: false, // don't track this change
//                         }, 
//                     );

//                 }

//             } else if (change.type === 'container-set') {
//                 await setContainer(change.value, { track: false });

//             } else if (change.type === "container-set-schema") {
//                 await setSchema(change.value, { track: false });

//             }

//         }
//     }

//     async function applyChangesToObject(container: string, key: string, changes: Change[]) {

//         //console.log(`Applying changes to ${container}/${key}`);

//         // get existing value 
//         const json = await get({ container, key });
//         if (!json) {
//             // object no longer exists
//             // TODO: how report this error?
//             return;
//         }

//         const object = JSON.parse(json);
//         if (!object) {
//             // TODO: how report this error?
//             return;
//         }

//         function getProp(path: string, returnParent?: boolean) {
//             const parts = path.split(".");
//             let o = object;

//             if (returnParent && parts.length === 1) return o;

//             for(let i=0;i<parts.length;i++) {
//                 if (o === undefined) return undefined;
//                 const p = parts[i];
//                 o = o[p];

//                 if (returnParent && (i === parts.length-2)) return o;
//             }
//             return o;
//         }
//         function setProp(path: string, val: any) {
//             const parts = path.split(".");
//             let o = object;
//             for(let i=0;i<parts.length-1;i++) {
//                 const p = parts[i];

//                 let oNext = o[p];
//                 if (oNext === undefined) {
//                     // if can't find part of the path then have to create as we go
//                     oNext = {};
//                 }
//                 o = oNext;
//             }

//             o[parts[parts.length-1]] = val;
//         }

//         for (let c of changes) {
//             //console.log("change: " + JSON.stringify(c));

//             if (c.type === 'array-add') {
//                 const a = getProp(c.prop!);
//                 if (a) {
//                     a.splice(c.index, 0, c.value);
//                 } else {
//                     // TODO: error?
//                 }

//             } else if (c.type === "array-update") {
//                 const a = getProp(c.prop!);
//                 if (a) {
//                     for(let i=0;i<a.length;i++) {
//                         const elem = a[i];
//                         if (elem.key === c.key) {
//                             a[i] = c.value;
//                             break;
//                         }
//                     }
//                 } else {
//                     // TODO: error?
//                 }

//             } else if (c.type === 'array-delete') {
//                 const a = getProp(c.prop!);
//                 if (a) {
//                     for(let i=0;i<a.length;i++) {
//                         const elem = a[i];
//                         if (elem.key === c.key) {
//                             a.splice(i, 1);
//                             break;
//                         }
//                     }
//                 } else {
//                     // TODO: error?
//                 }

//             } else if (c.type === 'array-order') {
//                 const indexed = [];
//                 const items = getProp(c.prop!);
//                 if (items && c.value && c.value.length > 0) {
//                     const map = {} as any;
//                     for(let item of items) {
//                         map[item.key] = item;
//                     }
//                     const sorted = [];
//                     for(let key of c.value) {
//                         sorted.push(map[key]);
//                     }

//                 } else {
//                     // TODO: error?

//                 }

//             } else if (c.type === 'prop-add') {
//                 if (c.prop) {
//                     setProp(c.prop, c.value);
                    
//                 } else {
//                     // TODO: error?

//                 }

//             } else if (c.type === 'prop-delete') {
//                 if (c.prop) {
//                     const parent = getProp(c.prop, true);
//                     if (parent) {
//                         delete parent[c.prop];
//                     }
//                 } else {
//                     // TODO: error?

//                 }

//             } else if (c.type === 'prop-rename') {
//                 if (c.prop && c.value) {
//                     const parent = getProp(c.prop, true);
//                     if (parent) {
//                         const val = parent[c.prop];
//                         const newPropName = c.value;
//                         parent[newPropName] = val;
//                         delete parent[c.prop];
//                     }
//                 } else {
//                     // TODO: error?

//                 }

//             } else if (c.type === 'prop-update') {
//                 if (c.prop) {
//                     setProp(c.prop, c.value);
                    
//                 } else {
//                     // TODO: error?

//                 }

//             }

//         }

//         // make sure the key is part of the object
//         object.key = key;

//         // now that all change are applied attempt to update the object with new value
//         await set(
//             {
//                 container, 
//                 object,
//             },
//             {
//                 track: false, // don't track this change
//             }, 
//         );
//     }

    
//     const result: Store = {
//         close,

//         getContainer,
//         setContainer,
//         containerExists,
//         setSchema,

//         get,
//         set,
//         del,

//         reset,

//         search,
//         searchAll,

//         getSchema,

//         getChanges,
//         merge,
//     };

//     return result;

// };
