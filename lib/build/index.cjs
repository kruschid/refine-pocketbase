
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
var $1e2719ea16b9ea96$exports = {};

$parcel$export($1e2719ea16b9ea96$exports, "authProvider", () => $1e2719ea16b9ea96$export$e8bf4fc9c69db7dc);
const $6230b1dcb84d25ba$var$OPERATOR_MAP = {
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
const $6230b1dcb84d25ba$export$1c8dedcd7fb2d13c = (x)=>typeof x.response === "object" && typeof x.isAbort === "boolean" && typeof x.url === "string" && typeof x.status === "number";
const $6230b1dcb84d25ba$export$6fba81d1fad7cbc8 = (e)=>({
        message: e.message,
        statusCode: e.status,
        errors: Object.keys(e.response.data).reduce((acc, next)=>({
                ...acc,
                [next]: e.response.data[next].message
            }), {})
    });
const $6230b1dcb84d25ba$var$isConditionalFilter = (filter)=>filter.operator === "and" || filter.operator === "or";
const $6230b1dcb84d25ba$export$78d9b3e650ad534 = (filters, joinOperator = "and", pos = 0)=>filters.map((filter, i)=>$6230b1dcb84d25ba$var$isConditionalFilter(filter) ? `(${$6230b1dcb84d25ba$export$78d9b3e650ad534(filter.value, filter.operator, i)})` : `${filter.field} ${$6230b1dcb84d25ba$var$OPERATOR_MAP[filter.operator]} {:${filter.field}${pos}${i}}`).join(` ${$6230b1dcb84d25ba$var$OPERATOR_MAP[joinOperator]} `);
const $6230b1dcb84d25ba$export$4165c49e0e7fdc76 = (filters, pos = 0)=>filters.reduce((acc, filter, i)=>({
            ...acc,
            ...$6230b1dcb84d25ba$var$isConditionalFilter(filter) ? $6230b1dcb84d25ba$export$4165c49e0e7fdc76(filter.value, i) : {
                [filter.field + pos + i]: filter.value
            }
        }), {});


const $1e2719ea16b9ea96$var$defaultOptions = {
    collection: "users",
    requestVerification: false
};
const $1e2719ea16b9ea96$var$isLoginWithProvider = (x)=>typeof x.providerName === "string";
const $1e2719ea16b9ea96$export$e8bf4fc9c69db7dc = (pb, authOptions)=>{
    const options = {
        ...$1e2719ea16b9ea96$var$defaultOptions,
        ...authOptions
    };
    return {
        register: async ({ email: email, password: password, username: username, name: name })=>{
            try {
                await pb.collection(options.collection).create({
                    email: email,
                    username: username,
                    name: name,
                    password: password,
                    passwordConfirm: password
                }, {
                    requestKey: null
                });
                if (options.requestVerification) await pb.collection(options.collection).requestVerification(email, {
                    requestKey: null
                });
                return {
                    success: true,
                    redirectTo: options.registerRedirectTo
                };
            } catch (err) {
                return {
                    success: false,
                    error: (0, $6230b1dcb84d25ba$export$1c8dedcd7fb2d13c)(err) ? (0, $6230b1dcb84d25ba$export$6fba81d1fad7cbc8)(err) : undefined,
                    redirectTo: options.registerErrorRedirectTo
                };
            }
        },
        forgotPassword: async ({ email: email })=>{
            try {
                await pb.collection(options.collection).requestPasswordReset(email, {
                    requestKey: null
                });
                return {
                    success: true,
                    redirectTo: options.forgotPasswordRedirectTo
                };
            } catch (err) {
                return {
                    success: false,
                    error: (0, $6230b1dcb84d25ba$export$1c8dedcd7fb2d13c)(err) ? (0, $6230b1dcb84d25ba$export$6fba81d1fad7cbc8)(err) : undefined,
                    redirectTo: options.forgotPasswordErrorRedirectTo
                };
            }
        },
        updatePassword: async ({ token: token, password: password, confirmPassword: confirmPassword })=>{
            try {
                await pb.collection(options.collection).confirmPasswordReset(token, password, confirmPassword, {
                    requestKey: null
                });
                return {
                    success: true,
                    redirectTo: options.updatePasswordRedirectTo
                };
            } catch (err) {
                return {
                    success: false,
                    error: (0, $6230b1dcb84d25ba$export$1c8dedcd7fb2d13c)(err) ? (0, $6230b1dcb84d25ba$export$6fba81d1fad7cbc8)(err) : undefined,
                    redirectTo: options.updatePasswordErrorRedirectTo
                };
            }
        },
        login: async (loginOptions)=>{
            try {
                if ($1e2719ea16b9ea96$var$isLoginWithProvider(loginOptions)) {
                    await pb.collection(options.collection).authWithOAuth2({
                        provider: loginOptions.providerName
                    });
                    if (pb.authStore.isValid) return {
                        success: true,
                        redirectTo: options.loginRedirectTo
                    };
                } else {
                    await pb.collection(options.collection).authWithPassword(loginOptions.email, loginOptions.password, {
                        requestKey: null
                    });
                    if (pb.authStore.isValid) return {
                        success: true,
                        redirectTo: options.loginRedirectTo
                    };
                }
            } catch (err) {
                return {
                    success: false,
                    error: (0, $6230b1dcb84d25ba$export$1c8dedcd7fb2d13c)(err) ? (0, $6230b1dcb84d25ba$export$6fba81d1fad7cbc8)(err) : undefined,
                    redirectTo: options.loginErrorRedirectTo
                };
            }
            return {
                success: false,
                error: {
                    name: "Login Error",
                    message: "Invalid email or password"
                }
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
                authenticated: true,
                redirectTo: options.authenticatedRedirectTo
            };
            return {
                authenticated: false,
                redirectTo: options.unauthenticatedRedirectTo
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
    };
};


var $ce836261808abf8d$exports = {};

$parcel$export($ce836261808abf8d$exports, "dataProvider", () => $ce836261808abf8d$export$dabd5b4fbec78fc8);

const $ce836261808abf8d$export$dabd5b4fbec78fc8 = (pb)=>({
        getList: async ({ resource: resource, pagination: pagination, filters: filters, sorters: sorters })=>{
            const { current: current = 1, pageSize: pageSize = 10, mode: mode = "server" } = pagination ?? {};
            const sort = sorters?.map((s)=>`${s.order === "desc" ? "-" : ""}${s.field}`).join(",");
            const filter = filters ? pb.filter((0, $6230b1dcb84d25ba$export$78d9b3e650ad534)(filters), (0, $6230b1dcb84d25ba$export$4165c49e0e7fdc76)(filters)) : undefined;
            const collection = pb.collection(resource);
            try {
                if (mode === "server") {
                    const { items: items, totalItems: totalItems } = await collection.getList(current, pageSize, {
                        ...sort ? {
                            sort: sort
                        } : {},
                        ...filter ? {
                            filter: filter
                        } : {},
                        requestKey: null
                    });
                    return {
                        data: items,
                        total: totalItems
                    };
                } else {
                    const items = await collection.getFullList({
                        sort: sort,
                        filter: filter,
                        requestKey: null
                    });
                    return {
                        data: items,
                        total: items.length
                    };
                }
            } catch (e) {
                if ((0, $6230b1dcb84d25ba$export$1c8dedcd7fb2d13c)(e)) throw (0, $6230b1dcb84d25ba$export$6fba81d1fad7cbc8)(e);
                throw e;
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
                if ((0, $6230b1dcb84d25ba$export$1c8dedcd7fb2d13c)(e)) throw (0, $6230b1dcb84d25ba$export$6fba81d1fad7cbc8)(e);
                throw e;
            }
        },
        update: async ({ resource: resource, id: id, variables: variables })=>{
            try {
                const data = await pb.collection(resource).update(id, variables, {
                    requestKey: null
                });
                return {
                    data: data
                };
            } catch (e) {
                if ((0, $6230b1dcb84d25ba$export$1c8dedcd7fb2d13c)(e)) throw (0, $6230b1dcb84d25ba$export$6fba81d1fad7cbc8)(e);
                throw e;
            }
        },
        getOne: async ({ resource: resource, id: id })=>{
            try {
                const data = await pb.collection(resource).getOne(id, {
                    requestKey: null
                });
                return {
                    data: data
                };
            } catch (e) {
                if ((0, $6230b1dcb84d25ba$export$1c8dedcd7fb2d13c)(e)) throw (0, $6230b1dcb84d25ba$export$6fba81d1fad7cbc8)(e);
                throw e;
            }
        },
        deleteOne: async ({ resource: resource, id: id })=>{
            try {
                const deleted = await pb.collection(resource).delete(id, {
                    requestKey: null
                });
                return {
                    data: deleted ? {
                        id: id
                    } : undefined
                };
            } catch (e) {
                if ((0, $6230b1dcb84d25ba$export$1c8dedcd7fb2d13c)(e)) throw (0, $6230b1dcb84d25ba$export$6fba81d1fad7cbc8)(e);
                throw e;
            }
        },
        getApiUrl: ()=>{
            return pb.baseUrl;
        }
    });


var $67b66a3995bacb37$exports = {};

$parcel$export($67b66a3995bacb37$exports, "liveProvider", () => $67b66a3995bacb37$export$f3d5cfaf6cdab48e);
const $67b66a3995bacb37$export$f3d5cfaf6cdab48e = (pb)=>({
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


$parcel$exportWildcard(module.exports, $1e2719ea16b9ea96$exports);
$parcel$exportWildcard(module.exports, $ce836261808abf8d$exports);
$parcel$exportWildcard(module.exports, $67b66a3995bacb37$exports);


//# sourceMappingURL=index.cjs.map
