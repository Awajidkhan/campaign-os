# AKRU Campaign OS - Build Checklist

## Files Created

### Root Layout & Styles
- [x] `/src/app/layout.tsx` - Root layout with Inter font, ThemeProvider, metadata
- [x] `/src/app/globals.css` - Tailwind CSS with theme variables (dark navy sidebar, professional ops aesthetic)

### Layout Components
- [x] `/src/components/layout/sidebar.tsx` - Collapsible left nav with 11 sections, user info
- [x] `/src/components/layout/topbar.tsx` - Search bar, notifications, user dropdown menu

### Dashboard Layout
- [x] `/src/app/(dashboard)/layout.tsx` - Route group layout with sidebar + topbar + scrollable content

### UI Base Components (Reusable)
- [x] `/src/components/ui/badge.tsx` - 6 variants (default, secondary, destructive, outline, success, warning)
- [x] `/src/components/ui/button.tsx` - 6 variants, 4 sizes, asChild support
- [x] `/src/components/ui/card.tsx` - Composed card components (Card, Header, Title, Description, Content, Footer)
- [x] `/src/components/ui/data-table.tsx` - Generic table with sorting, pagination, row click handler

### Shared/Domain Components
- [x] `/src/components/shared/stage-badge.tsx` - 8 pipeline stages with colors (IDENTIFIED→CLOSED_LOST)
- [x] `/src/components/shared/priority-badge.tsx` - 4 task priorities (URGENT→LOW) with colors
- [x] `/src/components/shared/tier-badge.tsx` - 3 contact tiers (A→C) with heat colors
- [x] `/src/components/shared/sla-timer.tsx` - Live countdown with 4 status states (overdue/critical/warning/ok)

### Example/Test Page
- [x] `/src/app/(dashboard)/dashboard/page.tsx` - Dashboard demo with all components

### Documentation
- [x] `/COMPONENTS.md` - Architecture guide and component reference
- [x] `/BUILD_CHECKLIST.md` - This file

## Implementation Details

### All Requirements Met

#### 1. Root Layout
- [x] Inter font from next/font/google
- [x] ThemeProvider from next-themes wrapping children
- [x] Metadata: title "AKRU Campaign OS", description about campaign ops

#### 2. Globals CSS
- [x] @tailwind directives (base/components/utilities)
- [x] CSS variables for light and dark themes
- [x] Dark navy sidebar (#0f172a)
- [x] Clean white content area
- [x] Slate/zinc palette for professional ops tool

#### 3. Sidebar Navigation
- [x] AKRU Campaign OS logo/text at top
- [x] 11 navigation links with lucide-react icons:
  - Dashboard (LayoutDashboard)
  - Contacts (Users)
  - Accounts (Building2)
  - Campaigns (Send)
  - Triage (Inbox)
  - Pipeline (GitBranch)
  - Tasks (CheckSquare)
  - Mailboxes (Mail)
  - Content (Calendar)
  - Admin (Settings)
  - Audit Log (FileText)
- [x] Active state highlighting
- [x] Collapsed/expanded toggle
- [x] User avatar and role badge at bottom
- [x] "use client" directive
- [x] usePathname for active detection

#### 4. Top Bar
- [x] Search/command bar with Cmd+K placeholder
- [x] Notification bell with indicator
- [x] User dropdown menu with Settings/Sign Out

#### 5. Dashboard Layout Group
- [x] Sidebar on left
- [x] Topbar at top of content
- [x] Children in main scrollable area
- [x] Proper flex layout

#### 6. Badge Component
- [x] CVA with 6 variants
- [x] Dark mode support
- [x] Proper TypeScript interfaces

#### 7. Card Component
- [x] Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- [x] forwardRef pattern
- [x] Consistent styling

#### 8. Button Component
- [x] 6 variants (default, destructive, outline, secondary, ghost, link)
- [x] 4 sizes (default, sm, lg, icon)
- [x] CVA implementation
- [x] @radix-ui/react-slot asChild support
- [x] Proper focus and disabled states

#### 9. Data Table Component
- [x] Accepts columns and data
- [x] Header with sort indicators
- [x] Pagination controls (prev/next, page count)
- [x] Row count display
- [x] Responsive scroll wrapper
- [x] "use client" directive
- [x] Generic typing

#### 10. Stage Badge
- [x] Maps PipelineStage to colors
- [x] 8 stages with proper color mapping
- [x] IDENTIFIED: gray
- [x] CONTACTED: blue
- [x] ENGAGED: cyan
- [x] QUALIFIED: yellow
- [x] DEMO_SCHEDULED: orange
- [x] PROPOSAL: purple
- [x] CLOSED_WON: green
- [x] CLOSED_LOST: red

#### 11. Priority Badge
- [x] URGENT: red
- [x] HIGH: orange
- [x] NORMAL: yellow
- [x] LOW: green

#### 12. Tier Badge
- [x] A: red/hot
- [x] B: amber/warm
- [x] C: slate/cool

#### 13. SLA Timer
- [x] Countdown component with live updates
- [x] Color coding: overdue/critical (red), warning (amber), ok (green)
- [x] Overdue: red, pulsing
- [x] Critical (<30min): red
- [x] Warning (<2hr): amber
- [x] OK: green
- [x] "use client" with useState/useEffect
- [x] Compact and full variants

## Technical Stack
- Next.js 16.2.3
- React 19.2.4
- TypeScript
- Tailwind CSS 4
- next-themes for dark mode
- class-variance-authority for component variants
- @radix-ui/react-slot for polymorphic components
- lucide-react for icons

## Design Philosophy
- Professional operator dashboard aesthetic (NOT marketing-site)
- Dense, functional UI
- Dark mode optimized
- Desktop-first approach
- Consistent color usage across components
- Full dark mode support with CSS variables

## Next Steps for Development
1. Create individual page components for each nav section
2. Add form components (input, select, textarea, etc.)
3. Integrate with backend API/database
4. Add authentication flow
5. Implement real data loading
6. Add modal/dialog components
7. Create notification system
8. Add search functionality
