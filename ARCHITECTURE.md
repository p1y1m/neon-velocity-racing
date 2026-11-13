# Architecture

## Runtime layers

`App` owns the coarse finite-state UI flow: boot, menu, countdown, playing, paused, game over/results, and settings. Zustand exposes transitions and persists only long-lived preferences and records. React components subscribe through narrow selectors.

`GameScene` owns the mutable `SimState`. It advances pure gameplay logic with a fixed 1/60-second accumulator, clamps abnormally long browser frames, and publishes an 80 ms HUD snapshot. Pausing bypasses simulation, traffic, scoring, spawning, and timers together.

## Data flow

```text
keyboard / touch → shared InputState → fixed simulation → SimState ref
                                             ├→ car/camera/world transforms
traffic proximity → collision/reward reducers ├→ throttled Zustand HUD snapshot
                                             └→ run end → records/achievements
```

High-frequency transforms never require React reconciliation. UI state and durable records remain declarative and observable.

## World and entities

The highway is a ring of visual segments positioned by distance modulo segment length. The city uses one instanced mesh for building shells and another for emissive facade faces. Both wrap within bounded coordinates, preventing floating-point drift.

Traffic uses a fixed pool of entity records and meshes. Passed objects are relocated ahead with deterministic lane choices instead of being allocated or destroyed. Collision and near-miss flags guarantee one reward/damage event per pass. Energy cells share the same lifecycle.

## Rendering

React Three Fiber manages WebGL lifecycle. Shared lights, fog, ACES filmic tone mapping, emissive materials, speed-reactive FOV, instanced streaks, bloom, noise, and vignette form the image pipeline. Quality presets alter pixel ratio, shadowing, city density, antialiasing, and effects without changing gameplay.

## Persistence and audio

Zustand's JSON storage middleware writes versioned local settings, records, achievements, and vehicle selection. Defaults are merged on hydration so added fields remain safe. Browser storage failures fall back to runtime state.

The audio layer generates only short, filtered oscillator/envelope cues with Web Audio. There is no continuous engine or background oscillator. Every voice is tracked, stopped, and disconnected on gameplay lifecycle changes; the context is disposed when the scene unmounts. Context creation occurs only after interaction, respecting browser autoplay policy.

## Testing

Pure tests cover deterministic randomness, simulation stepping, nitro, collision invulnerability, combos, difficulty, and records. Testing Library checks menu, HUD, and settings behavior. Playwright verifies the production build under the repository subpath and exercises the main state transitions and persistence.
