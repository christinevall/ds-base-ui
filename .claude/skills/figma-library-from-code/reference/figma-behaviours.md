# Figma behaviours that bite

Hard-won notes for `figma-library-from-code`. Read this before writing a
`use_figma` call that does anything beyond creating a plain frame.

- An inner shadow on a frame **with no fill** is applied to its children (it
  blurred Tabs' labels), and a frame's stroke draws **over** its children. For
  a `box-shadow: inset` border, draw a 1px rectangle as the frame's first child.
- A dash pattern restarts at every segment of a path (an imported circle has
  four). Draw the arc a `stroke-dasharray` produces as a path instead.
- An instance swap carries overrides layer by layer. A swappable icon must be
  one `Vector`, or the ink survives on its first paths only.
- A prop that renders nothing visible but is required (IconButton's `label` →
  `aria-label`) goes on a hidden text layer with a TEXT property, so the frame
  carries it back.
- A TEXT property's default applies to every variant, so variant-specific
  sample text is lost. The labels beside the set carry it instead.
- A `use_figma` call that throws is **rolled back**: nothing it did persists.
  Fix the script and rerun it whole, and make lookups throw with the layer
  names they saw, so the next attempt is informed.
- `use_figma` runs with `figma.skipInvisibleInstanceChildren = true`: hidden
  layers inside an instance do not appear in `children` or `findOne`. Set it
  to `false` at the top of any script that shows or edits a hidden layer on
  an instance (Toolbar's text buttons).
- `resize()` pins an auto-layout frame's size. Set the sizing modes (`AUTO`
  to hug) **after** calling it, or the component keeps a fixed height and
  overflows once a description is switched on. The audit flags any component
  with a fixed height unless its node is marked `height` (a raw CSS size).
- Parent selectors (`.segmented > button`) have no Figma equivalent: the child
  instances carry the look as overrides, and Figma keeps overrides across a
  variant change. Log it; a code-side option is usually the real fix.
- Property names are unique across types: a second `children` is silently
  renamed `children2`. Where `children` is text in some variants and an icon in
  others (Toggle), the text keeps the property and the icon is swapped on its
  layer.
- An auto-layout frame whose children are all hidden keeps its last size; it
  does not collapse. To drop a label-and-description column, hide the column
  itself (bind it to `Field.Label`), not only its lines.
- Boolean and text defaults come from the **Default story's** args
  (`showValue` on for Progress), the same composition Storybook opens on.
- `search_design_system` answers one query per call; batching is clamped.
  Once the manifest has keys, place library items by key instead of searching.
- **CSS shorthand is read clockwise.** `padding: 0 space-2 space-4` is top 0,
  left and right `space-2`, bottom `space-4`; two values are vertical then
  horizontal. `css-to-spec` prints the values without naming the sides, so set
  each side on purpose and compare the result with the story. Swapping them is
  how the Accordion panel sat 16px in instead of 8px (2026-09-23).
- A story can be broken. Standalone `Checkbox` crashes (`Field.Item` outside a
  `Field.Root`); compare against a story that renders and flag the crash.

Stay under ~30 variants per set. If the matrix is bigger, split a repeating
sub-element into its own component (`Select.Item`, `Tabs.Tab`) and compose it.
