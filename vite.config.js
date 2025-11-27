// This Vite config tells Rollup (production bundler) to treat multiple HTML files 
// as entry points so each becomes its own built page.

import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                index: resolve(__dirname, "index.html"),
                login: resolve(__dirname, "Login.html"),
                signUp: resolve(__dirname, "Signup.html"),
                translator: resolve(__dirname, "translator.html"),
            }
        }
    }
});
