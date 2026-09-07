# Darkroom 3D table study

Open `/?experience=darkroom3d` to view the independent table study. It does
not need photo records or storage credentials. The existing homepage still
performs its normal server queries before selecting the client presentation.

The study uses a fixed perspective camera, a shallow table slab, deterministic
fibre and wear texture, a warm spotlight and a weak red safelight. Peripheral
lenses, a film tin and a mechanical timer establish scale and context, with
contact shadows and a restrained rim light. It renders on mount
and resize, with no continuous animation loop. Pixel ratio is capped at 1.5.
Three.js loads only when this presentation mounts. There are no photos yet.

The two return buttons update both the stored mode and URL. Existing classic
and darkroom components and styles are unchanged.

To remove this experiment:

1. Remove the dynamic import and `darkroom3d` branch in `HomeExperience.tsx`.
2. Remove `darkroom3d` from `VISUAL_EXPERIENCES` in `visualExperience.ts`.
3. Delete this directory.
4. Remove `three` and `@types/three` using the project's package manager if
   no other feature uses them.

The mode parser ignores a saved value after that value is removed, falling
back to the configured default. No database migration is involved.
