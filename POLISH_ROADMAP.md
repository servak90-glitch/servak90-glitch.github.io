# Project Roadmap & Improvement Plan

This document tracks planned features, enhancements, and polishing tasks based on the "Hardcore Philosophy" and `ImprovementPlan_v1`.

## 1. Audio System (Polishing)
- [ ] **Enhance Explosions**: Make explosion sounds "fatter" (more bass, longer release, possibly layered noise).
- [ ] **Sound Variety**: Add more generative variations for repetitive sounds (clicks, mining).
- [ ] **Mixing**: Fine-tune volume balance between music layers and SFX.
- [ ] **Code Optimization**: Review `services/audioEngine.ts` for performance when multiple sounds play at once.

## 2. Expedition System (Drones)
- [ ] **Mechanic**: Send drones to deep layers for resources.
- [ ] **Risk System**: Low (5%), Medium (20%), High (40%), Extreme (70%) chance of failure/loss.
- [ ] **Implementation**: `ExpeditionView.tsx`, `ExpeditionSystem.ts`, `DroneRenderer.tsx`.

## 3. Combat System
- [ ] **Active Skills**: EMP Burst, Thermal Strike, Barrier, Overload.
- [ ] **Boss Mechanics**: Phases with weak points.
- [ ] **Implementation**: `AbilitySystem.ts`, `CombatSystem.ts`, `BossRenderer.tsx`.

## 4. Horizontal Progression
- [ ] **Side Tunnels**: Resource Veins, Ancient Vaults, Hostile Nests.
- [ ] **Factions**: Corporate, Science, Rebels (Reputation system).

## 5. Visuals & Atmosphere
- [x] **Tunnel Renderer**: Debris, fog gradient (implemented in TunnelAtmosphere.ts)
- [ ] **Flying Objects**: Geodes, satellite debris background elements.
- [ ] **Hazards**: Cave-ins, gas pockets, magma flows (system ready, need triggers).

## 6. Long-Term (Endgame)
- [ ] **Dimensions**: Instead of Prestige. Portal assembly quest.
- [ ] **Tier 15+**: "Hobo in a bag" start in a new dimension with different physics/rules.

## 7. Technical / Code Quality
- [ ] **Type Hardening**: Enums for all keys.
- [ ] **State Slicing**: Split Zustand store if it becomes too large.
- [ ] **Optimization**: Ensure Canvas renders read state directly.
