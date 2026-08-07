// APP_VERSION is stamped in the dist copy at deploy time by
// .github/workflows/sync-to-hub.yml (sed, "Stamp version" step): MAJOR.MINOR comes
// from package.json, PATCH is the commit count since that version line last changed,
// so each deploy increments and a minor/major bump in package.json resets it to .0.
// Keep this on ONE line, exact shape `export const APP_VERSION = '...'`, so that
// step's sed pattern still matches. The value below is only the local/dev default.
export const APP_VERSION = '1.1.0';
