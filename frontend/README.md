# CryptoFlow - Premium Portfolio Dashboard

A stunning, production-grade cryptocurrency trading portfolio dashboard with advanced animations and AI-powered analytics.

## 🎯 Features

- **Premium UI/UX**: Modern design with glassmorphism, smooth animations, and 60fps performance
- **Advanced Animations**: Powered by Framer Motion for delightful micro-interactions
- **Interactive Charts**: Real-time data visualization using Recharts
- **AI Analytics**: Integration with LangGraph + Gemini for intelligent insights
- **Data Warehouse Connection**: Connect to PostgreSQL, Snowflake, BigQuery, and more
- **Real-time Updates**: Live portfolio tracking with React Query
- **Responsive Design**: Works beautifully on all screen sizes

## 🚀 Tech Stack

- **Frontend**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Charts**: Recharts + D3.js
- **State Management**: Zustand + React Query
- **Routing**: React Router v6
- **Backend Integration**: Axios + LangGraph API

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎨 Design System

### Color Palette
- **Backgrounds**: Dark theme (#0A0A0B, #121214, #1A1A1C)
- **Accents**: Indigo (#6366F1), Green (#10B981), Red (#EF4444)
- **Charts**: Custom gradient colors for data visualization

### Typography
- **Font**: Inter for UI, JetBrains Mono for code
- **Scale**: From 12px (xs) to 36px (4xl)

### Animations
- Page transitions with spring physics
- Card hover effects with scale and shadow
- Number counters with easing
- Chart animations with staggered delays
- Skeleton loading with shimmer effect

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components (Sidebar, Topbar)
│   ├── charts/          # Chart components
│   ├── portfolio/       # Portfolio-specific components
│   └── warehouse/       # Data warehouse components
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── store/               # Zustand stores
├── api/                 # API client configuration
└── styles/              # Global styles

## 🔌 Backend Integration

The dashboard connects to the LangGraph + Gemini backend:

```typescript
// API Endpoint: http://localhost:8000
POST /api/v1/warehouses/connect   # Connect data warehouse
POST /api/v1/pipeline/execute      # Execute LangGraph pipeline
GET  /api/v1/insights/latest       # Get AI insights
```

## 🎬 Key Components

### Dashboard
- Portfolio stats with animated counters
- Line chart showing portfolio value over time
- Bar chart for trading volume
- Asset cards with sparklines

### Portfolio
- Asset allocation pie chart
- Detailed asset table with real-time updates
- Quick stats panel

### Market
- Total market cap chart
- Trending tokens list
- Search functionality

### Analytics
- Data warehouse connection form
- SQL query builder
- AI-powered insights with Gemini
- Query results preview

### Settings
- Profile management
- Notification preferences
- Theme selection
- Security settings

## 🎨 Animation Examples

### Page Transition
```typescript
{
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}
```

### Card Hover
```typescript
{
  whileHover: { scale: 1.02, y: -4 },
  whileTap: { scale: 0.98 }
}
```

### Number Counter
```typescript
<CountUp
  end={47582.50}
  duration={2}
  decimals={2}
  separator=","
/>
```

## 🚀 Performance

- Code splitting for optimal bundle size
- Lazy loading for routes
- Debounced search inputs
- Optimized re-renders with React.memo
- Virtual scrolling for large lists

## 🎯 Best Practices

- TypeScript strict mode enabled
- Component composition over inheritance
- Custom hooks for reusable logic
- Centralized state management
- API response caching
- Error boundaries for resilience

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔒 Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000
```

## 🎨 Customization

All design tokens are defined in:
- `tailwind.config.ts` - Colors, spacing, animations
- `src/index.css` - Global styles and utilities

## 🐛 Development

```bash
# Run development server
npm run dev

# Type checking
npm run build

# Preview production build
npm run preview
```

## 📄 License

MIT

## 👨‍💻 Author

MansonObasi (@manson_87)

---

**Built with ❤️ using Vite + React + TypeScript**
