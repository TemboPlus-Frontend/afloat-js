# @temboplus/afloat

**A foundational library for Temboplus-Afloat projects.**

This JavaScript/TypeScript package provides a central hub for shared utilities, logic, and data access mechanisms within the Temboplus-Afloat ecosystem. 

## Key Features

* **Abstracted Server Communication**
    * Simplifies front-end development by abstracting all interactions with the server behind model-specific repositories
    * Consuming projects only need to interact with these repositories, decoupling them from the underlying API implementation

* **Shared Utilities**
    * Provides a collection of reusable helper functions for common tasks across Afloat projects, such as error handling

* **Data Models**
    * Defines standardized data structures and interfaces for consistent data representation throughout the Afloat ecosystem

* **Enhanced Maintainability**
    * Centralizes common logic, making it easier to maintain and update across all consuming projects
    * Reduces code duplication and improves consistency

* **Cross-Environment Compatibility**
    * Works seamlessly in both client-side and server-side environments
    * Supports both synchronous and asynchronous initialization patterns

## Usage

### Authentication Setup

#### Client-Side Usage

In client-side applications, authentication is initialized synchronously:

```typescript
import { AfloatAuth } from "@temboplus/afloat";

// Initialize client auth (typically in your app entry point)
const auth = AfloatAuth.instance;

// Check if user is authenticated
console.log("User authenticated:", !!auth.currentUser);

// Access current user
const user = auth.currentUser;
if (user) {
  console.log(`Logged in as: ${user.email}`);
}
```

#### Server-Side Usage

In server-side environments, authentication requires asynchronous initialization:

```typescript
import { AfloatAuth } from "@temboplus/afloat";

// In a server route handler or similar context
async function handleRequest(req, res) {
  try {
    // Extract token from request
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Initialize server-side auth
    const auth = await AfloatAuth.initializeServer(token);
    
    // Now you can use auth for permission checks
    const isAdmin = auth.checkPermission(Permissions.Payout.View);
    
    // Continue with your handler logic...
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
```

### Using Repositories

Repositories provide a consistent interface for data operations across environments.

#### Client-Side Repository Usage

```typescript
import { WalletRepo } from "@temboplus/afloat";

// Create repository - auth is automatically handled
const walletRepo = new WalletRepo();

// Use repository methods
async function displayBalance() {
  try {
    const balance = await walletRepo.getBalance();
    console.log(`Current balance: ${balance}`);
  } catch (error) {
    console.error('Error fetching balance:', error);
  }
}
```

#### Server-Side Repository Usage

```typescript
import { AfloatAuth, WalletRepo } from "@temboplus/afloat";

async function processServerRequest(token) {
  // Initialize auth for this request
  const auth = await AfloatAuth.initializeServer(token);
  
  // Create repository with explicit auth instance
  const walletRepo = new WalletRepo({ auth });
  
  // Use repository methods
  const balance = await walletRepo.getBalance();
  const wallets = await walletRepo.getWallets();
  
  return { balance, wallets };
}
```

## Best Practices

1. **Client-Side Applications**
   - Initialize `AfloatAuth.instance` early in your application lifecycle
   - Create repositories without explicit auth parameters
   - Handle permission errors appropriately in your UI

2. **Server-Side Applications**
   - Always use `await AfloatAuth.initializeServer(token)` for each request
   - Pass the auth instance explicitly to repositories
   - Implement proper error handling for authentication failures

3. **Testing**
   - Use the `AuthContext` to inject mock auth instances during testing
   - Reset `AuthContext.current` after each test to prevent test pollution