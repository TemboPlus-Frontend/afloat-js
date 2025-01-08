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

### Type Compatibility Between JSR and NPM Environments

When using this package alongside `@temboplus/tembo-core` in an npm environment, you may encounter type compatibility issues due to different import paths between JSR and npm environments.

#### The Problem

In the JSR (Deno) environment, types are imported as:
```typescript
import type { PhoneNumber } from "@temboplus/tembo-core"
```

While in the npm environment, the same types are imported as:
```typescript
import type { PhoneNumber } from "@jsr/temboplus__tembo-core"
```

This difference in import paths can cause TypeScript to treat identical types as incompatible.

#### Solution

To ensure type compatibility, we recommend using consistent npm-style imports in both environments:

1. In your npm project's `package.json`:
```json
{
  "dependencies": {
    "@temboplus/tembo-core": "npm:@jsr/temboplus__tembo-core@^version",
    "@temboplus/afloat": "npm:@jsr/temboplus__afloat@^version"
  }
}
```

2. Then use the imports consistently:
```typescript
// This will work in both Deno and npm environments
import type { PhoneNumber } from "@jsr/temboplus__tembo-core"
```

This approach ensures that types are resolved from the same source regardless of the environment.

#### Why This Is Necessary

Without consistent import paths, TypeScript will treat types from `@temboplus/tembo-core` and `@jsr/temboplus__tembo-core` as distinct types, even though they are structurally identical. This can cause type errors when passing objects between functions from different packages.

---

#### Looking Ahead

These issues are related to unresolved issues in Deno:
- Import path transformation: [denoland/deno#24076](https://github.com/denoland/deno/issues/24076)
- Type compatibility between JSR and npm packages: Being tracked for future improvements

Once these issues are addressed, future versions of this package will no longer require such manual corrections.

---