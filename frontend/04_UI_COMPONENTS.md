# frontend/04_UI_COMPONENTS.md — Design System & Common Components

## Design tokens

- Look: clean clinical SaaS. Light theme. Background `slate-50`, surfaces white with
  `border-slate-200` and `shadow-sm`, radius `rounded-xl` for cards, `rounded-lg` controls.
- Primary: teal (`teal-600` actions, `teal-700` hover). Danger: `red-600`.
- Risk colors (use everywhere, define in `utils/helpers.ts → riskColor()`):
  LOW → emerald, MODERATE → amber, HIGH → red.
- Typography: Inter (or system stack), `text-slate-900` headings, `text-slate-600` body,
  `text-sm` default in tables/forms.
- Spacing rhythm: page container `p-6 max-w-7xl mx-auto`, card padding `p-5`,
  section gaps `space-y-6`.
- Icons: lucide-react, `size={18}` inline with text.

## Common components (components/common) — required props/behavior

| Component | Spec |
|---|---|
| `Button` | variants: primary / secondary(outline) / danger / ghost; sizes sm/md; `isLoading` shows spinner + disables; renders `<button type>` properly |
| `Input`, `Select`, `Textarea` | label, error string (red text below), forwardRef for RHF `register`; required asterisk |
| `Modal` | portal, ESC + overlay close, focus trap basics, title + footer slot |
| `ConfirmDialog` | built on Modal: message, confirmLabel (danger), onConfirm async with loading |
| `Table<T>` | columns `{ header, render(row) }[]`, loading skeleton rows, empty slot |
| `Pagination` | page/totalPages, prev/next + numbers (ellipsis past 7) |
| `Badge` | color variants incl. risk categories + doctor statuses |
| `Loader` | inline spinner + `fullScreen` variant |
| `EmptyState` | icon, title, description, optional CTA button |

## Layouts

- `DashboardLayout`: fixed Sidebar (w-64, hidden on mobile behind hamburger),
  Navbar top, `<Outlet/>` in scrollable main. Active nav item highlighted
  (`NavLink` styling).
- `AuthLayout`: centered card (max-w-md) on subtle gradient, logo, footer link row.
- `Footer`: minimal, app name + year.

## Charts (components/charts, Recharts)

- `RiskChart`: radial/gauge style — render risk score 0–1 as percentage with
  category-colored fill (RadialBarChart) + big number label.
- `ShapChart`: horizontal BarChart of contributions; positive bars red-ish
  (pushes risk up), negative emerald (pushes down); value labels formatted `+35%`;
  features ordered by |contribution| desc; humanize names
  (`bloodPressure → "Blood Pressure"`).
- `TrendChart`: LineChart of riskScore (or count) over time, date X-axis formatted
  `MMM d`.
All charts wrapped in `ResponsiveContainer` with fixed heights (e.g. h-64) and a Card
wrapper with title.

## UX rules

1. Every mutation: button `isLoading`, success toast with backend `message`, error toast
   with envelope message (fallback "Something went wrong").
2. Destructive actions always go through `ConfirmDialog`.
3. Forms: disable submit while submitting; show field-level errors from Zod AND map
   backend `VALIDATION_ERROR.details` onto fields via `setError`.
4. Dates via `helpers.formatDate` (e.g. "10 Jun 2026, 14:32").
5. Landing page (Home): hero (name, tagline "Privacy-preserving healthcare risk
   prediction"), 3 feature cards (Secure Records / AI Predictions / Explainable Results),
   CTA → Login/Register. No fake testimonials or fabricated medical claims.
6. Accessibility basics: labels tied to inputs, button aria-labels for icon-only buttons,
   sufficient color contrast, keyboard-closable modals.
