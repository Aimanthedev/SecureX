# Proper Light Mode

## Goal
Add a complete light theme while preserving the current dark theme, branding, content, routes, modules, data, and behavior.

## Changes
- Define a full light palette in the shared CSS variables for backgrounds, cards, text, muted text, borders, inputs, popovers, charts, status colors, and shadows.
- Keep the existing dark palette under the dark-theme selector without changing its visual values.
- Replace dark-only page and shared-control colors with semantic theme tokens, including panels, tables, forms, tabs, dialogs, dropdowns, charts, and the field view.
- Keep the sidebar premium and dark in both modes while making the top bar and mobile navigation theme-aware.
- Add a clear sun/moon theme control to the top bar and keep the existing Appearance setting synchronized with it.
- Persist the selected theme locally and apply it consistently after page reloads without adding any backend.

## Validation
- Check representative desktop and mobile pages in both themes for readable text, borders, selected states, overlays, and charts.
- Run `npm run build` and resolve any failures.

## Technical details
- Use the existing Tailwind v4 token mappings and CSS custom properties.
- Preserve all existing route files, content, mock data, interactions, and business wording.
