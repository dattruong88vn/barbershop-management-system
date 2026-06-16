# Design System

Tài liệu này là điểm vào ngắn cho dev và Codex trước khi build UI. Trang preview sống nằm ở `/design-system`; component source nằm trong `src/components/global/`.

## Rule

- Luôn tìm trong `src/components/global/` trước khi viết component hoặc style mới.
- Reuse global primitive nếu đã có pattern tương ứng.
- Nếu pattern có thể dùng lại ở nhiều màn hình, thêm hoặc mở rộng global component trước rồi mới compose trong module/screen.
- Không dùng native/browser controls trực tiếp khi global component đã tồn tại.
- Không hardcode UI text trong component; dùng `src/constants/texts/`.
- Không hardcode colors hoặc custom spacing; dùng Geist/Tailwind design tokens hiện có.

## Component Map

| Pattern | Use |
| --- | --- |
| Actions | `Button` |
| Status labels | `Badge`, `StatusDot` |
| Typography | `Heading`, `Paragraph`, `MetricValue`, `Text`, `Label`, `Description` |
| Text input | `Input`, `FormTextField` |
| Password input | `PasswordField` |
| Textarea/select | `Textarea`, `Select`, `Combobox`, `MultiSelect` |
| Boolean controls | `Checkbox`, `Radio`, `Switch` |
| Numeric controls | `Slider` |
| Month/date picker | `MonthCalendar`, `Calendar` |
| Cards/sections | `Card`, `Grid`, `Collapse` |
| Tables | `Table`, `TableHead`, `TableBody`, `TableRow`, `TableCell` |
| Title/value rows | `KeyValueRow` |
| Empty state | `EmptyState` |
| Loading state | `Skeleton`, `Spinner`, `LoadingDots` |
| Inline alert | `InlineAlert`, `Banner`, `Note`, `Error` |
| Runtime feedback | Global Feedback notification flow, `AppFeedbackNotification` |
| Modal flows | `Modal`, `Sheet`, `Drawer` |
| Menus/popovers | `Popover`, `Tooltip`, `CommandMenu`, `ContextMenu` |
| Management navigation | `ManagementSidebar`, `ManagementSidebarContentOffset` |
| Staff desktop fallback | `StaffDesktopFallback` |
| Images | `ImageLightbox` |
| Charts | `ChartContainer`, `ChartTooltipContent` |

## Folder Contract

```txt
src/components/global/
  ui/                 # shadcn primitives
  Button.tsx
  Inputs.tsx
  Layout.tsx
  Display.tsx
  Feedback.tsx
  Advanced.tsx
  Specialized.tsx
  EmptyState.tsx
  FormTextField.tsx
  InlineAlert.tsx
  KeyValueRow.tsx
  Skeleton.tsx
  index.ts

src/components/screens/design-system/
  DesignSystemReferenceView.tsx
  index.ts

src/app/design-system/page.tsx
```

## Placement

- `src/app/` keeps route files only.
- Reusable app UI goes in `src/components/global/`.
- Shared mobile UI goes in `src/components/mobile/`.
- Module UI goes in `src/components/modules/<module>/`.
- Page-specific UI goes in `src/components/screens/<module-or-route>/`.
- Every component folder with exports needs an `index.ts`.

## Feedback

- Successful user actions must use the global Feedback notification flow.
- Dispatch feedback before `router.push` when navigation follows the action.
- `Toast` remains available as a design-system reference component; do not use it directly for runtime app notifications.

## States

Every screen must have loading, empty, and error states:

- Loading: use `Skeleton`, `Spinner`, or `LoadingDots`.
- Empty: use `EmptyState`.
- Error/warning: use `InlineAlert`, `Error`, `Banner`, or `Note`.

## Do Not

- Do not create local button, card, input, combobox, alert, skeleton, or empty-state visuals inside modules.
- Do not add route navigation strings directly in components; use `ROUTES`.
- Do not add API URL strings directly in components/hooks; use `API_ROUTES`.
- Do not scatter role/status/item-type string literals through UI logic.
