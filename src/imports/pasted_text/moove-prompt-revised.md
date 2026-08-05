
Expanded Master Development Prompt — MOOVE (MVP Revision v2)
Act as an internationally recognized Senior Full-Stack Software Engineer, Frontend Engineer, Backend Engineer, UI/UX Designer, Product Designer, Human-Computer Interaction (HCI) Specialist, Mobile App Architect, Preventive Health Technology Expert, and AI Product Engineer with over 20 years of experience building award-winning healthcare applications, startup MVPs, SaaS platforms, AI-powered systems, and human-centered digital experiences.
Your responsibility is not only to write code, but to design and build a production-quality MVP that demonstrates an exceptional user experience, clear preventive-health workflow, scalable architecture, polished UI, and realistic application behavior suitable for hackathons, academic capstone demonstrations, startup presentations, and investor showcases.
________________________________________
PROJECT
MOOVE
Tagline
Small Movements. Healthier Journeys.
MOOVE is a preventive health application designed specifically for private four-wheel vehicle drivers in the Philippines. The app encourages safe, guided micro-movement exercises during appropriate driving breaks (traffic, parked, gas stations, rest stops, before driving, after driving) to reduce prolonged sedentary behavior.
The application does NOT encourage exercising while the vehicle is moving. Every intervention must prioritize driver safety.
________________________________________
PRIMARY OBJECTIVE
Build a polished MVP that demonstrates the complete preventive health journey:
•	Authentication
•	Driving session tracking
•	Sedentary monitoring
•	Smart break reminders
•	Guided exercise system
•	Personalized exercise settings
•	AI-generated health summaries
•	Dashboard analytics
•	Health education
•	User feedback
•	Demo/testing tools
Every feature should feel complete and interconnected.
________________________________________
DESIGN REQUIREMENTS
Hero Section (Landing Page)
Redesign the Hero Section to better emphasize MOOVE's mascot ("Moo").
Layout
Instead of a balanced 50/50 split:
Use approximately:
•	Left Side: 40%
•	Right Side: 60%
The right side should visually dominate because it showcases the Moo mascot and immediately communicates the product's identity.
The mascot should become the primary visual focal point.
Improve the Hero
The hero should include:
•	Large Moo illustration
•	Floating health elements
•	Floating exercise icons
•	Motion indicators
•	Soft gradients
•	Preventive health illustrations
•	Friendly modern healthcare aesthetic
The hero should feel energetic, approachable, and memorable.
________________________________________
FEEDBACK & VALIDATION MODULE REVISION
The application is intended only for private four-wheel vehicle drivers.
Therefore:
Remove:
•	Motorcycle
•	Scooter
•	Bicycle
•	Two-wheel vehicles
Vehicle selection should include only examples such as:
•	Sedan
•	SUV
•	Hatchback
•	Pickup
•	Van
•	MPV
•	Crossover
•	Other Four-Wheel Vehicle
Validation questions should reflect this target audience throughout the application.
________________________________________
GUIDED EXERCISES — USER CUSTOMIZATION
The Guided Exercise feature should be significantly more flexible and personalized.
Instead of fixed exercise durations, allow users to fully customize how they perform each exercise.
Each exercise should support configurable settings such as:
Number of Sets
Provide quick preset options:
•	1 Set
•	2 Sets
•	3 Sets
•	5 Sets
Also allow:
Custom Input
Example:
Sets:
[ 4 ]
________________________________________
Number of Repetitions
Preset buttons:
•	5
•	8
•	10
•	12
•	15
or
Custom value.
________________________________________
Exercise Duration
For time-based exercises:
Preset options:
•	15 seconds
•	20 seconds
•	30 seconds
•	45 seconds
•	60 seconds
or
Custom duration.
Example:
Duration

15 sec
30 sec
45 sec

Custom:
[ 40 ]
________________________________________
Rest Duration
Users should also configure resting time between sets.
Suggested presets:
•	5 sec
•	10 sec
•	15 sec
•	20 sec
•	30 sec
or
Custom value.
________________________________________
Exercise Preview
Before starting:
Display:
Exercise Name
Target Body Part
Estimated Total Time
Selected Sets
Selected Repetitions
Rest Duration
Difficulty
Safety Reminder
Example:
Neck Stretch

Target:
Neck & Upper Trapezius

Sets:
3

Duration:
30 sec

Rest:
10 sec

Estimated Total:
2 mins

Ready?

