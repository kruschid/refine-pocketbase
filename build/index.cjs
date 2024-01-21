
function $parcel$exportWildcard(dest, source) {
  Object.keys(source).forEach(function(key) {
    if (key === 'default' || key === '__esModule' || Object.prototype.hasOwnProperty.call(dest, key)) {
      return;
    }

    Object.defineProperty(dest, key, {
      enumerable: true,
      get: function get() {
        return source[key];
      }
    });
  });

  return dest;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}
var $f6c65be57985ec3a$exports = {};

$parcel$export($f6c65be57985ec3a$exports, "authProvider", () => $f6c65be57985ec3a$export$e8bf4fc9c69db7dc);
const $f6c65be57985ec3a$var$isLoginWithProvider = (x)=>typeof x.providerName === "string";
const $f6c65be57985ec3a$export$e8bf4fc9c69db7dc = (pb, options = {
    loginRedirectTo: "/",
    loginErrorRedirectTo: undefined,
    logoutRedirectTo: "/login",
    checkRedirectTo: "/login"
})=>({
        login: async (loginOptions)=>{
            if ($f6c65be57985ec3a$var$isLoginWithProvider(loginOptions)) {
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


var $948c0f05b1a2dabe$exports = {};

$parcel$export($948c0f05b1a2dabe$exports, "dataProvider", () => $948c0f05b1a2dabe$export$dabd5b4fbec78fc8);
$parcel$export($948c0f05b1a2dabe$exports, "extractFilterExpression", () => $948c0f05b1a2dabe$export$78d9b3e650ad534);
$parcel$export($948c0f05b1a2dabe$exports, "extractFilterValues", () => $948c0f05b1a2dabe$export$4165c49e0e7fdc76);
const $948c0f05b1a2dabe$export$dabd5b4fbec78fc8 = (pb)=>({
        getList: async ({ resource: resource, pagination: pagination, filters: filters, sorters: sorters })=>{
            const { current: current = 1, pageSize: pageSize = 10, mode: mode = "server" } = pagination ?? {};
            const sort = sorters?.map((s)=>`${s.order === "desc" ? "-" : ""}${s.field}`).join(",");
            const filter = filters ? pb.filter($948c0f05b1a2dabe$export$78d9b3e650ad534(filters), $948c0f05b1a2dabe$export$4165c49e0e7fdc76(filters)) : undefined;
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
                if ($948c0f05b1a2dabe$var$isClientResponseError(e)) throw $948c0f05b1a2dabe$var$toHttpError(e);
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
                if ($948c0f05b1a2dabe$var$isClientResponseError(e)) throw $948c0f05b1a2dabe$var$toHttpError(e);
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
const $948c0f05b1a2dabe$var$OPERATOR_MAP = {
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
const $948c0f05b1a2dabe$var$isClientResponseError = (x)=>typeof x.response === "object";
const $948c0f05b1a2dabe$var$toHttpError = (e)=>({
        message: e.message,
        statusCode: e.status,
        errors: Object.keys(e.response.data).reduce((acc, next)=>({
                ...acc,
                [next]: e.response.data[next].message
            }), {})
    });
const $948c0f05b1a2dabe$var$isConditionalFilter = (filter)=>filter.operator === "and" || filter.operator === "or";
const $948c0f05b1a2dabe$export$78d9b3e650ad534 = (filters, joinOperator = "and", pos = 0)=>filters.map((filter, i)=>$948c0f05b1a2dabe$var$isConditionalFilter(filter) ? `(${$948c0f05b1a2dabe$export$78d9b3e650ad534(filter.value, filter.operator, i)})` : `${filter.field} ${$948c0f05b1a2dabe$var$OPERATOR_MAP[filter.operator]} {:${filter.field}${pos}${i}}`).join(` ${$948c0f05b1a2dabe$var$OPERATOR_MAP[joinOperator]} `);
const $948c0f05b1a2dabe$export$4165c49e0e7fdc76 = (filters, pos = 0)=>filters.reduce((acc, filter, i)=>({
            ...acc,
            ...$948c0f05b1a2dabe$var$isConditionalFilter(filter) ? $948c0f05b1a2dabe$export$4165c49e0e7fdc76(filter.value, i) : {
                [filter.field + pos + i]: filter.value
            }
        }), {});


var $572e3dbb58daac35$exports = {};

$parcel$export($572e3dbb58daac35$exports, "liveProvider", () => $572e3dbb58daac35$export$f3d5cfaf6cdab48e);
const $572e3dbb58daac35$export$f3d5cfaf6cdab48e = (pb)=>({
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


$parcel$exportWildcard(module.exports, $f6c65be57985ec3a$exports);
$parcel$exportWildcard(module.exports, $948c0f05b1a2dabe$exports);
$parcel$exportWildcard(module.exports, $572e3dbb58daac35$exports);


//# sourceMappingURL=index.cjs.map
