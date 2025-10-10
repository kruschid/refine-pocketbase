import { defineConfig } from "tsdown";
import packagejson from "./package.json" with { type: "json" };

export default defineConfig({
  entry: ["./src/index.ts"],
  dts: true,
  platform: "browser",
  treeshake: true,
  format: ["cjs" , "esm"],
  exports: true, // automatically infer and generate the exports, main, module, and types fields in package.json
  external: [...Object.keys(packagejson.devDependencies)],
});
