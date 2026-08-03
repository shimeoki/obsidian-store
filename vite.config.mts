import { defineConfig } from "vite"
import { resolve } from "path"

export default defineConfig({
    resolve: {
        alias: { "@": resolve(import.meta.dirname, "src") },
    },

    build: {
        outDir: ".",
        emptyOutDir: false,

        lib: {
            entry: resolve(import.meta.dirname, "src/main.ts"),
            formats: ["cjs"],
            fileName: "main",
        },

        rollupOptions: {
            external: ["obsidian"],
        },
    },
})
