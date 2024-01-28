# refine-pocketbase

[PocketBase](https://pocketbase.io/) providers for [Refine](https://refine.dev/).

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
- [x] live provider
  - [x] subscribe
  - [x] unsubscribe  

## Installation

``` sh
yarn add refine-pocketbase
# or
npm install reifne-pocketbase
```

## Basic Usage

``` tsx
import PocketBase from "pocketbase";
import { authProvider, dataProvider, liveProvider } from "refine-pocketbase";

const pb = new PocketBase(API_URL);

<Refine
  authProvider={authProvider(pb)}
  dataProvider={dataProvider(pb)}
  liveProvider={liveProvider(pb)}
  ...
>
  ...
</Refine>
```

## Contribute

- leave a star
- report a bug
- open a pull request
- help others
- [buy me a coffee ☕](https://www.buymeacoffee.com/kruschid)

<a href="https://www.buymeacoffee.com/kruschid" target="_blank"><img width="200px" src="https://cdn.buymeacoffee.com/buttons/v2/default-orange.png" alt="Buy Me A Coffee" ></a>

## Auth Provider Options

``` ts
interface AuthOptions {
  collection: string;
  requestVerification: boolean;
  registerRedirectTo?: string;
  registerErrorRedirectTo?: string;
  forgotPasswordRedirectTo?: string;
  forgotPasswordErrorRedirectTo?: string;
  updatePasswordRedirectTo?: string;
  updatePasswordErrorRedirectTo?: string;
  loginRedirectTo?: string;
  loginErrorRedirectTo?: string;
  logoutRedirectTo?: string;
  unauthenticatedRedirectTo?: string;
}
```