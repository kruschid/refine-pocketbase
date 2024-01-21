# refine-pocketbase

- [x] auth provider
  - [x] login with password
  - [x] login with provider
  - [ ] forgot/reset password
  - [ ] register
- [x] data provider
  - [x] filters
  - [x] sorters
  - [x] server side pagination 
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
import { authProvider, dataProvider, liveProvider, AuthOptions } from "refine-pocketbase";

const pb = new PocketBase(API_URL);

const options: AuthOptions = {
  loginRedirectTo: "/",
  loginErrorRedirectTo: "/login",
  logoutRedirectTo: "/login",
  unauthenticatedRedirectTo: "/login",
}

<Refine
  authProvider={authProvider(pb, options)}
  dataProvider={dataProvider(pb)}
  liveProvider={liveProvider(pb)}
  ...
>
  ...
</Refine>
```
