// Reexport the native module. On web, it will be resolved to DataWedgeModule.web.ts
// and on native platforms to DataWedgeModule.ts
export { default } from "./datawedge-module";
export * from "./datawedge-module.types";
