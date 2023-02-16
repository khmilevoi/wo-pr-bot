import del from "rollup-plugin-delete";
import esbuild from "rollup-plugin-esbuild";
import dotenv from "rollup-plugin-dotenv";


export default {
  input: "./src/index.ts",
  output: { file: "./dist/index.js", format: "cjs" },
  plugins: [del({ targets: "dist/*" }), dotenv.default(), esbuild()]
};
