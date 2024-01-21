
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}
var $a86282f59d4649fe$exports = {};

$parcel$export($a86282f59d4649fe$exports, "authProvider", () => $a86282f59d4649fe$export$e8bf4fc9c69db7dc);
const $a86282f59d4649fe$var$isLoginWithProvider = (x)=>typeof x.providerName === "string";
const $a86282f59d4649fe$export$e8bf4fc9c69db7dc = (pb, options = {
    loginRedirectTo: "/",
    loginErrorRedirectTo: undefined,
    logoutRedirectTo: "/login",
    checkRedirectTo: "/login"
})=>({
        login: async (loginOptions)=>{
            if ($a86282f59d4649fe$var$isLoginWithProvider(loginOptions)) {
                await pb.collection("users").authWithOAuth2({
                    provider: loginOptions.providerName
                }).catch(()=>null);
                if (pb.authStore.isValid) return {
                    success: true,
                    redirectTo: options.loginRedirectTo
                };
            } else {
                await pb.collection("users").authWithPassword(loginOptions.email, loginOptions.password).catch(()=>null);
                if (pb.authStore.isValid) return {
                    success: true,
                    redirectTo: options.loginRedirectTo
                };
            }
            return {
                success: false,
                error: {
                    name: "Login error",
                    message: "Invalid credentials"
                },
                redirectTo: options.loginErrorRedirectTo
            };
        },
        logout: async ()=>{
            pb.authStore.clear();
            return {
                success: true,
                redirectTo: options.logoutRedirectTo
            };
        },
        check: async ()=>{
            if (pb.authStore.isValid) return {
                authenticated: true
            };
            return {
                authenticated: false,
                redirectTo: options.checkRedirectTo
            };
        },
        getPermissions: async ()=>null,
        getIdentity: async ()=>{
            if (pb.authStore.isValid && pb.authStore.model) {
                const { id: id, name: name, avatar: avatar } = pb.authStore.model;
                return {
                    id: id,
                    name: name,
                    avatar: avatar
                };
            }
            return null;
        },
        onError: async (error)=>{
            return {
                error: error
            };
        }
    });


var $765b9e0f98c0190b$exports = {};

$parcel$export($765b9e0f98c0190b$exports, "dataProvider", () => $765b9e0f98c0190b$export$dabd5b4fbec78fc8);
$parcel$export($765b9e0f98c0190b$exports, "extractFilterExpression", () => $765b9e0f98c0190b$export$78d9b3e650ad534);
$parcel$export($765b9e0f98c0190b$exports, "extractFilterValues", () => $765b9e0f98c0190b$export$4165c49e0e7fdc76);
const $765b9e0f98c0190b$export$dabd5b4fbec78fc8 = (pb)=>({
        getList: async ({ resource: resource, pagination: pagination, filters: filters, sorters: sorters })=>{
            const { current: current = 1, pageSize: pageSize = 10, mode: mode = "server" } = pagination ?? {};
            const sort = sorters?.map((s)=>`${s.order === "desc" ? "-" : ""}${s.field}`).join(",");
            const filter = filters ? pb.filter($765b9e0f98c0190b$export$78d9b3e650ad534(filters), $765b9e0f98c0190b$export$4165c49e0e7fdc76(filters)) : undefined;
            const collection = pb.collection(resource);
            if (mode === "server") {
                const { items: items, totalItems: totalItems } = await collection.getList(current, pageSize, {
                    sort: sort,
                    filter: filter
                });
                return {
                    data: items,
                    total: totalItems
                };
            } else {
                const items = await collection.getFullList({
                    sort: sort,
                    filter: filter
                });
                return {
                    data: items,
                    total: items.length
                };
            }
        },
        create: async ({ resource: resource, variables: variables })=>{
            try {
                const data = await pb.collection(resource).create(variables, {
                    requestKey: null
                });
                return {
                    data: data
                };
            } catch (e) {
                if ($765b9e0f98c0190b$var$isClientResponseError(e)) throw $765b9e0f98c0190b$var$toHttpError(e);
                throw e;
            }
        },
        update: async ({ resource: resource, id: id, variables: variables })=>{
            try {
                const data = await pb.collection(resource).update(id, variables);
                return {
                    data: data
                };
            } catch (e) {
                if ($765b9e0f98c0190b$var$isClientResponseError(e)) throw $765b9e0f98c0190b$var$toHttpError(e);
                throw e;
            }
        },
        getOne: async ({ resource: resource, id: id })=>{
            const data = await pb.collection(resource).getOne(id);
            return {
                data: data
            };
        },
        deleteOne: async ({ resource: resource, id: id })=>{
            const deleted = await pb.collection(resource).delete(id);
            return {
                data: deleted ? {
                    id: id
                } : undefined
            };
        },
        getApiUrl: ()=>{
            return pb.baseUrl;
        }
    });
