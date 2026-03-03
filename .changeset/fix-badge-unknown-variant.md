---
"@cloudflare/kumo": patch
---

fix(badge): prevent crash when unknown variant is passed

Add defensive fallback to primary variant when an unrecognized variant string is provided to Badge component. This prevents "Cannot read properties of undefined (reading 'classes')" errors when consumers use a variant that doesn't exist in their installed version.
