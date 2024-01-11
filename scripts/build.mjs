import path from "path";
import esbuild from "esbuild";
import url from "url";

import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import cssModulesPlugin from "esbuild-css-modules-plugin";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const hasWatch = process.argv.some((v) => v === "--watch");

let start = {
  node: new Date().getTime(),
  browser: new Date().getTime(),
};

let end = {
  node: new Date().getTime(),
  browser: new Date().getTime(),
};

const browserBuildConfig = {
  entryPoints: [path.join(__dirname, "../lib/index.js")],
  bundle: true,
  outfile: path.join(__dirname, "../dist/browser/index.js"),
  format: "iife",
  globalName: "PowerCord",
  sourcemap: false,
  target: "es2018",
  logLevel: "info",
  legalComments: "none",
  minify: true,
  platform: "browser",
  define: {
    "process.env.NODE_ENV": `process.env.NODE_ENV`,
    "process.env.NODE_STAGE": `process.env.NODE_ENV`,
  },
  mainFields: ["browser", "module", "main"],
  conditions: ["browser", "default"],
  plugins: [
    {
      name: "time-tracker",
      setup(build) {
        build.onStart(() => {
          start.browser = new Date().getTime();
        });
        build.onEnd((result) => {
          end.browser = new Date().getTime();
          console.log(
            `✅ Build for 'browser' took ${end.browser - start.browser}ms.`
          );
        });
      },
    },
    NodeModulesPolyfillPlugin(),
    cssModulesPlugin({ inject: true }),
  ],
  sourceRoot: "./",
};

if (hasWatch) {
  const browserContext = await esbuild.context(browserBuildConfig);
  await browserContext.watch();
} else {
  await esbuild.build(browserBuildConfig);
}
