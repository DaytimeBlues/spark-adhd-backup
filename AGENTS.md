# Project Standards

## 🧠 Design Brain: Aesthetic & UX Rules

*Stop guessing. Follow these rules for all UI changes.*

### 1. Aesthetic Principles (Material 3 + Glassmorphism)

- **Visual Style**: "Premium Calm". Use soft gradients, translucent backgrounds, and vibrant accent colors.
- **Glassmorphism**: Use `backdrop-filter: blur(12px)` and `rgba(255, 255, 255, 0.05)` for cards and overlays.
- **Borders**: Subtle 1px borders `rgba(255, 255, 255, 0.1)` to define edges without harsh lines.
- **Shadows**: Soft, multi-layered shadows for depth. Avoid harsh black shadows.
- **Typography**:
  - Headings: Bold, Tracking Tight (-0.5px).
  - Body: Readable, airy line-height (1.5).
  - Use `AppText` variants consistently.

### 2. Interaction Design (Fitts's Law)

- **Touch Targets**: Minimum 44x44dp for all interactive elements.
- **Placement**: Primary actions (FABs, Confirm buttons) must be within easy thumb reach (bottom right or bottom center).
- **Feedback**: All interactions must have visual feedback (scale down on press, ripple, or color shift).

### 3. Layout & Responsiveness

- **Grid System**: Use an 8pt grid. Spacing should be multiples of 8 (8, 16, 24, 32).
- **Web Adaptation**: On large screens (>768px), Grid layouts should expand to 3 or 4 columns. Max-width containers (1200px) to prevent distinct "mobile stretched" look.

### 4. Component Rules

- **Buttons**: Rounded pills (`borderRadius: 100`) for primary actions. Rounded corners (`8px` to `16px`) for cards.
- **Icons**: Use `MaterialCommunityIcons`. Ensure consistent stroke width and visual weight.
- **Colors**:
  - Background: Deep Dark (`#1a1a2e` - existing).
  - Surface: Translucent Dark.
  - Primary: Vibrant Purple/Blue (`#A06EE1`).
  - Accents: Use the "Spark" palette (Fire Red, Teal, Orange) for semantic meaning.

### 5. Engineering Standards

- **Refactoring**: When "beautifying", don't just change styles. Refactor into smaller, focused components if file grows > 200 lines.
- **React Native Web**: Always verify `Platform.OS === 'web'` specific styles (e.g., `cursor: pointer`, `backdropFilter`).
