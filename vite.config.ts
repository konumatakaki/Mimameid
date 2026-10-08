import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  // 相対パスにして、GitHub Pages のサブパス（/Mimameid/）でもそのまま動くようにする
  base: "./",
  plugins: [svelte()],
});
