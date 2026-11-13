# Changelog

## Unreleased — 2026-11-13

- Added automatic acceleration for coarse-pointer/touch devices, with Brake overriding throttle and landscape-phone controls.
- Added Playwright phone emulation covering acceleration, braking, and nitro touch input.
- Removed the continuous synthesized engine oscillator and all persistent background noise.
- Reworked collision, collectible, nitro, and UI cues as quiet filtered one-shots.
- Reduced the default SFX volume to 20% and migrated the legacy 80% default.
- Added explicit voice cleanup for pause, restart, menu, game-over, and scene disposal.
- Added audio lifecycle regression tests.

## 1.0.0 — 2026-11-11

- Built the complete React/TypeScript/Vite application foundation.
- Added the procedural Three.js highway, instanced city, original player racer, pooled traffic, hazards, and energy cells.
- Added fixed-step driving, damage, nitro, scoring, near misses, combos, difficulty helpers, records, and achievements.
- Added cinematic rendering, graphics presets, camera feedback, responsive futuristic UI, mobile controls, and synthesized audio.
- Added Vitest, Testing Library, Playwright, documentation, and GitHub Pages deployment workflow.