Start Exercise
________________________________________
During Exercise
Include:
Countdown timer
Current set
Current repetition
Rest countdown
Pause
Resume
Skip
Restart
Progress indicator
Completion animation
________________________________________
DRIVING SESSION CUSTOMIZATION
The Driving Session should be much smarter and more user-controlled.
Instead of a fixed reminder every 60 minutes, allow users to define when they want movement reminders.
Reminder Interval
Suggested presets:
•	Every 20 minutes
•	Every 30 minutes
•	Every 45 minutes
•	Every 60 minutes
•	Every 90 minutes
or
Custom interval.
Example:
Next Reminder

20 mins

30 mins

45 mins

60 mins

Custom:
[ 35 ]
________________________________________
Break Types
Allow users to choose where reminders should appear.
Examples:
✓ Heavy Traffic
✓ Parked Vehicle
✓ Gas Station
✓ Rest Stop
✓ Before Driving
✓ After Driving
✓ Manual Break
Users may enable multiple break contexts.
________________________________________
Reminder Behavior
Users can customize whether MOOVE should:
•	Automatically recommend an exercise when a reminder triggers
•	Ask the user first before showing recommendations
•	Only display a notification
•	Stay silent until manually opened
________________________________________
Exercise Recommendation Popup
When the reminder interval is reached and the driver is safely stationary, display a contextual recommendation.
Example:
You've been seated for 30 minutes.

If your vehicle is safely stationary, consider a quick movement break.

Recommended Exercises

• Neck Stretch
• Shoulder Rolls
• Guided Breathing
• Wrist Stretch

Choose an exercise or skip this reminder.
The popup should provide:
•	Exercise cards
•	Duration
•	Difficulty
•	Target muscle group
•	Estimated completion time
•	"Start Now" button
•	"Remind Me Later"
•	"Skip"
________________________________________
EXERCISE GUIDANCE DURING DRIVING SESSION
Once the user accepts an exercise recommendation:
MOOVE should guide them step-by-step.
Flow:
Reminder Trigger
↓
Exercise Recommendation
↓
User Chooses Exercise
↓
Exercise Preview
↓
Countdown
↓
Animated Demonstration (GIF, MP4, or Lottie)
↓
Live Progress
↓
Rest Timer (if applicable)
↓
Completion Screen
↓
Save Exercise History
↓
Resume Driving Session
This ensures users always understand what to do and when.
________________________________________
DEMO MODE (FOR FAST TESTING)
To simplify demonstrations and speed up testing, implement a dedicated Demo Mode.
This mode should allow developers, evaluators, and judges to instantly simulate long driving sessions without waiting in real time.
Include a visible Developer Testing Panel (accessible only in Demo Mode) with quick simulation buttons.
Demo Controls
•	Simulate 20 Minutes
•	Simulate 30 Minutes
•	Simulate 45 Minutes
•	Simulate 60 Minutes
•	Simulate 90 Minutes
•	Simulate 2 Hours
When clicked:
•	Advance the driving timer instantly
•	Update sedentary duration
•	Trigger reminder logic
•	Display the appropriate recommendation popup
•	Update dashboard statistics
•	Save demo session events if desired
Example:
Developer Testing Panel

[ +20 mins ]
[ +30 mins ]
[ +45 mins ]
[ +60 mins ]
[ +90 mins ]
[ +120 mins ]
This feature is strictly for testing and should be disabled or hidden outside Demo Mode.
________________________________________
REVISED OVERALL USER FLOW
USER LOGS IN
        │
        ▼
Supabase Authentication
        │
        ▼
Home Dashboard
        │
        ▼
Configure Driving Session
        │
        ├── Reminder Interval
        ├── Break Types
        ├── Notification Preferences
        └── Exercise Defaults
        │
        ▼
Start Driving
        │
        ▼
Driving Timer Starts
        │
        ▼
Sedentary Time Recorded
        │
        ▼
Reminder Interval Reached?
        │
      YES
        │
        ▼
If Vehicle is Safely Stationary
        │
        ▼
Generate Smart Exercise Recommendation
        │
        ▼
Recommendation Popup
        │
 ┌───────────────┴───────────────┐
 │                               │
Continue Driving         Perform Exercise
 │                               │
 │                      Exercise Preview
 │                               │
 │                    Guided Animation
 │                               │
 │                  Countdown & Progress
 │                               │
 │                     Complete Exercise
 │                               │
 │                  Save Exercise History
 └───────────────┬───────────────┘
                 │
                 ▼
Continue Driving Session
                 │
                 ▼
End Driving Session
                 │
                 ▼
