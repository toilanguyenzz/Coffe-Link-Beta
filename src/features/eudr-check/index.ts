/**
 * EU Chemical Compliance Check (EUDR) Feature Module
 * 
 * Exports all public components, hooks, and types for the chemical
 * scanning and EU export compliance verification feature.
 */

// Types
export * from './types';

// Hooks
export { useChemicalCheck } from './hooks/useChemicalCheck';
export type { StatusConfig } from './hooks/useChemicalCheck';

// Components
export { default as ChemicalResultCard, ChemicalNotFoundCard } from './components/ChemicalResultCard';

// Services
export {
    MOCK_CHEMICALS,
    findChemicalByBarcode,
    getBannedChemicals,
    getWarningChemicals
} from './services/mockChemicals';
