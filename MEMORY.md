# Development Memory

- Visual style: sunny pastel low-poly storybook adventure, with teal, coral, mint, warm yellow, and lavender accents.
- Generated art is intentionally used as a low-opacity brand wash so procedural Babylon geometry remains legible and performant.
- Babylon imports use deep module paths for bundle control.
- `GameCanvas` guards React StrictMode double-mount and disposes window listeners and the Babylon scene.
- The mini-games are compact replayable loops in the HUD rather than separate scenes; this keeps the vertical slice responsive on low/mid-range devices.
- No gambling, weapons, combat, or financial mechanics are included.