Save Driving Session Data
                 │
                 ▼
AI Health Summary Generated
                 │
                 ▼
Dashboard Analytics Updated
                 │
                 ▼
Read Health Education
                 │
                 ▼
Submit User Feedback
                 │
                 ▼
Done
________________________________________
EXAMPLE USER SCENARIO (UPDATED)
1.	User logs into MOOVE.
2.	User configures reminder interval (e.g., every 30 minutes).
3.	User enables reminders for Heavy Traffic and Parked Vehicle.
4.	User starts a driving session.
5.	After 30 minutes, a recommendation is prepared.
6.	Once the phone detects the vehicle is safely stationary (using GPS, accelerometer, gyroscope, and inactivity heuristics), MOOVE displays a popup.
7.	User selects a recommended exercise.
8.	User customizes sets, repetitions, duration, and rest if desired.
9.	MOOVE guides the user through the exercise with animations and timers.
10.	Completion is saved to history.
11.	The driving session resumes automatically.
12.	At the end of the trip, the session is saved, AI generates a behavioral summary, dashboard metrics are refreshed, and the user can review education content and submit feedback.
________________________________________
DEVELOPMENT PHASES (UPDATED)
Phase	Feature	Technology	Purpose
1	Authentication	Next.js + Supabase Auth	User login and role-based access
2	Driving Session Tracking	React Hooks + Supabase	Track trips and sedentary duration
3	Configurable Reminder Engine	Next.js Logic	User-defined reminder intervals and break preferences
4	Guided Exercises	Lottie / GIF / MP4 + Supabase Storage	Interactive micro-movement coaching
5	Exercise Personalization	React Forms + Supabase	Sets, repetitions, duration, and rest customization
6	AI Recommendations	Groq API + Llama Models	Personalized preventive health guidance
7	Dashboard Analytics	Recharts	Visualize user progress
8	Health Education	JSON + Next.js	Preventive health learning resources
9	Feedback & Validation	Supabase	Collect usability and validation data
10	Demo & Testing Mode	React State + Developer Utilities	Instantly simulate driving sessions for testing
11	Deployment	Vercel	Production-ready deployment
________________________________________
FINAL IMPLEMENTATION REQUIREMENTS
Ensure the MVP is polished, responsive, accessible, and cohesive.
•	Responsive across desktop, tablet, and mobile devices.
•	Consistent modern design system with the MOOVE brand identity.
•	Smooth animations and transitions.
•	Clear preventive health messaging focused on safe, stationary exercise only.
•	Fully functional role-based authentication and dashboards.
•	Configurable driving reminders and exercise preferences.
•	Rich guided exercise experience with animations, timers, and progress tracking.
•	AI-generated summaries and recommendations that remain educational and non-diagnostic.
•	Dashboard analytics with meaningful visualizations.
•	Demo Mode with instant time simulation controls for efficient testing and presentations.
•	Restrict the target audience and validation flows to private four-wheel vehicle drivers only.
•	Build the codebase using scalable, modular architecture with reusable components, clean folder structure, TypeScript best practices, and production-ready coding standards.

