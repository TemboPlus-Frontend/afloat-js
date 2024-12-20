# @temboplus/afloat

---

### Handling Incorrect `npm:` Imports in NPM Dependency Managers

> **Directory**: `src/npm`

When this package is imported into an npm-based dependency manager, such as a project using Node.js or an npm build tool, Deno's npm integration may cause dependency specifiers to be transformed incorrectly. Specifically, imports such as:  

```typescript
import { initContract } from "npm:@ts-rest/core^3.51.0";
```

are generated instead of the expected standard npm format:  

```typescript
import { initContract } from "@ts-rest/core";
```

#### The Problem

This issue occurs because when a Deno package containing npm dependencies is published to JSR, Deno's `npm:` specifier is retained. However, npm-based tools do not recognize the `npm:` prefix or the specific Deno-version syntax (e.g., `^3.51.0` within the specifier).

This results in a breaking import path that requires manual intervention to function correctly.

#### Manual Correction

After importing the package into an npm-based dependency manager, you must manually edit all transformed imports. Specifically:

1. **Locate Invalid Imports:**  
   Search for any import paths beginning with the `npm:` prefix, such as:  
   ```typescript
   import { initContract } from "npm:@ts-rest/core^3.51.0";
   ```

2. **Replace with Correct Specifier:**  
   Change the import to the standard npm-compatible format:
   ```typescript
   import { initContract } from "@ts-rest/core";
   ```

3. **Repeat As Needed:**  
   Repeat this process for all incorrectly transformed `npm:` imports within your project.

#### Why This Is Necessary

Without correcting the import paths, npm dependency managers and tools cannot resolve the dependencies, leading to runtime or build-time errors. This workaround ensures your project can function as intended until the upstream issue is resolved.

#### Looking Ahead

This problem is related to an unresolved issue in Deno: [denoland/deno#24076](https://github.com/denoland/deno/issues/24076). Once this issue is addressed, future versions of this package will no longer require such manual corrections.

---
