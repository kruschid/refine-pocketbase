# refine-pocketbase
![pb](https://github.com/necatiozmen/refine-pocketbase/assets/18739364/4c5e6c43-42f3-4d7f-88c2-74970144308b)

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
npm install refine-pocketbase
```

## Basic Usage

``` tsx
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

## Auth Provider Options

``` ts
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

## Tasks: PRs Welcome!

- [x] happy path test specs
  - [x] `authProvider`
  - [x] `dataProvider` (except for `deleteOne`)
  - [x] `liveProvider`
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

## Contribute

- leave a star
- report a bug
- open a pull request
- help others
- [buy me a coffee ☕](https://www.buymeacoffee.com/kruschid)

<a href="https://www.buymeacoffee.com/kruschid" target="_blank"><img width="200px" src="https://cdn.buymeacoffee.com/buttons/v2/default-orange.png" alt="Buy Me A Coffee" ></a>