Add the following section to your master prompt. It integrates cleanly with the rest of your specifications while preserving the current landing page and driver-focused experience.
________________________________________
ADMIN RESEARCH DASHBOARD (ROLE-BASED ACCESS)
Implement a strict Role-Based Access Control (RBAC) system using Supabase Authentication and database policies.
The application has two roles:
•	Driver (Primary End User)
•	Administrator / Researcher (Research & System Management)
The Driver is the primary audience of the application. The landing page, branding, messaging, navigation, onboarding, and all user-facing content must remain 100% focused on private four-wheel vehicle drivers.
Do NOT modify the landing page to mention administrators, researchers, or system management. The public-facing website should continue to present MOOVE as a preventive health application designed for drivers only.
________________________________________
ROLE-BASED ACCESS
Driver Role
Drivers should only have access to features related to their own preventive health journey, including:
•	Home Dashboard
•	Start Driving Session
•	Guided Exercises
•	Exercise History
•	AI Health Recommendations
•	Driving History
•	Dashboard Analytics
•	Preventive Health Education
•	Personal Profile
•	Personal Settings
•	Feedback Submission
Drivers must NOT have access to:
•	Research Dashboard
•	Research Analytics
•	Aggregate User Statistics
•	Participant Management
•	System Administration
•	Database Management
•	Admin Reports
•	Validation Analytics
•	User Management
Attempting to access any admin route should redirect the user to an Unauthorized (403) page or back to their Driver Dashboard.
________________________________________
Administrator Role
The Administrator Dashboard is intended only for researchers, evaluators, supervisors, or authorized project administrators.
The Admin Dashboard should never be accessible from the Driver interface.
Administrators should have access to:
Research Dashboard
•	Total Registered Drivers
•	Active Drivers
•	Completed Driving Sessions
•	Total Exercises Completed
•	Average Driving Duration
•	Average Sedentary Duration
•	Average Exercise Completion Rate
•	Reminder Acceptance Rate
•	Reminder Dismissal Rate
•	Daily Active Users
•	Weekly Active Users
•	Monthly Active Users
________________________________________
Research Analytics
Interactive dashboards using Recharts displaying:
•	Daily Driving Duration
•	Weekly Driving Duration
•	Monthly Driving Duration
•	Sedentary Trends
•	Exercise Completion Trends
•	Reminder Trigger Frequency
•	Reminder Acceptance vs Skip Rate
•	Most Performed Exercises
•	Exercise Popularity
•	Driving Session Frequency
•	User Retention
•	Weekly Movement Streak Distribution
________________________________________
Participant Management
Administrators can:
•	View registered participants
•	Search users
•	Filter users
•	View participant profiles
•	View driving history
•	View exercise history
•	Export research data (CSV)
•	Filter by date range
Administrators should not edit participants' health records. Their access is intended for monitoring and research purposes only.
________________________________________
Feedback & Validation Analytics
Display:
•	Total Feedback Submitted
•	Average Satisfaction Score
•	SUS (System Usability Scale) Results (if implemented)
•	Most Common Suggestions
•	Common Issues Reported
•	Feature Usage Statistics
•	Device Information
•	Browser Statistics
Provide charts and tables to help researchers evaluate the prototype.
________________________________________
Demo Monitoring
Administrators should also be able to view:
•	Demo Sessions
•	Simulated Driving Sessions
•	Simulated Reminder Triggers
•	Demo Exercise Completions
This helps distinguish real participant activity from testing data.
________________________________________
AI Research Insights
Provide aggregate AI-generated summaries such as:
•	Most active driving periods
•	Average sedentary time across participants
•	Most effective exercise recommendations
•	Frequently skipped reminders
•	Overall engagement metrics
•	Weekly behavioral trends
These insights should be aggregated and anonymized. They should never expose personally identifiable health information.
________________________________________
NAVIGATION (ROLE-BASED)
Driver Navigation
•	Home
•	Driving Session
•	Exercises
•	Dashboard
•	Education
•	Feedback
•	Profile
No Admin links should appear.
________________________________________
Administrator Navigation
•	Research Dashboard
•	Participants
•	Analytics
•	Feedback
•	Reports
•	Demo Monitoring
•	Settings
Administrators do not need access to the public landing page after signing in.
________________________________________
AUTHENTICATION FLOW
Maintain Supabase Authentication with role-based redirects.
Driver
Driver Login
↓
Driver Dashboard
Administrator
Admin Login
↓
Research Dashboard
The application should automatically redirect users to the appropriate dashboard based on their assigned role.
________________________________________
DEMO ACCOUNTS
Provide working demo credentials for both roles.
Driver Demo Account
Email:
driver@moove.app
Password:
Driver123!
Redirect to:
Driver Dashboard
________________________________________
Administrator Demo Account
Email:
admin@moove.app
Password:
Admin123!
Redirect to:
Research Dashboard
________________________________________
DATABASE DESIGN
Include a role field for each user.
Example:
profiles
---------
id
email
full_name
role
created_at
Allowed values:
driver
admin
Enforce role validation using Supabase Row-Level Security (RLS) policies to prevent unauthorized access to admin resources.
________________________________________
SECURITY REQUIREMENTS
•	Implement middleware to protect all admin routes.
•	Prevent direct URL access to admin pages by drivers.
•	Protect all admin API endpoints with server-side role validation.
•	Hide all admin navigation and components from driver accounts.
•	Restrict research dashboards and participant analytics to admin users only.
________________________________________
IMPORTANT DESIGN CONSTRAINT
The Driver remains the only public-facing user of the application.
•	Do not redesign the landing page.
•	Do not add administrator-related content to the homepage.
•	Do not change the branding, messaging, or navigation intended for drivers.
•	The Administrator role exists solely for authenticated research, monitoring, evaluation, and prototype management after login.
This ensures MOOVE maintains a clean, driver-centric user experience while still providing a robust research dashboard for project supervisors, faculty advisers, and evaluators.

