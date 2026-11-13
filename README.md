# NEON VELOCITY — Cyberpunk Racing 3D

An endless, third-person arcade racer built for the browser. Thread a futuristic hypercar through synth-city traffic, chain near misses, collect energy cores, and ignite nitro while the circuit becomes steadily more dangerous.

## Highlights

- Original procedural 3D art: layered vehicle, animated wheels/thrusters, traffic silhouettes, elevated highway, skyline, holographic signs, arches, haze, and speed streaks
- Fixed-timestep arcade simulation with momentum, braking, boost, speed-sensitive steering, damage invulnerability, near misses, combos, and deterministic random generation
- Endless pooled traffic and repeating road/city geometry with instanced buildings
- Bloom, vignette, film noise, ACES tone mapping, dynamic FOV, impact shake, and Low/Medium/High quality presets
- Responsive keyboard and touch controls; complete menu, HUD, pause, settings, help, and results flows
- Quiet Web Audio one-shot effects for impacts, pickups, nitro, and UI—no continuous engine noise or external media dependency
- Local records, preferences, vehicle color, run statistics, and achievements via resilient Zustand persistence
- Vitest logic/component coverage, Playwright browser journeys, and GitHub Pages CI/CD

## Controls

| Action | Keyboard | Mobile |
|---|---|---|
| Steer | `A`/`D` or arrows | Left/right pads |
| Accelerate / brake | `W` / `S` | Automatic throttle / Brake |
| Nitro | `Shift` or `Space` | Nitro pad |
| Pause | `Esc` or `P` | HUD pause |
| Restart after run | `R` | Results button |

## Development

Requires Node.js 22+.

```bash
npm install
npm run dev
```

The dev server opens the application at `http://localhost:5173/neon-velocity-racing/`.

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run preview
npm run test:e2e
npm run check
```

## Architecture

React owns coarse UI state, while high-frequency simulation data stays in mutable refs inside the React Three Fiber frame loop. A 60 Hz accumulator advances pure simulation functions independent of render rate. Render objects read simulation state directly; the HUD receives a throttled snapshot. Traffic entities are reused in place, city buildings are instanced, and road/city coordinates wrap to remain bounded.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the complete module and data-flow guide.

## Project structure

```text
src/components       menus, HUD, settings, results, touch controls
src/game/core        types, configuration, deterministic simulation, input
src/game/entities    player vehicle and pooled traffic
src/game/world       repeating highway and instanced city
src/game/rendering   R3F world, camera, speed FX, postprocessing
src/game/audio       Web Audio synthesizer
src/state            Zustand state and persistence
src/tests            browser-like test setup
e2e                  Playwright journeys
```

## GitHub Pages deployment

The Vite base is `/neon-velocity-racing/`. To publish:

1. Create a GitHub repository named `neon-velocity-racing` and push this project to its `main` branch.
2. In **Settings → Pages**, select **GitHub Actions** as the source.
3. Run or inspect **Deploy Neon Velocity to GitHub Pages** under Actions.
4. After a successful deployment, open `https://p1y1m.github.io/neon-velocity-racing/`.

The workflow uses only official Pages actions and the standard repository token. No backend, API key, or custom secret is required.

## Performance strategy

Instanced meshes, shared primitive geometry, bounded world coordinates, pooled traffic, simple AABB proximity checks, capped frame deltas, adaptive DPR, quality-based postprocessing, and a throttled UI bridge keep frame work predictable. The High preset is intended for modern desktop GPUs; Medium or Low should be selected on integrated/mobile hardware.

## Known limitations

- The straight endless circuit prioritizes readable high-speed dodging over road curvature.
- Audio is deliberately sparse: short filtered cues start after user interaction, while continuous engine and background noise remain disabled.
- Performance depends on browser/GPU and must be measured on target hardware; quality defaults can be changed in Settings.
- The public build is deployed at [p1y1m.github.io/neon-velocity-racing](https://p1y1m.github.io/neon-velocity-racing/) through the repository's GitHub Actions workflow.

## Future directions

Curved district transitions, rival boss vehicles, gamepad support, an original music sequencer, ghost replays, and deeper vehicle progression are natural extensions.
