const { esbuildSpikeStatementsApi } = require("@spike/api-statements");

// process.argv[2]: prod | dev | watch
const buildType = process.argv[2];

const outfile = "./src/server/public/dist/app.js";

const buildLogger = {
  name: "buildLogger",
  setup(build) {
    build.onEnd((result) => {
      if (result.warnings.length) {
        console.warn(result.warnings.join("\n"));
      }
      if (result.errors.length) {
        console.error(result.errors.join("\n"));
      }
      if (!result.warnings.length && !result.errors.length) {
        console.log("wrote:", outfile);
      }
    });
  },
};

require("esbuild")
  .build({
    entryPoints: ["./src/ux/app.ts"],
    platform: "browser",
    bundle: true,
    watch: buildType === "watch",
    minify: buildType === "prod",
    sourcemap: "external",
    outfile,
    plugins: [buildLogger, esbuildSpikeStatementsApi(false)],
  })
  .catch(() => process.exit(1));
