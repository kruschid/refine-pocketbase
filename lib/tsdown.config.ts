import { defineConfig } from "tsdown";
import packagejson from "./package.json" with { type: "json" };

export default defineConfig({
  entry: ["./src/index.ts"],
  dts: true,
  platform: "browser",
  treeshake: true,
  external: [...Object.keys(packagejson.devDependencies)],
});
