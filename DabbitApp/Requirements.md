# Minimalist Habit Tracker - Requirements Specification

## Project Overview

This document outlines the requirements for developing a minimalist habit tracking mobile application using React Native with Expo and Supabase. The application aims to provide users with a clean, intuitive interface for tracking their habits without unnecessary features or complexity.

## 1. Project Goals

- Create a minimalist habit tracker that focuses on essential features
- Develop a cross-platform mobile application using React Native and Expo
- Implement backend functionality using Supabase
- Design a clean, intuitive interface based on the provided GitHub UI
- Prioritize user experience and simplicity over feature complexity

## 2. Target Users

- Productivity enthusiasts who prefer minimalist applications
- Regular users who want a simple tool for tracking habits
- Users across iOS and Android platforms
- People who value functionality over complex gamification

## 3. Technical Stack

### Frontend
- **React Native**: Core framework for cross-platform mobile development
- **Expo**: Development environment and build system
- **React Navigation**: For handling navigation between screens
- **Expo Notifications**: For implementing reminders
- **AsyncStorage**: For local storage when offline
- **UI Components**: Will be based on the GitHub UI link provided separately https://github.com/labelvaultrough/dabit-v2.git

### Backend
- **Supabase**: Backend-as-a-Service for data storage and authentication
  - PostgreSQL database
  - Authentication system
  - Real-time data synchronization

### Development Tools
- **TypeScript**: For type safety and better code quality
- **ESLint**: For code linting
- **Jest**: For testing
- **Expo EAS Build**: For building and deploying the application

## 4. Core Features

### 4.1 User Authentication
- **Required**
  - Email and password registration/login
  - Social authentication options (Google, Apple)
  - Secure password reset functionality
  - User profile management
- **Implementation Notes**
  - Utilize Supabase Authentication
  - Implement secure token storage
  - Add biometric authentication option where available

### 4.2 Habit Management
- **Required**
  - Create habits with customizable names
  - Set frequency (daily, weekly, custom days)
  - Delete and edit existing habits
  - Mark habits as complete/incomplete
  - Set habit categories (optional)
- **Implementation Notes**
  - Store habits in Supabase database
  - Implement real-time updates
  - Cache data for offline usage with AsyncStorage
  - Sync when reconnected

### 4.3 Reminders
- **Required**
  - Set customizable reminders for habits
  - Choose time for each reminder
  - Enable/disable reminders per habit
  - Repeat options for different days
- **Implementation Notes**
  - Use Expo Notifications
  - Schedule local notifications
  - Implement proper handling of notification permissions
  - Store reminder settings in Supabase

### 4.4 Visual Progress Tracking
- **Required**
  - Calendar view showing completion status
  - Streak counter for consecutive completions
  - Simple weekly/monthly overview
  - Progress indicators (percentage, visual bars)
- **Implementation Notes**
  - Implement custom calendar component
  - Create simple, clean visual indicators
  - Optimize rendering for performance

### 4.5 Data Persistence and Sync
- **Required**
  - Store data locally when offline
  - Sync with Supabase when online
  - Conflict resolution for simultaneous edits
  - Backup and restore functionality
- **Implementation Notes**
  - Implement offline-first architecture
  - Use AsyncStorage for local cache
  - Handle merge conflicts automatically where possible
  - Alert users when manual conflict resolution is needed

### 4.6 Basic Customization
- **Required**
  - Categorize habits (work, health, personal)
  - Simple color themes or accent colors
  - Adjust reminder settings
  - Toggle between different views
- **Implementation Notes**
  - Store user preferences in Supabase
  - Implement theming system
  - Create a settings screen for customization options

## 5. User Interface Requirements

### 5.1 Design Principles
- Minimalist, clean interface
- High contrast and readability
- Intuitive navigation
- Consistent visual language
- Focus on content over decoration

### 5.2 Main Screens

#### Home/Dashboard Screen
- List of habits for current day
- Quick check-off functionality
- Visual indicators of progress
- Pull to refresh functionality
- Add habit button
- Navigation to other screens

#### Habit Creation/Edit Screen
- Name input field
- Frequency selection (daily, weekly, custom)
- Category selection (optional)
- Reminder settings
- Color or icon selection (optional)
- Save and cancel buttons

#### Calendar/History Screen
- Monthly calendar view
- Color-coded habit completion
- Ability to view and edit past entries
- Summary statistics for selected time period
- Toggle between different habits or view all

#### Settings Screen
- User profile management
- Theme selection
- Notification preferences
- Backup/restore options
- Help/FAQ section
- Logout functionality

### 5.3 Navigation
- Tab-based navigation for main screens
- Stack navigation for flows (creating/editing habits)
- Gesture support for common actions
- Back button functionality

### 5.4 UI Components
- Habit item component
- Calendar component
- Progress indicators
- Toggle switches
- Selection pickers
- Notification component
- Loading indicators
- Error states

## 6. Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_sync TIMESTAMP WITH TIME ZONE
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Habits Table
```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  frequency JSONB NOT NULL, -- {type: "daily"|"weekly"|"custom", custom_days: []}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  archived BOOLEAN DEFAULT FALSE
);
```

