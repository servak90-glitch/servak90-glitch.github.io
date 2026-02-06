    - [ ] Improve progress visualization for the crafting queue.
- [ ] **Redesign `CityView.tsx`**:
    - [ ] Improve readability and interaction for trade and repair.

## Phase 5: Global Polish & Interaction
- [ ] **System-wide Icon Update**: Replace remaining emojis with Lucide-React icons.
- [ ] **Micro-animations**: Add `transition-all` to all buttons and cards.
- [ ] **Final Performance Check**: Ensure all new components use optimized selectors and memoization.
## Phase 6: Game Balance & Refinement (Feedback Integration)

### [x] Centralizing Mass Calculation
- [x] **Refactor `mathEngine.ts`**: Use robust ID parsing and centralized formulas.
- [x] **Prioritize data**: Ensure `calculateDrillMass` prioritizes `part.mass` but uses engine as fallback.

### [/] Consumables & Reliability
- [x] **Verify logic**: Confirmed `inventorySlice.ts` and `QuickAccessBar.tsx` work correctly.
- [ ] **Endgame Scaling**: Audit consumable efficiency for late-game tiers to ensure they remain relevant.

### [ ] Dynamic Market Prices
- [ ] **`marketEngine.ts` Logic**: Implement `getTemporalModifier()` using a time-based cycle (e.g., `Math.sin(Date.now() / wavelength)`).
- [ ] **`MarketView.tsx` Update**: Add visual trend indicators (Up/Down arrows) and color-coded price differences.

### [ ] Drone Visualization (PixiJS)
- [ ] **`DroneRenderer.tsx`**: New component using PixiJS to render drones orbiting the drill.
- [ ] **Orbit Physics**: Smooth follows and "floaty" movement logic.
- [ ] **Drone Types**: Distinct visuals for `REPAIR` (cyan/structural) and `COOLER` (blue/energy) drones.

### [ ] Boss Minigames & Combat Polish
- [x] **Fix Duplication**: Removed redundant `CombatMinigameOverlay` from `App.tsx`.
- [ ] **`CombatSystem.ts` Reliability**: Sync minigame state more robustly with the `GameEngine`.
- [ ] **Mobile Optimization**: Check for overlapping UI or z-index issues during minigames.

### [ ] Performance & VFX
- [ ] **`OVERLOAD` Effect**: Add a pulsating visual effect on the drill during ability activation.
- [ ] **Mobile Performance**: Continue optimizing `DrillRenderer` (caching, reducing allocations).
