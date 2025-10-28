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

### Passwordless Auth with OTP

For [passwordless authentication](https://pocketbase.io/docs/authentication/#authenticate-with-otp) using a one-time password (OTP), the process consists of two steps.

In the first step, an OTP needs to be requested. To do this, make a `login` call without providing a password. This will send the OTP to the user via email. Currently, this only works if the user is already registered.

After that, the user needs to enter the OTP received in the email. This OTP must then be passed to the `otpHandle.resolve` method within the same session. Note that refreshing the page or navigating to another page will reset the state, requiring the process to be restarted from the beginning.

```ts
import { type LoginArgs, useOtp } from "refine-pocketbase";

const { mutate: login } = useLogin<LoginArgs>();
const otpHandler = useOtp();

// 1. login without password requests an otp
login({
  email: "user@example.com",
  otpHandler,
});

// 2. OTP request needs to be resolved in the same session 
otpHandler.resolve("your-otp");
```

A full example is available in [`demo/src/pages/LoginPage.tsx`](demo/src/pages/LoginPage.tsx).

> [!NOTE]
> To enable OTP functionality, configure PocketBase to send one-time passwords.

### MFA with Password and OTP

MFA with a password and OTP is similar to passwordless authentication. The only difference is that MFA requires a password. See the previous section for more details.

```ts
// 1. requests an otp
login({
  email: "user@example.com",
  password: "1234567890", // 
  otpHandler,
});

// 2. enter otp 
otpHandler.resolve("your-otp");
```

A full example is available in [`demo/src/pages/LoginPage.tsx`](demo/src/pages/LoginPage.tsx).

> [!NOTE]
> To enable MFA functionality, configure PocketBase to send one-time passwords and enable multi-factor authentication.

### Translations

If you want to use translation, pass the `translate` function returned by [`useTranslate`](https://refine.dev/docs/guides-concepts/general-concepts/#hooks-4) to the corresponding adapter calls (`login` in this case).

``` ts
const { mutate: login } = useLogin<LoginArgs>();
const translate = useTranslate();

login({
  email,
  password,
  translate, // <~ pass on the translate function here
});
```

Please expand the following section to view the corresponding translation keys for your custom translation texts.

<details>
  <summary>Register</summary>

  | `key`                                                  | `defaultMessage`                                                              | `type`    |
  | ------------------------------------------------------ | ----------------------------------------------------------------------------- | --------- |
  | `authProvider.register.requestVerificationMessage`     | Account verification                                                          | `success` |
  | `authProvider.register.requestVerificationDescription` | Please verify your account by clicking the link we sent to your email address | `success` |
  | `authProvider.register.completedMessage`               | Registration completed                                                        | `success` |
  | `authProvider.register.completedDescription`           | Please sign in using your credentials                                         | `success` |
  | `authProvider.register.errorName`                      | Registration failed                                                           | `error`   |
  | `authProvider.register.errorMessage`                   | Something went wrong while creating your account. Please try again.           | `error`   |
</details>

<details>
  <summary>Password Forgot</summary>

  | `key`                                            | `defaultMessage`                                                                                  | `type`    |
  | ------------------------------------------------ | ------------------------------------------------------------------------------------------------- | --------- |
  | `authProvider.forgotPassword.successMessage`     | Password reset link sent                                                                          | `success` |
  | `authProvider.forgotPassword.successDescription` | Check your email for instructions to reset your password.                                         | `success` |
  | `authProvider.forgotPassword.errorMessage`       | Password reset email not sent                                                                     | `error`   |
  | `authProvider.forgotPassword.errorDescription`   | Something went wrong while sending the reset link. Please check your email address and try again. | `error`   |
</details>

<details>
  <summary>Login</summary>

  | `key`                                        | `defaultMessage`                                                                 | `type`    |
  | -------------------------------------------- | -------------------------------------------------------------------------------- | --------- |
  | `authProvider.login.successMessage`          | Login successful                                                                 | `success` |
  | `authProvider.login.successDescription`      | You're now signed in and ready to go.                                            | `success` |
  | `authProvider.login.errorName`               | Something went wrong                                                             | `error`   |
  | `authProvider.login.errorMessage`            | We couldn’t complete your request. Please refresh or try again later.            | `error`   |
  | `authProvider.login.unsupportedLoginName`    | Unsupported login                                                                | `error`   |
  | `authProvider.login.unsupportedLoginMessage` | This authentication method isn’t available. Try another way to sign in.          | `error`   |
  | `authProvider.login.otpCanceled`             | Verification canceled                                                            | `error`   |
  | `authProvider.login.otpCanceledMessage`      | You stopped entering the code. Try again when you’re ready.                      | `error`   |
  | `authProvider.login.otpInvalid`              | Invalid verification code                                                        | `error`   |
  | `authProvider.login.otpInvalidMessage`       | The code you entered is invalid or has expired. Request a new one and try again. | `error`   |
  | `authProvider.login.mfaError`                | Verification failed                                                              | `error`   |
  | `authProvider.login.mfaErrorMessage`         | Multi-factor authentication was not completed successfully. Please try again.    | `error`   |
  | `authProvider.login.credentialsError`        | Invalid credentials                                                              | `error`   |
  | `authProvider.login.credentialsErrorMessage` | The email or password you entered is incorrect. Please try again.                | `error`   |
</details>

<details>
  <summary>Update Password</summary>

  | `key`                                            | `defaultMessage`                                                           | `type`    |
  | ------------------------------------------------ | -------------------------------------------------------------------------- | --------- |
  | `authProvider.updatePassword.successMessage`     | Password updated                                                           | `success` |
  | `authProvider.updatePassword.successDescription` | Your password has been changed successfully.                               | `success` |
  | `authProvider.updatePassword.errorMessage`       | Password update failed                                                     | `error`   |
  | `authProvider.updatePassword.errorDescription`   | Something went wrong while updating your password. Please try again later. | `error`   |
</details>

### Avatar URL

The [`useGetIdentity`](https://refine.dev/docs/authentication/hooks/use-get-identity/) hook returns a user object that includes an avatar thumbnail URL.

```ts
import { useGetIdentity } from "@refinedev/core";

const { data: identity } = useGetIdentity();

identity.avatar; // ~> http://127.0.0.1:8090/api/files/example/kfzjt5oy8r34hvn/test_52iWbGinWd.png?thumb=100x100
```

By default, the avatar thumbnail size is **100x100 pixels**.
You can customize this by setting the `identityAvatarThumb` option in `authOptions` when creating the `authProvider`:

```ts
const authOptions: AuthOptions = {
  identityAvatarThumb: "128x128",
};

authProvider(pb, authOptions);
```

Avatar URLs follow [PocketBase’s file URL handling](https://pocketbase.io/docs/files-handling/#file-url), since this library uses the PocketBase SDK internally.


## Features

- [x] auth provider
  - [x] register
  - [x] register & verify
  - [x] login with password
  - [x] login with provider
  - [x] login with OTP (passwordless)
  - [x] login with MFA (password & OTP)
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

## Roadmap: PRs Welcome!

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
  - [x] `login`
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
