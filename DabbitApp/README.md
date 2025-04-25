# Dabbit - Minimalist Habit Tracker

A clean, intuitive habit tracking mobile application built with React Native and Expo.

## Features

- **Simple Habit Tracking**: Create and track habits with a clean, minimalist interface
- **Progress Visualization**: View your progress through an intuitive calendar view
- **Categories**: Organize habits by categories with customizable colors
- **Streaks**: Track your current streak for each habit
- **Offline Support**: All data is stored locally, no internet connection required
- **Dark Mode**: Switch between light and dark theme

## Tech Stack

- **Frontend**: React Native, Expo, TypeScript
- **State Management**: React Context API
- **Storage**: AsyncStorage for local data persistence
- **UI Components**: Custom components following minimalist design principles

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/dabbit.git
cd dabbit
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm start
# or
yarn start
```

4. Open the app on your device using the Expo Go app by scanning the QR code

## Project Structure

```
dabbit/
├── app/                  # App screens organized with Expo Router
│   ├── (tabs)/           # Main app tabs
│   │   ├── index.tsx     # Home screen with today's habits
│   │   ├── progress.tsx  # Progress tracking screen
│   │   └── settings.tsx  # Settings screen
├── assets/               # Static assets
├── components/           # Reusable UI components
├── constants/            # App constants and theme settings
├── context/              # React context providers
├── hooks/                # Custom React hooks
└── types/                # TypeScript type definitions
```

## Roadmap

- [ ] Reminders and notifications
- [ ] Data backup and restore
- [ ] Custom habit icons
- [ ] Advanced statistics
- [ ] Weekly and monthly views
- [ ] Supabase integration for cloud sync

## License

This project is licensed under the MIT License
