# Contributing and versioning

This system serves four products. A change here reaches all of them, so every change follows the same path.

## Making a change

1. Branch from `main`. Never commit to `main` directly.
2. Edit the source: `tokens/*.tokens.json` for values, `components/components.css` for component CSS. Never edit `dist/` by hand.
3. Run `npm run check`. It validates the tokens, enforces the WCAG contrast gates, rebuilds `dist/` and fails if `dist/` is stale.
4. Run `npm run storybook` and look at the result in the browser, in every state.
5. Open a pull request. CI runs the same check. Merging to `main` publishes Storybook.
6. If the change affects a foundation (a token value, a type role, a rule such as button height), add a dated entry to `DECISIONS.md` with the reason.

## Adding a component

A component is ready to ship when all of these are true:

- [ ] It uses semantic and component tokens only: no primitives, no hardcoded values.
- [ ] Any new value it needs exists as a component token first, with a `DECISIONS.md` entry if the value is new.
- [ ] It has a Storybook story showing every state it has: default, hover, focus, disabled, and any variants.
- [ ] Interactive parts reach the 44px comfortable touch target, or the exception is written down (as with the Tertiary button).
- [ ] Text meets the contrast gates and the 12px minimum.
- [ ] Focus is visible and uses the shared focus ring tokens.
- [ ] Mobile behavior is defined (at 860px and narrower), not left to each product.
- [ ] It respects `prefers-reduced-motion`.
- [ ] It has a matching component in the Figma library, or the gap is noted in the README.

## Adding an icon

Icons live in `icons/`, one SVG per file, and are built into `dist/icons.svg` and `dist/icons.json`. `npm run check` enforces the rules marked (checked).

- Name: lowercase kebab-case, describing the picture, not the use (`external-link`, not `new-window`). (checked)
- Grid: `viewBox="0 0 24 24"`. (checked)
- Colour: `currentColor` only, never a fixed colour, so the icon follows its button or text. (checked)
- Style: outlined, 2px stroke, round caps and joins. Filled icons are the exception and need a reason.
- No scripts, styles, images or text inside the file. (checked)
- Add it to the Storybook gallery by saving the file. The gallery builds from the folder.
- Decorative icons are hidden from screen readers (`aria-hidden="true"`). An icon that stands alone is a button or link with an `aria-label`.
- Brand logos (Figma, GitHub, Vercel and so on) are not part of this set. They have fixed colours and shapes and belong in their own file.

## Versioning

Releases are git tags (`v0.1.0`, `v0.2.0`). Products pin a tag, never `@main`, so a change reaches a product only when its owner chooses to upgrade. The system is pre-1.0: minor versions may include breaking changes, and each one is listed in the changelog.

| Change | Version |
| --- | --- |
| Fix that changes no rendered output | patch |
| New token, new component, new variant | minor |
| Changed token value, renamed or removed token or class, changed component size or spacing | minor while pre-1.0 (major after 1.0), marked **Breaking** in the changelog |

## Deprecation

Nothing is removed in the release that deprecates it.

1. Mark the token or class **Deprecated** in the changelog and name its replacement.
2. Keep it working for at least one minor release.
3. Remove it in a later release and mark that release **Breaking**.

`dist/legacy-aliases.css` follows the same rule. It is deleted once the last product stops using the old portfolio names.

## Release checklist

1. `npm run check` passes on `main`.
2. `CHANGELOG.md` has an entry for the version, with the date.
3. Tag the commit and push the tag.
4. Update each product's pinned tag one at a time, and check it before moving to the next.
