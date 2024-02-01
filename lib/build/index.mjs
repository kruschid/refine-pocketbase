
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}
var $e3c1a31094ec9f2b$exports = {};

$parcel$export($e3c1a31094ec9f2b$exports, "authProvider", () => $e3c1a31094ec9f2b$export$e8bf4fc9c69db7dc);
const $3e9ca308e87fd7de$var$OPERATOR_MAP = {
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
const $3e9ca308e87fd7de$export$1c8dedcd7fb2d13c = (x)=>typeof x.response === "object" && typeof x.isAbort === "boolean" && typeof x.url === "string" && typeof x.status === "number";
const $3e9ca308e87fd7de$export$6fba81d1fad7cbc8 = (e)=>({
        message: e.message,
        statusCode: e.status,
        errors: Object.keys(e.response.data).reduce((acc, next)=>({
                ...acc,
                [next]: e.response.data[next].message
            }), {})
    });
const $3e9ca308e87fd7de$var$isConditionalFilter = (filter)=>filter.operator === "and" || filter.operator === "or";
const $3e9ca308e87fd7de$export$78d9b3e650ad534 = (filters, joinOperator = "and", pos = 0)=>filters.map((filter, i)=>$3e9ca308e87fd7de$var$isConditionalFilter(filter) ? `(${$3e9ca308e87fd7de$export$78d9b3e650ad534(filter.value, filter.operator, i)})` : `${filter.field} ${$3e9ca308e87fd7de$var$OPERATOR_MAP[filter.operator]} {:${filter.field}${pos}${i}}`).join(` ${$3e9ca308e87fd7de$var$OPERATOR_MAP[joinOperator]} `);
const $3e9ca308e87fd7de$export$4165c49e0e7fdc76 = (filters, pos = 0)=>filters.reduce((acc, filter, i)=>({
            ...acc,
            ...$3e9ca308e87fd7de$var$isConditionalFilter(filter) ? $3e9ca308e87fd7de$export$4165c49e0e7fdc76(filter.value, i) : {
                [filter.field + pos + i]: filter.value
            }
        }), {});


const $e3c1a31094ec9f2b$var$defaultOptions = {
    collection: "users",
    requestVerification: false
};
const $e3c1a31094ec9f2b$var$isLoginWithProvider = (x)=>typeof x.providerName === "string";
const $e3c1a31094ec9f2b$export$e8bf4fc9c69db7dc = (pb, authOptions)=>{
    const options = {
        ...$e3c1a31094ec9f2b$var$defaultOptions,
        ...authOptions
    };
    return {
        register: async ({ email: email, password: password })=>{
            try {
                await pb.collection(options.collection).create({
                    email: email,
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
                    error: (0, $3e9ca308e87fd7de$export$1c8dedcd7fb2d13c)(err) ? (0, $3e9ca308e87fd7de$export$6fba81d1fad7cbc8)(err) : undefined,
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
                    error: (0, $3e9ca308e87fd7de$export$1c8dedcd7fb2d13c)(err) ? (0, $3e9ca308e87fd7de$export$6fba81d1fad7cbc8)(err) : undefined,
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
                    error: (0, $3e9ca308e87fd7de$export$1c8dedcd7fb2d13c)(err) ? (0, $3e9ca308e87fd7de$export$6fba81d1fad7cbc8)(err) : undefined,
                    redirectTo: options.updatePasswordErrorRedirectTo
                };
            }
        },
        login: async (loginOptions)=>{
            try {
                if ($e3c1a31094ec9f2b$var$isLoginWithProvider(loginOptions)) {
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
                    error: (0, $3e9ca308e87fd7de$export$1c8dedcd7fb2d13c)(err) ? (0, $3e9ca308e87fd7de$export$6fba81d1fad7cbc8)(err) : undefined,
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


var $c608bc8a4f7f3176$exports = {};

$parcel$export($c608bc8a4f7f3176$exports, "dataProvider", () => $c608bc8a4f7f3176$export$dabd5b4fbec78fc8);

const $c608bc8a4f7f3176$export$dabd5b4fbec78fc8 = (pb)=>({
        getList: async ({ resource: resource, pagination: pagination, filters: filters, sorters: sorters })=>{
            const { current: current = 1, pageSize: pageSize = 10, mode: mode = "server" } = pagination ?? {};
            const sort = sorters?.map((s)=>`${s.order === "desc" ? "-" : ""}${s.field}`).join(",");
            const filter = filters ? pb.filter((0, $3e9ca308e87fd7de$export$78d9b3e650ad534)(filters), (0, $3e9ca308e87fd7de$export$4165c49e0e7fdc76)(filters)) : undefined;
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
                if ((0, $3e9ca308e87fd7de$export$1c8dedcd7fb2d13c)(e)) throw (0, $3e9ca308e87fd7de$export$6fba81d1fad7cbc8)(e);
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
                if ((0, $3e9ca308e87fd7de$export$1c8dedcd7fb2d13c)(e)) throw (0, $3e9ca308e87fd7de$export$6fba81d1fad7cbc8)(e);
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
                if ((0, $3e9ca308e87fd7de$export$1c8dedcd7fb2d13c)(e)) throw (0, $3e9ca308e87fd7de$export$6fba81d1fad7cbc8)(e);
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
                if ((0, $3e9ca308e87fd7de$export$1c8dedcd7fb2d13c)(e)) throw (0, $3e9ca308e87fd7de$export$6fba81d1fad7cbc8)(e);
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
                if ((0, $3e9ca308e87fd7de$export$1c8dedcd7fb2d13c)(e)) throw (0, $3e9ca308e87fd7de$export$6fba81d1fad7cbc8)(e);
                throw e;
            }
        },
        getApiUrl: ()=>{
            return pb.baseUrl;
        }
    });


var $80f89c2d670b8894$exports = {};

$parcel$export($80f89c2d670b8894$exports, "liveProvider", () => $80f89c2d670b8894$export$f3d5cfaf6cdab48e);
const $80f89c2d670b8894$export$f3d5cfaf6cdab48e = (pb)=>({
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




export {$e3c1a31094ec9f2b$export$e8bf4fc9c69db7dc as authProvider, $c608bc8a4f7f3176$export$dabd5b4fbec78fc8 as dataProvider, $80f89c2d670b8894$export$f3d5cfaf6cdab48e as liveProvider};
//# sourceMappingURL=index.mjs.map
