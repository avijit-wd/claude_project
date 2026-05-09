# UI Coding Standards

## Component Library

**Only shadcn/ui components may be used for UI in this project.**

- Do NOT create custom UI components (buttons, inputs, cards, modals, etc.)
- Do NOT use any other component library (MUI, Chakra, Ant Design, etc.)
- All UI primitives must come from shadcn/ui
- If a needed component does not yet exist in the project, add it via the shadcn CLI:
  ```bash
  npx shadcn@latest add <component-name>
  ```
- Installed components live in `src/components/ui/` — do not modify them directly

## Date Formatting

All date formatting must use [date-fns](https://date-fns.org/).

Dates must be displayed in the following format: `do MMM yyyy`

| Date | Output |
|------|--------|
| 2025-09-01 | 1st Sep 2025 |
| 2025-08-02 | 2nd Aug 2025 |
| 2026-01-03 | 3rd Jan 2026 |
| 2024-06-04 | 4th Jun 2024 |

### Usage

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // e.g. "1st Sep 2025"
```

Do not use `new Date().toLocaleDateString()`, `Intl.DateTimeFormat`, or any other date formatting approach.
