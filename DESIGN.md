# Design System: CoffeeLink Agri-OS 2
**Project ID:** Local-Project

## 1. Visual Theme & Atmosphere
The design language evokes a "Cyber-Agritech" aesthetic, merging the organic nature of agriculture with high-tech precision. The mood is **Premium Dark Mode**, characterized by deep, forest-green-tinted blacks and vibrant, neon-like accents. It feels **Futuristic**, **Secure**, and **Professional**. The interface uses high contrast to ensure readability in outdoor farm settings while maintaining a sleek, modern app feel.

## 2. Color Palette & Roles
*   **Neon Agri-Green (#00FF94):** Used for primary actions, success states, verified badges, and key data highlights. It represents healthy crops and trusted status.
*   **Deep Forest Black (#0A1F1C):** Used as the top gradient color for card backgrounds, providing a subtle organic tint to the dark theme.
*   **Pure Void Black (#000000):** Used as the bottom provisional background and structural depth.
*   **Alert Amber (#F59E0B):** Used for warnings, "Self-Declared" statuses, and attention-grabbing borders.
*   **Button Gradient Start (#00FF94) to End (#00CC77):** A subtle gradient used on primary buttons to create depth.
*   **Text White (#FFFFFF):** Primary text color for maximum contrast.
*   **Text Muted (#FFFFFF60 / opacity 0.6):** Secondary text, labels, and descriptions.

## 3. Typography Rules
*   **Font Family:** Sans-serif (likely Inter or Outfit), clean and geometric.
*   **Weights:**
    *   **Black (900):** Used heavily for key metrics (e.g., "Verified", "12.5 Ha"), creating a strong, impactful hierarchy.
    *   **Bold (700):** Used for buttons and clickable elements.
    *   **Regular/Medium:** Used for body text and descriptive labels.
*   **Styling:** Uppercase text is frequently used for status badges (e.g., "EUDR VERIFIED") to denote authority.

## 4. Component Stylings
*   **Buttons:**
    *   **Shape:** Softly rounded corners (`rounded-xl`).
    *   **Style:** High-gloss gradient fills (Green-to-Darker-Green) with black text for high readability.
    *   **Effects:** Subtle glow shadows (`box-shadow: 0 0 20px rgba(0, 255, 148, 0.4)`) to make actions "pop" against the dark background.
    *   **Interaction:** Scale up slightly on hover (`hover:scale-[1.02]`).

*   **Cards/Containers:**
    *   **Shape:** Generously rounded corners (`rounded-2xl`).
    *   **Background:** Vertical linear gradient from Deep Forest Black to Pure Black.
    *   **Borders:** Status-dependent colored borders (e.g., 2px solid Neon Green or Amber).
    *   **Shadows:** Colored glow shadows matching the border (`0 0 30px`), creating a "holographic" or "lit-from-within" look.

*   **Badges/Tags:**
    *   **Shape:** rounded-lg.
    *   **Style:** Glassmorphism effect (`backdrop-blur-md`) with low-opacity colored backgrounds (`bg-[#00FF94]/20`) and thin borders.

## 5. Layout Principles
*   **Spacing:** "Mobile-First" approach with safe-area handling (`calc(100vh - safe-area)`).
*   **Whitespace:** Comfortable padding (`p-5` inside cards) to prevent data density from feeling cluttered.
*   **Motion:** Smooth entry animations (`slideUp`, `slideInRight`, `fadeIn`) give the interface a fluid, app-like feel.
*   **Depth:** Heavy use of layering—background images with overlays (`rgba(0,0,0,0.8)`), cards floating on top of the main background, and badges floating above card images.
