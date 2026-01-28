/**
 * contexts/index.ts - Central exports for contexts
 * Automatically switches between Demo and Production modes
 */

// Demo Mode flag - set to false for production
const DEMO_MODE = true;

// Re-export based on mode
export { useAuth } from './DemoAuthContext';
export { useHub } from './DemoHubContext';

// For components that need the provider directly
export { DemoAuthProvider as AuthProvider } from './DemoAuthContext';
export { DemoHubProvider as HubProvider } from './DemoHubContext';
