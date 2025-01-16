// ex. scripts/build_npm.ts
import { build, emptyDir } from "@deno/dnt";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  importMap: "deno.json",
  // typeCheck: false,
  shims: {
    deno: true,
  },
  package: {
    name: "@temboplus/afloat",
    version: Deno.args[0],
    private: false,
    description: "A JavaScript/TypeScript package providing common utilities and logic shared across all Temboplus-Afloat Projects",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/TemboPlus-Frontend/afloat-js",
    },
    bugs: {
      url: "https://github.com/TemboPlus-Frontend/afloat-js/issues",
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
