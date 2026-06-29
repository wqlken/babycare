import { globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  globalIgnores([
    ".next/**",
    ".worktrees/**",
    "build/**",
    "dist/**",
    "node_modules/**",
  ]),
  ...nextVitals,
  ...nextTypescript,
];

export default eslintConfig;
