________________________________________
Act as a Senior Software Architect, Full-Stack Engineer, Database Architect, Backend Engineer, Frontend Engineer, UI/UX Designer, DevOps Engineer, and QA Engineer.
Your task is to perform a complete technical audit, debugging, database migration, architecture review, documentation, and restoration of my entire application.
Do NOT make assumptions. Analyze every file in the project before making any modifications.
________________________________________
Phase 1 — Complete Project Analysis
Analyze the entire project source code, including but not limited to:
•	Frontend
•	Backend
•	Database
•	API routes
•	Components
•	Context Providers
•	Authentication
•	Middleware
•	Utilities
•	Services
•	Hooks
•	Assets
•	Configuration files
•	Environment variables
•	Build configuration
•	Vercel configuration
•	Package dependencies
•	TypeScript types/interfaces
•	SQL files
•	JSON files
•	Static assets
•	Routing
•	State management
•	Storage
•	AI integrations
•	External APIs
•	Admin panel
•	User panel
•	Driving session module
•	Dashboard
•	Analytics
•	Notifications
•	Resources
•	Exercise Library
•	AI Insights
•	Feedback Module
•	Settings
•	Every existing feature
After analyzing the project, provide a report containing:
•	Complete project architecture
•	Existing technologies used
•	Folder responsibilities
•	Data flow
•	Authentication flow
•	API flow
•	Database flow
•	Missing features
•	Broken features
•	Dead code
•	Duplicate code
•	Unused files
•	Missing imports
•	Circular dependencies
•	Missing environment variables
•	Incorrect configurations
•	Security concerns
•	Performance issues
•	Build issues
________________________________________
Phase 2 — Debug the White Screen Issue
The application currently loads only a white blank screen.
Completely investigate and identify the exact cause.
Check everything including:
•	Console errors
•	Runtime errors
•	TypeScript errors
•	React rendering issues
•	Routing
•	React Router
•	Context Providers
•	Authentication initialization
•	Firebase/Supabase initialization
•	Missing environment variables
•	Import/export errors
•	Lazy loading
•	Suspense
•	Component crashes
•	Invalid hooks
•	Infinite loops
•	API failures
•	Build configuration
•	Vite configuration
•	Tailwind configuration
•	Missing assets
•	Missing dependencies
•	Version incompatibilities
•	React version compatibility
•	npm dependency conflicts
Fix every issue until the application runs successfully.
The application should:
•	run locally without errors
•	build successfully
•	run in development mode
•	run in production
•	deploy successfully to Vercel
•	display all pages correctly
•	have zero white screen issues
________________________________________
Phase 3 — Supabase Database Design
Analyze every file and determine which data belongs in the database.
Create a proper production-ready Supabase PostgreSQL database.
Do not create unnecessary tables.
Instead, derive the database schema directly from the application's features.
The schema should properly support:
Authentication
•	Users
•	Roles
•	Permissions
•	Sessions
User Profile
•	Personal information
•	Preferences
•	Reminder settings
•	Accessibility settings
•	Theme settings
•	Notification settings
Driving
•	Driving Sessions
•	Session history
•	Driving analytics
•	Driving scores
•	Session duration
•	Driving statistics
Exercise Library
•	Categories
•	Exercises
•	Videos
•	Instructions
•	Difficulty
•	Target body area
Health
•	Health metrics
•	Daily logs
•	Stretch reminders
•	Wellness records
Dashboard
•	Dashboard statistics
•	Aggregated metrics
•	Progress
AI Insights
•	AI recommendations
•	Generated reports
•	AI history
Sedentary Monitor
•	Monitoring logs
•	Alerts
•	Detection history
Resources
•	Educational resources
•	Articles
•	Videos
•	Categories
Learn
•	Learning modules
•	Lessons
•	Progress
•	Completion records
Feedback
•	User feedback
•	Survey responses
•	Ratings
•	Suggestions
Notifications
•	User notifications
•	Reminder schedules
•	Notification history
Administration
•	Admin accounts
•	User management
•	Analytics
•	Feedback management
•	Reports
•	Audit logs
•	System logs
AI Features
Store any generated AI data that should persist.
________________________________________
Phase 4 — Database Migration
Migrate the application so that it fully uses Supabase.
Replace hardcoded data where appropriate.
Connect every required page to the database.
Ensure:
•	CRUD operations work correctly
•	Foreign keys are properly defined
•	Constraints are added
•	Indexes are optimized
•	Cascade rules are correct
•	Normalization is appropriate
•	Relationships are correctly established
Create:
•	SQL migration scripts
•	CREATE TABLE statements
•	Indexes
•	Foreign keys
•	Views (if beneficial)
•	Row Level Security (RLS) policies
•	Storage buckets (if needed)
•	Seed data
•	Sample records
The final database should be production-ready.
________________________________________
Phase 5 — Restore Missing Functionality
Identify every feature that is incomplete, broken, disconnected, or only partially implemented.
Restore and fully integrate each feature.
Ensure every tab is fully functional, including:
•	🏠 Home
•	🚗 Driving Session
•	📖 Exercise Library
•	💙 Health Dashboard
•	🤖 AI Insights
•	📊 Sedentary Monitor
•	📚 Learn
•	⚙️ Profile & Settings
•	📝 Feedback
•	🔔 Notifications
•	👨‍💼 Admin Dashboard
Every button, form, modal, navigation item, API request, and database interaction must work correctly.
________________________________________
Phase 6 — Code Refactoring
Improve the entire codebase by:
•	Removing duplicate code
•	Removing unused code
•	Fixing folder organization
•	Improving naming conventions
•	Improving readability
•	Improving maintainability
•	Splitting overly large files
•	Improving reusable components
•	Improving custom hooks
•	Improving services
•	Improving API layers
•	Improving state management
Follow modern best practices.
________________________________________
Phase 7 — Performance Optimization
Optimize:
•	React rendering
•	Database queries
•	API requests
•	Lazy loading
•	Images
•	Assets
•	Bundle size
•	Caching
•	Code splitting
•	Memoization
•	Suspense
•	Route loading
The application should be production optimized.
________________________________________
Phase 8 — Security Review
Audit the project for security issues.
Verify:
•	Authentication
•	Authorization
•	Protected routes
•	API validation
•	SQL injection prevention
•	XSS prevention
•	CSRF protection (where applicable)
•	Secure environment variable handling
•	Input validation
•	File upload security
•	RLS policies
•	Least-privilege database access
Fix all identified issues.
________________________________________
Phase 9 — Testing & Verification
Verify that:
•	Every page loads correctly
•	Every route works
•	Every form submits correctly
•	Every CRUD operation works
•	Authentication works
•	Authorization works
•	Supabase integration works
•	AI features work
•	Notifications work
•	Admin features work
•	User features work
•	Mobile responsiveness is maintained
•	No console errors remain
•	No TypeScript errors remain
•	No build warnings remain
•	No runtime errors remain
The application should compile and run successfully with zero critical issues.
________________________________________
Phase 10 — Comprehensive Documentation
After completing all fixes, generate a professional README.md.
The README should include:
Project Overview
•	Project name
•	Description
•	Objectives
•	Key capabilities
Tech Stack
•	Frontend
•	Backend
•	Database
•	AI
•	Authentication
•	Deployment
•	Libraries
•	APIs
System Architecture
Explain how every major module communicates.
Folder Structure
Provide a detailed tree of the entire project, describing the purpose of every important directory and file.
Database Architecture
Document:
•	Every table
•	Every column
•	Primary keys
•	Foreign keys
•	Relationships
•	Indexes
•	RLS policies
•	Storage buckets
Features
Separate documentation for:
User Side
Describe every tab and feature in detail, including:
•	🏠 Home
•	🚗 Driving Session
•	📖 Exercise Library
•	💙 Health Dashboard
•	🤖 AI Insights
•	📊 Sedentary Monitor
•	📚 Learn
•	⚙️ Profile & Settings
•	🔔 Notifications
•	📝 Feedback
Admin Side
Document:
•	Dashboard
•	User Management
•	Analytics
•	Reports
•	Feedback Management
•	System Monitoring
•	Settings
•	Audit Logs
Installation
Step-by-step instructions for:
•	Clone repository
•	Install dependencies
•	Configure environment variables
•	Set up Supabase
•	Run SQL migrations
•	Start development server
•	Run backend
•	Build production
•	Deploy to Vercel
Environment Variables
Document every required .env variable with descriptions (without exposing secrets).
API Documentation
Document every endpoint, including request and response formats where applicable.
Database Schema
Include an Entity Relationship (ER) overview and explain how the tables relate to each other.
Troubleshooting
Document common issues, including the white screen problem, and how they were resolved.
Future Improvements
Suggest enhancements for scalability, maintainability, security, accessibility, and performance.
________________________________________
Final Deliverables
Provide the following in order:
1.	Complete project audit report.
2.	Root cause analysis of the white screen issue.
3.	Detailed list of all fixes made.
4.	Production-ready Supabase schema and SQL migration scripts.
5.	Updated application integrated with Supabase.
6.	Refactored and optimized codebase.
7.	Fully functioning application (development and production).
8.	Comprehensive README.md.
9.	Summary of all changes made, grouped by frontend, backend, database, security, performance, and documentation.
10.	A final verification checklist confirming that every feature, tab, route, database interaction, and deployment target has been tested and is working correctly.

Note as well here is my:
MOOVE_PUBLIC_SUPABASE_URL=https://zgthueozpynxuggjtpmw.supabase.co

MOOVE_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_Y4unxjKVs0Lsya1fNyIqbQ_PGQstI3S

Also, double check I already connected my supabase in this figma project so I want you to connect it up and make database on it.