### Habit Entries Table
```sql
CREATE TABLE habit_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Reminders Table
```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  time TIME NOT NULL,
  days JSONB NOT NULL, -- Array of days [0,1,2,3,4,5,6] where 0 is Sunday
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### User Preferences Table
```sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  notification_settings JSONB DEFAULT '{"enabled": true}',
  default_view TEXT DEFAULT 'daily',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 7. API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login existing user
- `POST /auth/logout` - Logout user
- `POST /auth/reset` - Reset password

### Habits
- `GET /habits` - Get all habits for current user
- `POST /habits` - Create a new habit
- `GET /habits/:id` - Get a specific habit
- `PUT /habits/:id` - Update a habit
- `DELETE /habits/:id` - Delete a habit
- `GET /habits/:id/entries` - Get entries for a habit
- `POST /habits/:id/entries` - Create a new entry

### Categories
- `GET /categories` - Get all categories for current user
- `POST /categories` - Create a new category
- `PUT /categories/:id` - Update a category
- `DELETE /categories/:id` - Delete a category

### Reminders
- `GET /reminders` - Get all reminders for current user
- `POST /reminders` - Create a new reminder
- `PUT /reminders/:id` - Update a reminder
- `DELETE /reminders/:id` - Delete a reminder

### User Preferences
- `GET /preferences` - Get user preferences
- `PUT /preferences` - Update user preferences

## 8. Security Requirements

### Authentication
- Secure token storage using AsyncStorage with encryption
- Token refresh mechanisms
- Session timeout handling
- Biometric authentication where available

### Data Protection
- All API requests must be authenticated
- Row-level security in Supabase
- Data validation on both client and server
- Secure handling of sensitive information

### Privacy
- Clear data usage policies
- Option to delete account and all data
- No tracking or analytics without consent
- Local storage of sensitive data when possible

## 9. Offline Functionality

### Local Storage
- Store habit data locally using AsyncStorage
- Queue changes made while offline
- Automatically sync when connection is restored
- Show sync status indicator

### Conflict Resolution
- Use timestamps to resolve conflicts
- Prefer server data for most conflicts
- Alert user when manual resolution is needed
- Maintain history of changes when possible

## 10. Performance Requirements

### App Size
- Target maximum app size: < 50MB
- Optimize assets for size

### Loading Times
- Initial load: < 3 seconds on average devices
- Screen transitions: < 300ms
- Data fetching: < 1 second with good connectivity

### Memory Usage
- Keep memory usage < 150MB
- Properly dispose of unused resources
- Optimize list rendering for large datasets

## 11. Testing Requirements

### Unit Testing
- Test core functionality components
- Test utility functions
- Test API integration
- Aim for at least 70% code coverage

### Integration Testing
- Test main user flows
- Test offline functionality
- Test synchronization

### UI Testing
- Test on multiple screen sizes
- Test on both iOS and Android
- Test accessibility features

## 12. Accessibility Requirements

### General
- Support system font sizes
- Support high contrast modes
- Implement proper focus states
- Add appropriate alt text to images

### Screen Reader Support
- Test with VoiceOver and TalkBack
- Implement proper ARIA labels
- Ensure logical navigation flow

## 13. Deployment and Release Strategy

### App Store Submission
- Prepare App Store assets (icons, screenshots)
- Write compelling descriptions
- Set up App Store Connect account
- Configure TestFlight for beta testing

### Google Play Submission
- Prepare Play Store assets
- Configure Play Console
- Set up internal testing tracks
- Plan for staged rollout

### Continuous Integration
- Set up CI/CD pipeline with GitHub Actions
- Automate build process with Expo EAS
- Implement version management
- Set up automated testing

## 14. Project Timeline

### Phase 1: Setup and Infrastructure (2 weeks)
- Set up development environment
- Configure Supabase backend
- Implement authentication
- Create basic navigation structure

### Phase 2: Core Functionality (3 weeks)
- Implement habit creation and tracking
- Develop calendar and progress views
- Create reminders system
- Implement offline storage

### Phase 3: UI Implementation (2 weeks)
- Implement UI based on GitHub design
- Create custom components
- Add animations and transitions
- Ensure cross-platform consistency

### Phase 4: Testing and Refinement (2 weeks)
- Perform unit and integration testing
- Conduct user testing
- Fix bugs and refine features
- Optimize performance

### Phase 5: Deployment (1 week)
- Prepare for App Store and Play Store submission
- Create marketing materials
- Submit for review
- Plan for post-launch updates

## 15. Maintenance Plan

### Updates
- Plan for bi-weekly bug fix releases
- Monthly feature updates
- Quarterly larger updates

### Support
- Set up support email
- Create FAQ section
- Implement crash reporting
- Plan for user feedback collection

### Monitoring
- Set up error tracking
- Monitor performance metrics
- Track user engagement
- Analyze feature usage

## 16. Additional Notes

- The UI implementation will be based on the GitHub design link provided separately.
- All code should follow the established style guide.
- The application should adhere to platform-specific design guidelines where appropriate.
- Performance optimization should be a continuous focus throughout development.
- Security audits should be conducted before major releases.
- User data privacy should be a top priority.

## 17. References

- Source research document used for requirements gathering
- Links to similar applications for reference
- React Native documentation
- Expo documentation
- Supabase documentation