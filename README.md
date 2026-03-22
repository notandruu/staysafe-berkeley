# StaySafe Berkeley

An interactive campus safety dashboard for UC Berkeley — displaying real-time warnings, incidents, and live camera feeds on an interactive map.

Live at [staysafeberkeley.org](https://staysafeberkeley.org)

## Features

- **Interactive Map** — Google Maps-powered map with clustered warning markers across campus and surrounding areas
- **Warning Log** — Scrollable sidebar listing all incidents with severity badges and timestamps
- **Severity Filtering** — Toggle high / medium / low severity warnings
- **Date Range Filtering** — Filter by last 24 hours, 7 days, or 30 days
- **Safety Summary** — Auto-generated alert banner based on current warning data (CAUTION / Areas to Watch / All Clear)
- **Trend Graph** — Line chart showing warning frequency over the selected time period
- **Live Camera Feeds** — Live traffic/campus camera viewer with desktop and mobile layouts
- **Mobile Responsive** — Adapted layouts for map size, camera list, and popups on small screens

## Warning Types

Police activity, fire, weather, hazmat, power outage, protest, violent crime, shots fired, robbery, earthquake

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui (Radix UI)
- **Maps**: `@react-google-maps/api`
- **Database**: Supabase
- **Charts**: Recharts
- **Routing**: React Router v6

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables

```env
VITE_GOOGLE_SHEETS_API_KEY=your_key_here
VITE_GOOGLE_SHEET_ID=your_sheet_id_here
```

Supabase credentials are configured in `src/integrations/supabase/client.ts`.

## Project Structure

```
src/
├── components/
│   ├── camera/        # Camera feed viewer components
│   ├── map/           # Map markers and info windows
│   ├── ui/            # shadcn/ui primitives
│   ├── CameraFeeds    # Live camera feeds section
│   ├── WarningLog     # Scrollable incident list
│   ├── WarningPopup   # Selected warning detail card
│   ├── SeverityFilter
│   ├── DateRangeFilter
│   └── LineGraph
├── hooks/             # useGeocoding, use-mobile
├── pages/             # Index (main dashboard), NotFound
├── services/          # warningService, googleSheetsService
├── types/             # Warning, WarningType, map types
└── utils/             # mapUtils
```
