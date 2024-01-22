# refine-pocketbase

[Pocketbase](https://pocketbase.io/) providers for [Refine](https://refine.dev/).

## features

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

## installation

``` sh
yarn add refine-pocketbase
# or
npm install reifne-pocketbase
```

## basic usage

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

## contribute

- leave a star
- report a bug
- open a pull request
- help others
- [buy me a coffee ☕](https://www.buymeacoffee.com/kruschid)