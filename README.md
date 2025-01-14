# @temboplus/afloat

## NPM Integration Guide

This guide explains how to effectively use `@temboplus/afloat` in NPM projects and handle potential compatibility challenges.

### Package Dependencies and NPM Usage

This package is designed to work seamlessly with `@temboplus/tembo-core`. To avoid dependency conflicts and type compatibility issues, we recommend:

1. Only installing `@temboplus/afloat` in your NPM project
2. Not manually installing `@temboplus/tembo-core`, as its functionality is re-exported through `@temboplus/afloat`

```json
{
  "dependencies": {
    "@temboplus/afloat": "^1.0.0"
    // Don't install @temboplus/tembo-core directly
  }
}
```

### Import Guidelines

#### ✅ Correct Usage
```typescript
// Import everything from @temboplus/afloat
import { PhoneNumber, /* other types and functions */ } from "@temboplus/afloat";
```

#### ❌ Avoid
```typescript
// Don't import from @temboplus/tembo-core directly
import { PhoneNumber } from "@temboplus/tembo-core";
// Don't use JSR-style imports
import { PhoneNumber } from "@jsr/temboplus__tembo-core";
```

### Technical Details

#### Dependency Management
- `@temboplus/afloat` bundles and re-exports all necessary functionality from `@temboplus/tembo-core`
- This approach prevents version mismatches and type compatibility issues
- No need to manage multiple package versions or worry about import path differences

#### Type Consistency
By consolidating all exports through `@temboplus/afloat`, we ensure:
- Consistent type references across your codebase
- No TypeScript compatibility issues between JSR and NPM environments
- Simplified import statements

### Known Issues and Solutions

#### NPM Import Paths
If you encounter any import path issues:
1. Always use standard NPM import syntax
2. Import all types and functions from `@temboplus/afloat`
3. Don't use `npm:` prefixes in your imports

#### Related Issues
- Import path transformation: [denoland/deno#24076](https://github.com/denoland/deno/issues/24076)
- JSR and NPM compatibility improvements are ongoing

---

This documentation will be updated as new solutions become available.