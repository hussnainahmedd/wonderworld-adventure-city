# Development Memory

The original small-town scene was expanded into a large connected procedural world while preserving mobile readability. Repeated foliage is created from lightweight primitive groups rather than hundreds of unique meshes. Buildings use doors, windows, roofs, and sign metadata so they read as authored places even before more detailed interior scenes are added.

The game now stores a local progression snapshot under `wonderworld-save-v2`. This deliberately supports device-local continuity in the preview; cloud profiles, parental controls, matchmaking, analytics, audio, and native Android packaging remain separate production stages.

The new UI prioritizes the 3D world: the HUD is condensed to top progression, a left context card, small bottom activity cards, and edge-positioned mobile controls. Larger systems live in panels that can be opened without replacing the 3D scene.

The expanded scene is authored as a scalable vertical slice. The main remaining production risk is asset/animation depth: the current character and pets use procedural low-poly meshes with live motion instead of imported authored animation clips. This is honest and functional, but should be upgraded before positioning the game as a finished commercial release.
