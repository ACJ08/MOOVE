Expanded Prompt
Act as an expert Senior Full-Stack Software Engineer, Frontend Engineer, Backend Engineer, Database Architect, Supabase Expert, UI/UX Designer, React/Next.js Developer, TypeScript Developer, and Software Architect.
Your goal is to transform my project into a fully functional, production-ready application. Do not create mock implementations unless absolutely necessary. Preserve all existing functionality while improving the application architecture, maintainability, responsiveness, accessibility, and performance.
Analyze the entire codebase before making any changes. Identify every related component, page, route, hook, service, utility, API, database interaction, and UI element that must be updated. Do not implement isolated fixes—ensure every modification is integrated consistently throughout the application.
________________________________________
PART 1 — Fully Functional Exercise Library Video Integration
I have an exercise demonstration video named:
Chin Tucks Sample.mp4
I want this video system to be completely integrated into the Exercise Library.
Requirements
Whenever the user opens any exercise in the Exercise Library:
•	Display the exercise demonstration video at the top.
•	The video should:
o	autoplay immediately
o	be muted
o	loop continuously
o	restart automatically whenever the user opens another exercise
o	preload smoothly
o	be responsive on all screen sizes
o	preserve aspect ratio
o	use rounded corners
o	include a loading skeleton while loading
o	gracefully handle video loading errors
o	pause when leaving the page
o	resume when returning
Use the current "Chin Tucks Sample.mp4" as the placeholder demonstration video for every exercise until I replace them with their respective videos later.
Design the player professionally, similar to modern fitness applications.
________________________________________
Exercise Detail Page
Every exercise page should look similar to:
UPPER BODY EXERCISE

Chin Tucks

[Autoplay Video]

Duration: 45s
Sets: 2
Rest: 15s
Difficulty: Easy

Recommended
2 Sets × 45s
Rest 15s between sets

SAFE CONTEXTS
✅ In Traffic
✅ Parked
✅ Before Driving
✅ After Driving

TARGET MUSCLES
Deep cervical flexors
Longus capitis
Longus colli
Suboccipital complex

BENEFITS
✓ Reduces neck tension
✓ Improves cervical posture
✓ Decreases forward head syndrome
✓ Relieves suboccipital pressure

WHY DRIVERS NEED IT
...

KEY INSTRUCTION
...

Exercises are performed during your Driving Session
Design this section professionally with:
•	modern cards
•	proper spacing
•	icons
•	subtle animations
•	responsive layout
•	accessible typography
•	clean hierarchy
________________________________________
PART 2 — Exercise Preview Before Configuration
Before the user reaches the Configure Exercise screen, create an Exercise Preview screen.
The preview should appear first.
Example:
Before you begin:

Ensure your vehicle is completely stationary.
Never perform exercises while driving.

[Autoplay Video]

Chin Tucks

Neck
Easy
45 seconds

TARGET MUSCLES
...

WHY DRIVERS NEED IT
...

BENEFITS
...

STEP BY STEP
1.
2.
3.
4.