const $765b9e0f98c0190b$var$OPERATOR_MAP = {
    eq: "=",
    ne: "!=",
    lt: "<",
    gt: ">",
    lte: "<=",
    gte: ">=",
    in: "?=",
    nin: "?!=",
    contains: "~",
    ncontains: "!~",
    containss: "~",
    ncontainss: "!~",
    between: "",
    nbetween: "",
    null: "=",
    nnull: "!=",
    startswith: "~",
    nstartswith: "!~",
    startswiths: "~",
    nstartswiths: "!~",
    endswith: "~",
    nendswith: "!~",
    endswiths: "~",
    nendswiths: "!~",
    or: "||",
    and: "&&"
};
const $765b9e0f98c0190b$var$isClientResponseError = (x)=>typeof x.response === "object";
const $765b9e0f98c0190b$var$toHttpError = (e)=>({
        message: e.message,
        statusCode: e.status,
        errors: Object.keys(e.response.data).reduce((acc, next)=>({
                ...acc,
                [next]: e.response.data[next].message
            }), {})
    });
const $765b9e0f98c0190b$var$isConditionalFilter = (filter)=>filter.operator === "and" || filter.operator === "or";
const $765b9e0f98c0190b$export$78d9b3e650ad534 = (filters, joinOperator = "and", pos = 0)=>filters.map((filter, i)=>$765b9e0f98c0190b$var$isConditionalFilter(filter) ? `(${$765b9e0f98c0190b$export$78d9b3e650ad534(filter.value, filter.operator, i)})` : `${filter.field} ${$765b9e0f98c0190b$var$OPERATOR_MAP[filter.operator]} {:${filter.field}${pos}${i}}`).join(` ${$765b9e0f98c0190b$var$OPERATOR_MAP[joinOperator]} `);
const $765b9e0f98c0190b$export$4165c49e0e7fdc76 = (filters, pos = 0)=>filters.reduce((acc, filter, i)=>({
            ...acc,
            ...$765b9e0f98c0190b$var$isConditionalFilter(filter) ? $765b9e0f98c0190b$export$4165c49e0e7fdc76(filter.value, i) : {
                [filter.field + pos + i]: filter.value
            }
        }), {});


var $109481579afd0f8f$exports = {};

$parcel$export($109481579afd0f8f$exports, "liveProvider", () => $109481579afd0f8f$export$f3d5cfaf6cdab48e);
const $109481579afd0f8f$export$f3d5cfaf6cdab48e = (pb)=>({
        subscribe: ({ channel: channel, params: params, callback: callback })=>{
            return pb.collection(channel.replace("resources/", "")).subscribe(params?.id?.toString() ?? "*", (e)=>{
                const liveEvent = {
                    channel: channel,
                    date: new Date(),
                    payload: e.record,
                    type: e.action
                };
                callback(liveEvent);
            });
        },
        unsubscribe: (unsubscribeFn)=>{
            unsubscribeFn.then((unsub)=>unsub());
        }
    });




export {$a86282f59d4649fe$export$e8bf4fc9c69db7dc as authProvider, $765b9e0f98c0190b$export$dabd5b4fbec78fc8 as dataProvider, $765b9e0f98c0190b$export$78d9b3e650ad534 as extractFilterExpression, $765b9e0f98c0190b$export$4165c49e0e7fdc76 as extractFilterValues, $109481579afd0f8f$export$f3d5cfaf6cdab48e as liveProvider};
//# sourceMappingURL=index.mjs.map
