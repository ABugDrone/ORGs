# CASI 360 - Care and Support Initiative 360
## Complete Project Documentation

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Core Features](#core-features)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Module Documentation](#module-documentation)
7. [Installation & Setup](#installation--setup)
8. [Development Guidelines](#development-guidelines)
9. [API Reference](#api-reference)
10. [Security & Data Management](#security--data-management)

---

## Project Overview

### Description
CASI 360 (Care and Support Initiative 360) is a comprehensive enterprise management system designed to streamline organizational operations, reporting, communication, and attendance tracking. The platform provides an intuitive interface that's simple enough for anyone to use while maintaining professional-grade functionality.

### Vision
To create a simplified, intuitive alternative to Microsoft Access that enables organizations to manage their daily operations, reports, communications, and workforce attendance with minimal training required.

### Key Objectives
- Simplify departmental reporting and approval workflows
- Automate attendance tracking with approval mechanisms
- Enable seamless internal communication
- Provide comprehensive administrative controls
- Maintain data integrity through approval systems

---

## Technology Stack

### Frontend Framework
- **React 18.3.1** - Modern UI library for building interactive interfaces
- **TypeScript 5.8.3** - Type-safe JavaScript for robust code
- **Vite 5.4.19** - Fast build tool and development server

### UI & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible component library
- **Radix UI** - Unstyled, accessible component primitives
- **Framer Motion 12.34.3** - Animation library for smooth transitions
- **Lucide React 0.462.0** - Beautiful icon library

### State Management & Data
- **React Context API** - Global state management
- **TanStack Query 5.83.0** - Server state management
- **LocalStorage** - Client-side data persistence

### Routing & Navigation
- **React Router DOM 6.30.1** - Client-side routing with smart URLs

### Rich Text & Editors
- **TipTap 3.20.0** - Extensible rich text editor
- **Canvas API** - Design editor functionality

### Form Handling
- **React Hook Form 7.61.1** - Performant form management
- **Zod 3.25.76** - Schema validation

### Date & Time
- **date-fns 3.6.0** - Modern date utility library
- **React Day Picker 8.10.1** - Flexible date picker

### Additional Libraries
- **Recharts 2.15.4** - Charting library for data visualization
- **Sonner 1.7.4** - Toast notifications
- **cmdk 1.1.1** - Command menu interface

### Development Tools
- **ESLint 9.32.0** - Code linting
- **Vitest 3.2.4** - Unit testing framework
- **Testing Library** - Component testing utilities

---

## System Architecture

### Application Structure
```
casi-360/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── admin/          # Admin panel components
│   │   ├── attendance/     # Attendance system components
│   │   ├── dashboard/      # Dashboard widgets
│   │   ├── layout/         # Layout components
│   │   ├── reports/        # Report components
│   │   ├── search/         # Search functionality
│   │   └── ui/             # Base UI components (shadcn)
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   │   ├── formulas/       # Formula engine
│   │   ├── reports/        # Report utilities
│   │   ├── search/         # Search services
│   │   ├── storage/        # Storage service
│   │   └── validation/     # Validation service
│   ├── pages/              # Page components
│   ├── types/              # TypeScript type definitions
│   └── data/               # Mock data and constants
├── public/                 # Static assets
└── .kiro/                  # Specification documents
    └── specs/              # Feature specifications
```

### Data Flow Architecture
1. **User Interface Layer** - React components with TypeScript
2. **State Management Layer** - Context API for global state
3. **Business Logic Layer** - Custom hooks and services
4. **Data Persistence Layer** - LocalStorage with structured schemas
5. **Routing Layer** - React Router with smart URLs

### Design Patterns
- **Provider Pattern** - Context providers for global state
- **Custom Hooks Pattern** - Reusable logic encapsulation
- **Compound Components** - Complex UI component composition
- **Render Props** - Flexible component rendering
- **Higher-Order Components** - Component enhancement

---

## Core Features

### 1. Authentication & Authorization
- **Multi-role System**: Super Admin, Admin, Manager, User
- **Secure Login**: Email-based authentication
- **Session Management**: Persistent login state
- **Role-based Access Control**: Feature access based on user roles

### 2. Dashboard
- **Personalized Greeting**: Welcome message with user name
- **Department Badge**: Visual department identification
- **Statistics Cards**: Key metrics at a glance
- **Work History Table**: Recent work entries with edit/delete
- **Interactive Calendar**: Date selection with file indicators
- **Attendance Widget**: Quick sign-in/sign-out access
- **File Upload Zone**: Document and video upload
- **Workstation Selector**: Access to Word, Sheet, and Design editors

### 3. Reports Module
#### Report Creation
- **Rich Text Editor**: Format content with styling
- **Period Selection**: Daily, Weekly, Monthly, Quarterly, Annual
- **Tag System**: Categorize reports with custom tags
- **File Attachments**: Upload supporting documents
- **Department Association**: Auto-linked to user's department

#### Report Management
- **Search & Filter**: Find reports by title, content, tags, or period
- **Preview Mode**: View report details before approval
- **Edit Capability**: Modify pending or rejected reports
- **Delete Function**: Remove pending or rejected reports
- **Print Support**: Optimized print layout
- **Download**: Export reports as text files
- **Share via Messaging**: Send report links internally

#### Approval Workflow
- **Pending Status**: New reports await approval
- **Super Admin Review**: Preview and evaluate reports
- **Approve Action**: Lock report from further editing
- **Reject with Feedback**: Provide improvement suggestions
- **Re-submission**: Authors can edit and resubmit rejected reports
- **Approval History**: Track who approved/rejected and when

### 4. Attendance System
#### Employee Features
- **Automatic Sign-In Dialog**: Appears 6 AM - 10 AM on workdays
- **Acknowledgement Checkbox**: Confirm attendance declaration
- **Manual Sign-In**: Dashboard widget for manual entry
- **Late Tracking**: Automatic detection of arrivals after 9:00 AM
- **Sign-Out Dialog**: Appears at 5:00 PM
- **Overtime Management**: Add 1-3 hours of overtime
- **Floating Timer**: Visual countdown during overtime
- **15-Minute Reminders**: Non-intrusive notifications
- **Early Sign-Out**: Option to leave before scheduled time

#### Admin Features
- **Attendance Dashboard**: View all daily attendance records
- **Date Picker**: Historical attendance review
- **Search & Filter**: Find records by name, department, or status
- **Statistics Cards**: Present, On-time, Late, Overtime, Signed-out counts
- **Export to CSV**: Download attendance data
- **Approval System**: Review and approve/reject attendance
- **Rejection Feedback**: Provide reasons for rejection

#### Approval Workflow
- **Pending Status**: All attendance requires approval
- **Super Admin Review**: Evaluate attendance records
- **Approve Action**: Confirm attendance validity
- **Reject with Reason**: Explain attendance issues
- **Approval History**: Track approval actions

### 5. Department Management
#### Structure
- **6 Main Departments**: Configurable department hierarchy
- **Subdepartments**: Nested organizational structure
- **Color Coding**: Visual department identification
- **Department Reports**: Filtered view by department/subdepartment

#### Admin Controls
- **Add Departments**: Create new departments
- **Add Subdepartments**: Create nested structures
- **Delete Departments**: Remove departments (with confirmation)
- **Visual Tree**: Hierarchical department display
- **Department Statistics**: Report counts by period

### 6. User Management
#### User Administration
- **Create Users**: Add new employees
- **Edit Users**: Modify user information
- **Reset Password**: Admin-initiated password reset
- **Delete Users**: Remove user accounts
- **Department Assignment**: Link users to departments
- **Role Assignment**: Set user permissions
- **Bulk Operations**: Manage multiple users

#### User Profiles
- **Profile View**: Display user information
- **Avatar Support**: Custom profile pictures
- **Job Title**: Display user role
- **Department Badge**: Show department affiliation
- **Online Status**: Real-time presence indicator
- **Profile View Tracking**: See who viewed your profile
- **Anonymous Admin Viewing**: Super Admin views without tracking

### 7. Messaging System
#### Features
- **Real-time Messaging**: Instant communication
- **Online-Only Display**: Show only online colleagues
- **Cross-Department**: Message users from all departments
- **Conversation History**: Persistent chat records
- **Unread Badges**: Visual notification indicators
- **File Sharing**: Attach documents to messages
- **Report Sharing**: Send report links via chat
- **User Search**: Find colleagues quickly
- **Profile Access**: Click avatar to view profile
- **Status Indicators**: Online, Away, Offline

#### Message Notifications
- **Unread Count**: Badge in header
- **Real-time Updates**: Instant message delivery
- **Profile View Notifications**: Alert when profile is viewed

### 8. Search Functionality
#### Global Search
- **Universal Search Bar**: Available in header
- **Multi-type Search**: Documents, Reports, Messages
- **Autosuggestions**: Smart search suggestions
- **Recent Searches**: Quick access to previous queries
- **Search Filters**: Refine by type, department, date
- **Result Highlighting**: Matched terms highlighted
- **AI Summary**: Generate summaries of search results

#### Search Features
- **Fuzzy Matching**: Find results with typos
- **Search Caching**: Faster repeat searches
- **URL Management**: Shareable search URLs
- **Search History**: Track search patterns

### 9. Events Calendar
#### Event Management
- **Calendar View**: Visual event display
- **Create Events**: Add new events (permission-based)
- **Event Details**: Title, description, date, time, location
- **View by Date**: Filter events by date
- **Upcoming Events**: List of future events
- **Status Tracking**: Event status management
- **Department Events**: Department-specific events

### 10. Workstation Tools
#### Word Editor
- **Rich Text Editing**: Bold, italic, underline, headings
- **Text Alignment**: Left, center, right, justify
- **Lists**: Bullet and numbered lists
- **Undo/Redo**: Edit history management
- **Save to Storage**: Persist documents

#### Sheet Editor
- **Spreadsheet Grid**: 10x10 cell grid
- **Formula Support**: SUM, AVERAGE, COUNT, MIN, MAX
- **Cell Editing**: Click to edit cells
- **Auto-calculation**: Real-time formula evaluation
- **Save to Storage**: Persist spreadsheets

#### Design Editor
- **Canvas Drawing**: Freehand drawing tool
- **Color Picker**: Custom color selection
- **Brush Size**: Adjustable stroke width
- **Clear Canvas**: Reset drawing
- **Notes Section**: Add text notes
- **Save to Storage**: Persist designs

### 11. Settings & Customization
#### Profile Settings
- **Avatar Upload**: Custom profile picture
- **Personal Information**: View name, email, job title
- **Department Display**: Show department affiliation

#### Security Settings
- **Change Password**: Update user password
- **Password Validation**: Secure password requirements

#### Appearance Settings
- **Theme Color**: Custom color picker
- **Preset Colors**: Quick color selection
- **Theme Persistence**: Save preferences

### 12. Admin Panel
#### Approval Management
- **Attendance Approvals**: Review pending attendance
- **Report Approvals**: Review pending reports (via report detail page)
- **Bulk Actions**: Approve/reject multiple items
- **Feedback System**: Provide rejection reasons

#### System Management
- **Export Settings**: Backup system configuration
- **Import Settings**: Restore from backup
- **Reset to Default**: Restore factory settings
- **System Statistics**: User, department, report counts

---

## User Roles & Permissions

### Super Admin (Master Admin)
**Full System Access**
- View and manage all departments
- Create, edit, delete users
- Approve/reject all attendance records
- Approve/reject all reports
- Access admin panel
- View all reports across departments
- Anonymous profile viewing
- System configuration management
- Export/import system data

### Admin
**Department Management**
- Manage users in assigned department
- View department reports
- Create and manage reports
- Access to department analytics

### Manager
**Team Oversight**
- View team reports
- Create reports
- Manage team communications
- View team attendance

### User (Employee)
**Standard Access**
- Create reports (requires approval)
- Sign in/out attendance (requires approval)
- View approved reports in department
- Send/receive messages
- View events
- Use workstation tools
- Customize personal settings

---

## Module Documentation

### Authentication Module
**Location**: `src/context/AuthContext.tsx`

**Features**:
- User login/logout
- Session persistence
- Role checking (isSuperAdmin, isAdmin)
- User profile updates
- Password management

**Key Functions**:
```typescript
login(email: string, password: string): Promise<void>
logout(): void
updateUser(updates: Partial<User>): void
```

### Reports Module
**Location**: `src/context/ReportsContext.tsx`

**Features**:
- CRUD operations for reports
- Approval workflow
- Period filtering
- Tag management
- File attachments
- Search functionality

**Key Functions**:
```typescript
createReport(data: CreateReportInput): Promise<Report>
updateReport(id: string, data: UpdateReportInput): Promise<Report>
deleteReport(id: string): Promise<void>
approveReport(id: string): Promise<Report>
rejectReport(id: string, reason: string): Promise<Report>
```

### Attendance Module
**Location**: `src/context/AttendanceContext.tsx`

**Features**:
- Sign-in/sign-out tracking
- Overtime management
- Automatic dialogs
- Approval workflow
- Late arrival detection

**Key Functions**:
```typescript
signIn(): void
signOut(overtimeHours?: number): void
addOvertime(hours: number): void
```

### Messaging Module
**Location**: `src/context/MessagesContext.tsx`

**Features**:
- Real-time messaging
- Conversation management
- Online status tracking
- Unread count
- File/report sharing

**Key Functions**:
```typescript
sendMessage(conversationId: string, content: string): void
createConversation(participants: string[], names: string[]): string
markAsRead(conversationId: string): void
getUserStatus(userId: string): UserStatus
```

### Search Module
**Location**: `src/context/SearchContext.tsx`

**Features**:
- Multi-type search
- Autosuggestions
- Search caching
- Result filtering
- AI summarization

**Key Functions**:
```typescript
executeSearch(query: string): void
updateQuery(query: string): void
applyFilters(filters: SearchFilters): void
```

---

## Installation & Setup

### Prerequisites
- Node.js 18+ or Bun runtime
- npm, yarn, or bun package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation Steps

1. **Clone the Repository**
```bash
git clone <repository-url>
cd casi-360
```

2. **Install Dependencies**
```bash
npm install
# or
yarn install
# or
bun install
```

3. **Start Development Server**
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

4. **Access Application**
```
http://localhost:8081
```

### Build for Production
```bash
npm run build
npm run preview
```

### Run Tests
```bash
npm run test
npm run test:watch
```

---

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Write descriptive variable names
- Add comments for complex logic

### Component Structure
```typescript
// 1. Imports
import React from 'react';
import { useContext } from '@/context/...';

// 2. Types/Interfaces
interface ComponentProps {
  // ...
}

// 3. Component
export function Component({ props }: ComponentProps) {
  // 4. Hooks
  const context = useContext();
  const [state, setState] = useState();
  
  // 5. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 6. Handlers
  const handleAction = () => {
    // ...
  };
  
  // 7. Render
  return (
    // JSX
  );
}
```

### State Management
- Use Context API for global state
- Use local state for component-specific data
- Implement custom hooks for reusable logic
- Keep state as close to usage as possible

### Styling Guidelines
- Use Tailwind utility classes
- Follow mobile-first approach
- Maintain consistent spacing
- Use theme colors from design system
- Implement dark mode support

---

## API Reference

### LocalStorage Schema

#### Users
```typescript
Key: 'users'
Value: User[]

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin' | 'manager' | 'user';
  departmentId: string;
  subdepartmentId?: string;
  jobTitle: string;
  avatar?: string;
  themeColor?: string;
}
```

#### Reports
```typescript
Key: 'casi360_reports'
Value: { reports: Report[], lastSync: string }

interface Report {
  id: string;
  title: string;
  content: string;
  period: Period;
  departmentId: string;
  subdepartmentId?: string;
  authorId: string;
  authorName: string;
  tags: string[];
  attachments: FileAttachment[];
  createdAt: string;
  updatedAt: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}
```

#### Attendance
```typescript
Key: 'attendance_records'
Value: AttendanceRecord[]

interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userJobTitle: string;
  userDepartment: string;
  date: string;
  signInTime: string;
  signOutTime?: string;
  overtimeHours: number;
  status: 'signed-in' | 'signed-out' | 'overtime';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}
```

#### Messages
```typescript
Key: 'conversations'
Value: Conversation[]

interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

Key: 'messages_{conversationId}'
Value: Message[]

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}
```

---

## Security & Data Management

### Data Security
- **Client-side Storage**: All data stored in browser LocalStorage
- **No Backend**: Fully client-side application
- **Session Management**: Persistent login state
- **Password Hashing**: Passwords stored securely (in production, use proper hashing)

### Data Persistence
- **LocalStorage**: Primary data storage
- **Automatic Sync**: Changes saved immediately
- **Export/Import**: Backup and restore functionality
- **Data Validation**: Input validation before storage

### Privacy Features
- **Profile View Tracking**: Users notified of profile views
- **Anonymous Admin**: Super Admin can view profiles anonymously
- **Online Status**: Real-time presence indicators
- **Message Privacy**: Conversations only visible to participants

### Best Practices
1. **Regular Backups**: Export system settings regularly
2. **Data Validation**: Validate all user inputs
3. **Error Handling**: Graceful error recovery
4. **User Feedback**: Clear success/error messages
5. **Audit Trail**: Track approval actions with timestamps

---

## Demo Accounts

### Super Admin
- **Email**: super_admin@casi360.com
- **Password**: admin123
- **Access**: Full system access

### Department Managers
1. **IT Support**: tunde.bakare@casi360.com / password123
2. **HR**: amaka.obi@casi360.com / password123
3. **Finance**: kwame.mensah@casi360.com / password123
4. **Operations**: fatima.hassan@casi360.com / password123
5. **Marketing**: john.doe@casi360.com / password123
6. **Customer Service**: jane.smith@casi360.com / password123

---

## Deployment

### Production Build
```bash
npm run build
```

### Deployment Options
1. **Static Hosting**: Netlify, Vercel, GitHub Pages
2. **CDN**: Cloudflare, AWS CloudFront
3. **Traditional Hosting**: Apache, Nginx

### Environment Configuration
- Configure base URL in `vite.config.ts`
- Set environment variables for production
- Optimize build for performance

---

## Support & Maintenance

### Troubleshooting
- Clear browser cache if issues occur
- Check browser console for errors
- Verify LocalStorage is enabled
- Ensure JavaScript is enabled

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance Optimization
- Lazy loading for routes
- Code splitting
- Image optimization
- Caching strategies

---

## Future Enhancements

### Planned Features
1. Backend API integration
2. Real-time WebSocket communication
3. Advanced analytics dashboard
4. Mobile application
5. Email notifications
6. Document version control
7. Advanced reporting tools
8. Integration with external systems

### Scalability Considerations
- Database migration from LocalStorage
- API development
- Authentication service
- File storage service
- Notification service

---

## License & Credits

### Project Information
- **Project Name**: CASI 360
- **Version**: 1.0.0
- **Description**: Care and Support Initiative 360 - Enterprise Management System

### Technologies Used
- React, TypeScript, Vite
- Tailwind CSS, shadcn/ui, Radix UI
- TanStack Query, React Router
- Framer Motion, Lucide Icons
- date-fns, TipTap

---

## Contact & Support

For technical support, feature requests, or bug reports, please contact the development team.

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-26  
**Maintained By**: CASI 360 Development Team
