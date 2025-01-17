**Publishing @temboplus/afloat to npm (Developed with Deno)**

This package is built using Deno. Here's a simplified guide for uploading it to npm:

**Steps:**

1. **Build the npm Package:**

   - Navigate to your project's root directory.
   - Run the following command, replacing `0.1.0` with your desired version number:

     ```bash
     deno run -A scripts/build_npm.ts 0.1.0
     ```

2. **Publish to npm:**

   - Navigate to the `npm` directory:

     ```bash
     cd npm
     ```

   - Publish the package to npm using:

     ```bash
     npm publish --access=public
     ```

   - Make sure you're logged in to npm before running this command (`npm login`).
   - The `--access=public` flag ensures your package is publicly available.

**Additional Resources:**

- For detailed Deno bundling instructions, refer to the Deno bundler documentation: [https://github.com/denoland/dnt](https://github.com/denoland/dnt)
