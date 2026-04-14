# AKRU Campaign OS - Component Architecture

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout with theme provider
│   ├── globals.css                # Tailwind + theme CSS variables
│   ├── (dashboard)/               # Dashboard route group
│   │   ├── layout.tsx             # Dashboard layout with sidebar + topbar
│   │   └── dashboard/
│   │       └── page.tsx           # Sample dashboard page
│   └── page.tsx                   # Default root page
│
└── components/
    ├── layout/
    │   ├── sidebar.tsx            # Left navigation sidebar
    │   └── topbar.tsx             # Top command bar + notifications
    │
    ├── ui/                        # Reusable base components
    │   ├── badge.tsx              # Badge with variants (CVA)
    │   ├── button.tsx             # Button with variants (CVA)
    │   ├── card.tsx               # Card container components
    │   └── data-table.tsx         # Generic sortable, paginated table
    │
    └── shared/                    # Domain-specific badge components
        ├── stage-badge.tsx        # Pipeline stage colors
        ├── priority-badge.tsx     # Task priority colors
        ├── tier-badge.tsx         # Contact tier colors
        └── sla-timer.tsx          # Live countdown with color coding
```

## Key Components

### Layout Components

**Sidebar** (`components/layout/sidebar.tsx`)
- Collapsible left navigation with 11 main sections
- Icons from lucide-react
- Active state highlighting
- User avatar + role at bottom
- Uses `usePathname` for active link detection

**Topbar** (`components/layout/topbar.tsx`)
- Search bar with Cmd+K placeholder
- Notification bell with indicator
- User dropdown menu with Settings/Sign Out
- Sticky positioning in dashboard layout

### UI Base Components

**Badge** (`components/ui/badge.tsx`)
- Variants: default, secondary, destructive, outline, success, warning
- Uses class-variance-authority
- Tailwind dark mode support

**Button** (`components/ui/button.tsx`)
- Variants: default, destructive, outline, secondary, ghost, link
- Sizes: default, sm, lg, icon
- Supports `asChild` prop via @radix-ui/react-slot
- Proper focus states and disabled states

**Card** (`components/ui/card.tsx`)
- Composed components: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- Uses forwardRef pattern
- Built-in border and spacing

**DataTable** (`components/ui/data-table.tsx`)
- Client-side sorting (any column)
- Pagination with prev/next and page buttons
- Row count display
- Row click handler support
- Responsive scroll wrapper
- Generic typing with TypeScript

### Shared/Domain Components

**StageBadge** (`components/shared/stage-badge.tsx`)
- Maps 8 pipeline stages to colors:
  - IDENTIFIED: gray (default)
  - CONTACTED: outline (blue)
  - ENGAGED: secondary (slate)
  - QUALIFIED: warning (amber)
  - DEMO_SCHEDULED: secondary (slate)
  - PROPOSAL: secondary (slate)
  - CLOSED_WON: success (green)
  - CLOSED_LOST: destructive (red)

**PriorityBadge** (`components/shared/priority-badge.tsx`)
- URGENT: red (destructive)
- HIGH: amber (warning)
- NORMAL: slate (secondary)
- LOW: green (success)

**TierBadge** (`components/shared/tier-badge.tsx`)
- A: red/hot (destructive)
- B: amber/warm (warning)
- C: slate/cool (default)

**SLATimer** (`components/shared/sla-timer.tsx`)
- Live countdown component (updates every second)
- Color states:
  - Overdue: red, pulsing
  - Critical (<30min): red, pulsing
  - Warning (<2hr): amber
  - OK: green
- Compact and full variants
- Shows hours, minutes, seconds

## Styling System

### CSS Architecture (globals.css)
- Tailwind @layer directives for base, components, utilities
- CSS variables for theme colors in :root
- Dark mode support via media query and class-based overrides
- Professional ops dashboard aesthetic (slate/zinc palette)

### Color System
- Sidebar: Dark navy (#0f172a)
- Content: White light, slate-900 dark
- Borders: Slate-200 light, slate-700 dark
- Text: Slate-900 light, slate-50 dark
- Accent: Blue-600 for primary actions

### Responsive Design
- Desktop-first approach
- Grid layouts for stats/cards (responsive columns)
- Horizontal scroll on data tables
- Mobile-friendly navigation (collapsible sidebar ready)

## Theme Configuration

Root layout includes:
- `next-themes` ThemeProvider with dark mode default
- System preference detection via `enableSystem`
- Smooth transitions disabled for responsiveness
- `suppressHydrationWarning` on html tag

## Usage Examples

### Using DataTable
```tsx
const columns: Column<Contact>[] = [
  { id: "name", header: "Name", accessorKey: "name", sortable: true },
  { id: "tier", header: "Tier", accessorKey: "tier", 
    cell: (value) => <TierBadge tier={value as ContactTier} /> }
];

<DataTable columns={columns} data={contacts} pageSize={20} />
```

### Using SLATimer
```tsx
<SLATimer deadline={new Date(Date.now() + 2 * 3600000)} compact={true} />
```

### Layout Pattern
```tsx
// Dashboard pages automatically get sidebar + topbar
// via (dashboard) route group layout.tsx
```

## Dependencies
- next 16.2.3
- react 19.2.4
- tailwindcss 4
- @radix-ui/react-slot (for Button asChild)
- lucide-react (icons)
- next-themes (dark mode)
- class-variance-authority (CVA)

## Notes
- All components use TypeScript
- "use client" directive applied to interactive components
- No external state management needed (local useState for UI state)
- All components support dark mode
- Designed for operator/admin dense dashboards, not marketing sites
