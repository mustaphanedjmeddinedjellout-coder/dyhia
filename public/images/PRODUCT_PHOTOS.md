# Product photos

The homepage reads product images from this folder.

## Current filenames in use

These are the filenames the site is currently configured to use:

- Black (الأسود): `fn.webp`
- Red (الأحمر): `IMG_8495.webp`
- Green (الأخضر): `fv.webp`

## Optional: rename to clearer names

If you prefer clearer filenames (recommended), rename your files to:

- `dress-black.webp`
- `dress-red.webp`
- `dress-green.webp`

Then update the `colors` array in `app/page.tsx` to match.

## Tips

- Keep them reasonably optimized for mobile (example: 1200px–1600px tall, ~150–400KB each).
- If any file is missing, the UI will fall back to `hero.svg`.
