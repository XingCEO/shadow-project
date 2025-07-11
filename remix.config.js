/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  tailwind: true,
  postcss: true,
  serverBuildPath: "build/index.js",
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",
  devServerPort: 3001,
  serverModuleFormat: "cjs",
};