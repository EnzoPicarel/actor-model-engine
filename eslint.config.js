import globals from "globals";
import eslint from '@eslint/js';
import tseslint from "typescript-eslint";

const languageOptions = tseslint.configs.recommended[0].languageOptions;
languageOptions.globals = {
    ...globals.jest,
    ...globals.node,
};
const plugins = tseslint.configs.recommended[0].plugins;

export default [
    {
        languageOptions: languageOptions,
        plugins: plugins,
        files: ['src/**/*.ts', 'test/**/*.ts'],
        rules: {
            "array-callback-return": "error",
            "consistent-return": "error",
            "eqeqeq": "error",
            "no-eval": "error",
            "no-fallthrough": "error",
            "no-inner-declarations": "warn",
            "no-mixed-spaces-and-tabs": "error",
            "no-undef": "error",
            "no-unreachable": "error",
            "no-unused-vars": "off",
            "no-var": "error",
            "prefer-const": "error",
            "semi": "error",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-inferrable-types": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
];