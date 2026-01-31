# TWTC Crypto Mining Game

## Overview
A React-based crypto mining clicker game where users can click to mine coins, purchase mining equipment upgrades, and earn achievements.

## Tech Stack
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS v4
- **Animation**: Motion (Framer Motion successor)
- **UI Components**: Radix UI primitives with shadcn/ui-style components
- **Icons**: Lucide React
- **Toasts**: Sonner

## Project Structure
```
src/
├── App.tsx                 # Main game logic and state management
├── main.tsx               # React entry point
├── index.css              # Tailwind imports
├── assets/                # Game images
├── components/            # React components
│   ├── achievements.tsx   # Achievement system
│   ├── bottom-nav.tsx     # Bottom navigation bar
│   ├── coin-clicker.tsx   # Main coin clicking interface
│   ├── mining-stats.tsx   # Mining statistics display
│   ├── upgrade-shop.tsx   # Upgrade purchase interface
│   └── ui/               # Reusable UI components (buttons, cards, etc.)
└── styles/
    └── globals.css        # Global CSS variables and theme
```

## Development
- Run `npm run dev` to start the development server on port 5000
- Run `npm run build` to build for production
- The game state is persisted in localStorage

## Game Features
- **Click Mining**: Click the coin to earn coins
- **Auto Mining**: Purchase upgrades for passive income
- **Upgrades**: CPU, GPU, ASIC, and Quantum miners
- **Achievements**: Milestone rewards for various activities
- **Progress Tracking**: Visual progress bar and statistics

## Deployment
Static deployment with build output in `dist/` directory.
