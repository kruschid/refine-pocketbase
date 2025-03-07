# refine-pocketbase

[![NPM](https://img.shields.io/npm/l/@mantine/core)](https://github.com/kruschid/refine-pocketbase/blob/master/LICENSE)
[![GitHub contributors](https://img.shields.io/github/contributors/kruschid/refine-pocketbase)](https://github.com/kruschid/refine-pocketbase/graphs/contributors)
[![npm](https://img.shields.io/npm/v/refine-pocketbase)](https://www.npmjs.com/package/refine-pocketbase)
[![Discord](https://img.shields.io/badge/Chat%20on-Discord-%235865f2)](https://discord.gg/BCGmvSSJBk)

![pb](https://github.com/necatiozmen/refine-pocketbase/assets/18739364/4c5e6c43-42f3-4d7f-88c2-74970144308b)

[Refine](https://refine.dev/) providers for integrating your frontend application with ease into your [PocketBase](https://pocketbase.io) backend. It implements the three common providers for user authentication, CRUD, and live updates. It's based on the [PocketBase JS SDK](https://github.com/pocketbase/js-sdk) and can also be used in conjunction with [pocketbase-typegen](https://github.com/patmood/pocketbase-typegen) for improved type safety.

## Installation

```sh
npm install refine-pocketbase
```

## Data Provider

### Basic Usage

```tsx
import PocketBase from "pocketbase";
import { authProvider, dataProvider, liveProvider } from "refine-pocketbase";

const pb = new PocketBase(POCKETBASE_URL);

<Refine
  authProvider={authProvider(pb)}
  dataProvider={dataProvider(pb)}
  liveProvider={liveProvider(pb)}
  ...
>
  ...
</Refine>
```

### The Meta Properties `fields` and `expand`

The code below uses `useList` to fetch a list of users. The resulting list contains user records with the `id`, `name`, `avatar` and the name of the organisation a user is assigned to. The meta properties `fields` and `expand` are used to customize the server response to the requirements of the user interface.

```ts
const users = useList({
  resource: "users",
  meta: {
    fields: ["id", "name", "avatar", "expand.org.name"],
    expand: ["org"],
  },
});
```

Here `fields` is an array of strings limiting the fields to return in the server's response. `expand` is an array with names of the related records that will be included in the response. Pocketbase supports up to 6-level depth nested relations expansion. See https://pocketbase.io/docs/api-records for more examples.

A couple of other refine hooks and components like `useOne`, `useTable`, `<Show/>`, `<List/>`, etc. will support the meta props `fields` and `expand` if used with the refine-pocketbase data provider.

### Filtering with `in` and `nin`

The `in` or `nin` filters expect an array as value as show in the code fragment below.

```ts
{
  field: "a",
  operator: "in",
  value: [1, 2, 3],
}
```

This expression will be transformed to a pocketbase filter expression `(a = 1 || a = 2 || a = 3)`.

A similar expression using `nin` filter will be transformed to `b != 1 && b != 2 && b != 3`.

Setting an empty array `[]` as a filter value will cause the `in` or `nin` filter to be excluded from the resulting filter expression.

### Filtering with `between` and `nbetween`

The `between` or `nbetween` filters expect a tuple `[min, max]` as value as show in the code fragment below.

```ts
{
  field: "a",
  operator: "between",
  value: [1, 2],
}
```

This expression will be transformed to a pocketbase filter expression `(a >= 1 && a <= 2)`.

The same expression but with `nin` as the operator will be transformed to `(a < 1 || a > 2)`.

Partial tuples in form of `[min, undefined/null]` or `[undefined/null, max]` are possible as well and would omit either one side of the join operator.

An empty tuple `[]` will cause the filter to be excluded from the resulting filter.

### Custom Endpoints with `useCustom` Hook

The `useCustom` hook allows you to make custom API calls to your PocketBase backend. This is particularly useful when you need to interact with custom PocketBase endpoints.

Here's an example of how to use the `useCustom` hook:

```ts
const apiUrl = useApiUrl();

const { data, isLoading } = useCustom({
  url: `${apiUrl}/api/custom-endpoint`,
  method: "get",
});
```

## Auth Provider

A number of configuration properties are supported by the auth provider, primarily for controlling redirection following specific auth events. Please take a look at the self-explanatory names in the `AuthOptions` typescript interface to find the available options.

```ts
import { authProvider, AuthOptions } from "refine-pocketbase";

const authOptions: AuthOptions = {
  loginRedirectTo: "/dashboard",
};

<Refine
  authProvider={authProvider(pb, authOptions)}
  ...
>
  ...
</Refine>
```

### Auth Collection

`users` is the default auth collection in Pocketbase. Several auth collections can be supported in a single Pocketbase instance. You can use a different collection with the `authProvider` by using the `collection` property:

```ts
const authOptions: AuthOptions = {
  collection: "superusers",
};
```

### OAuth2 Configuration

The PocketBase `OAuth2Config` can be set either via the `mutationVariables` prop in [`AuthPage`](https://refine.dev/docs/authentication/components/auth-page/#mutationvariables),

```ts
<AuthPage
  type="login"
  mutationVariables={{
    scopes: ["user-read-private", "user-top-read"],
  }}
  providers={[
    {
      name: "spotify",
      label: "Login with Spotify",
      icon: <SpotifyIcon />,
    },
  ]}
/>
```

or imperatively via [`useLogin`](https://refine.dev/docs/authentication/hooks/use-login/#usage):

```ts
import { LoginWithProvider } from "refine-pocketbase";

const { mutate: login } = useLogin<LoginWithProvider>();

login({
  scopes: ["user-read-private", "user-top-read"],
  providerName: "spotify",
});
```

For improved type safety, `refine-pocketbase` exports the `LoginWithProvider` type. With this, TypeScript can warn you if a property name or value type is incorrect and provide you with autocompletion for a better developer experience.

### Password-Based Auth Options

For password-based authentication, you can pass an optional `options` property that meets PocketBase's `RecordOptions` interface.

```ts
import { LoginWithPassword } from "refine-pocketbase";

const { mutate: login } = useLogin<LoginWithPassword>();

login({
  email: "user@example.com",
  password: "********",
  options: {
    expand: "orgs,permissions",
    headers: { key: "value" },
    ... // more RecordOptions props
  },
});

// similar scenario but using AuthPage:
<AuthPage
  type="login"
  mutationVariables={{
    email: "user@example.com",
    password: "********",
    options: {
      expand: "orgs,permissions",
      headers: { key: "value" },
      ... // more RecordOptions props
    },
  }}
/>
```

## Features

- [x] auth provider
  - [x] register
  - [x] login with password
  - [x] login with provider
  - [x] forgot password
  - [x] update password
- [x] data provider
  - [x] filters
  - [x] sorters
  - [x] pagination
  - [x] expand
  - [x] filter
- [x] live provider
  - [x] subscribe
  - [x] unsubscribe
- [ ] audit log provider

## Tasks: PRs Welcome!

- [ ] `auditLogProvider` implementation
- [ ] happy path test specs
  - [x] `authProvider`
  - [x] `dataProvider` (except for `deleteOne`)
  - [x] `liveProvider`
  - [ ] `auditLogProvider`
- [ ] test specs for `authProvider` error conditions
  - [x] `register`
  - [x] `forgotPassword`
  - [x] `updatePassword`
  - [ ] `login`
- [ ] test specs for `dataProvider` error conditions
  - [ ] `getList`
  - [ ] `create`
  - [ ] `update`
  - [ ] `getOne`
  - [ ] `deleteOne`
- [ ] test specs for `deleteOne`
- [ ] test specs with `expand`
  - [ ] `getList`
  - [ ] `getOne`
- [ ] test specs with `fields`
  - [ ] `getList`
  - [ ] `getOne`
- [ ] test specs for `auditLogProvider` errors
- [ ] remove all requestKeys to prioritize sdk autoCancellation preference
- [x] Setup Github Actions
  - [x] test environment
  - [x] build & publish

## How to Contribute

- leave a star ⭐
- report a bug 🐞
- open a pull request 🏗️
- help others ❤️
- [buy me a coffee ☕](https://www.buymeacoffee.com/kruschid)

<a href="https://www.buymeacoffee.com/kruschid" target="_blank"><img width="200px" src="https://cdn.buymeacoffee.com/buttons/v2/default-orange.png" alt="Buy Me A Coffee" ></a>

## Refine PocketBase Starter Template

If you're tired of setting up another PocketBase instance, installing frontend dependencies, and building CI/CD pipelines, but would rather start shipping features or prototypes right away, I would be more than happy if you could try the headless [`refine-pocketbase-starter`](https://github.com/kruschid/refine-pocketbase-starter) template. You can choose any UI library you prefer. `refine-pocketbase-starter` also includes a GitHub Actions workflow that builds a Docker image containing both PocketBase and your frontend. For easy self-hosting, the Docker image will be stored in your GitHub container registry (private or public) each time you push a new version tag. However, alternative container registries can also be used. Just follow the instructions in the documentation. If you have further questions, don't hesitate to ask in my [Discord channel](https://discord.gg/BCGmvSSJBk).