[Configure Exercise]
Requirements:
•	video autoplay
•	muted
•	loop
•	responsive
•	restart whenever another exercise is selected
•	attractive card layout
•	animation when opened
•	loading placeholder
•	fallback if video fails
Only after the user reviews this preview should they proceed to:
Configure Exercise
________________________________________
PART 3 — Apply This to ALL Exercise Categories
Do NOT implement this only for Chin Tucks.
Integrate the same reusable template for:
•	Warm-Up Exercises
•	Break Exercises
•	Stop Exercises
•	Cool-Down Exercises
•	Upper Body
•	Lower Body
•	Neck
•	Shoulder
•	Wrist
•	Back
•	Any future exercises
The implementation should be component-based and reusable.
Avoid duplicated code.
Create reusable:
•	ExerciseVideo component
•	ExercisePreview component
•	ExerciseDetails component
•	ExerciseStats component
•	ExerciseBenefits component
•	ExerciseInstruction component
•	ExerciseSafeContexts component
•	ExerciseConfiguration component
The entire Exercise Library should use the same reusable architecture.
________________________________________
PART 4 — UX Improvements
Improve the Exercise Library UX by adding:
•	smooth transitions
•	fade animations
•	skeleton loading
•	hover effects
•	touch-friendly mobile layout
•	responsive tablet layout
•	desktop optimization
•	consistent spacing
•	accessible colors
•	proper empty states
•	loading states
•	error states
•	success states
________________________________________
PART 5 — Analyze Entire Application
After completing the exercise module, perform a comprehensive audit of my entire application.
Analyze:
•	all frontend pages
•	backend APIs
•	services
•	database calls
•	hooks
•	utilities
•	authentication
•	protected routes
•	admin pages
•	driver pages
•	notification system
•	settings
•	reminders
•	exercise history
•	analytics
•	reports
•	dashboard
•	onboarding
•	profile
•	achievements
•	preferences
•	session management
•	storage
•	uploads
•	Supabase integration
Identify:
•	mock implementations
•	temporary data
•	hardcoded values
•	missing CRUD operations
•	disconnected UI
•	unfinished features
•	missing API integrations
•	duplicate logic
•	performance bottlenecks
•	missing validations
•	missing database synchronization
•	missing security
•	missing Row Level Security (RLS)
•	missing indexes
•	inconsistent naming
Produce a report listing:
1.	Existing functionality
2.	Missing functionality
3.	Features requiring Supabase integration
4.	Recommended database tables
5.	API endpoints required
6.	Files requiring modification
7.	Files requiring creation
8.	Architecture improvements
9.	Performance improvements
10.	Security improvements
________________________________________
PART 6 — Complete Supabase Integration
My Supabase project is already created.
Project Name:
MOOVE Project
I want the application to become fully database-driven using Supabase.
Analyze every feature and determine what should be stored inside Supabase.
Cover both:
Driver Side
Including but not limited to:
•	authentication
•	profile
•	onboarding
•	driving sessions
•	exercise schedules
•	reminder preferences
•	notification preferences
•	exercise history
•	completed exercises
•	streaks
•	achievements
•	statistics
•	settings
•	saved configurations
•	exercise progress
•	feedback
•	reports
•	uploaded files
•	logs
•	analytics
•	timestamps
Admin Side
Including:
•	user management
•	dashboard analytics
•	reports
•	exercise management
•	notification management
•	content management
•	system logs
•	announcements
•	moderation
•	audit logs
•	usage analytics
•	platform statistics
Design the complete relational database schema with:
•	normalized tables
•	foreign keys
•	indexes
•	constraints
•	RLS policies
•	triggers
•	timestamps
•	UUID primary keys
•	optimized queries
•	scalable architecture
Also generate:
•	SQL migration files
•	Supabase policies
•	TypeScript database types
•	reusable database services
•	API helpers
•	CRUD functions
•	repository pattern if appropriate
________________________________________
PART 7 — Environment Variables
Create a proper .env configuration for the project.
I will later provide:
•	MOOVE_PUBLIC_SUPABASE_URL
•	MOOVE_PUBLIC_SUPABASE_PUBLISHABLE_KEY
Prepare the application so these values can be securely integrated without requiring additional refactoring.
Use environment variables consistently throughout the codebase.
Include support for:
MOOVE_PUBLIC_SUPABASE_URL=https://zgthueozpynxuggjtpmw.supabase.co

MOOVE_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_Y4unxjKVs0Lsya1fNyIqbQ_PGQstI3SAlso update:
•	Supabase client initialization
•	environment validation
•	configuration files
•	deployment configuration
•	local development configuration
•	production configuration
________________________________________
PART 8 — Code Quality Expectations
Throughout the implementation:
•	Do not break existing functionality.
•	Maintain compatibility with the current project structure.
•	Refactor duplicated code into reusable components, hooks, and services.
•	Follow modern React/Next.js + TypeScript best practices.
•	Use strict typing throughout.
•	Implement robust error handling and input validation.
•	Optimize rendering performance with memoization and lazy loading where appropriate.
•	Ensure the UI is responsive, accessible (WCAG), and consistent with the application's design system.
•	Clearly identify every file that needs to be created or modified before making changes, and explain the purpose of each change.

