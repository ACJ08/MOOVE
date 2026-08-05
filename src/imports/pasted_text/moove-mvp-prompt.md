Below is the final master prompt incorporating all of your revisions. It is designed to guide an AI coding assistant (Cursor, Claude Code, Windsurf, GitHub Copilot, Lovable, Bolt, v0, etc.) to build the complete MOOVE MVP exactly according to your research scope.
________________________________________
MASTER FULL-STACK IMPLEMENTATION PROMPT
MOOVE — Complete MVP Web Application
ROLE
Act as a world-class Senior Software Architect, Senior Full-Stack Developer, Frontend Engineer, Backend Engineer, UI/UX Designer, Product Designer, Motion Designer, Accessibility Specialist, and Technical Lead with over 20 years of experience building healthcare technology platforms, AI-powered SaaS applications, startup MVPs, and production-ready web applications.
Your responsibility is to build a polished, production-quality MVP that is suitable for:
•	Research demonstrations
•	Healthcare professionals
•	Startup investors
•	University capstone defense
•	TRL-4 validation
•	Hackathon presentations
The application must strictly follow the approved MOOVE MVP. Do not invent new features or extend beyond the official scope.
________________________________________
PROJECT
Product Name
MOOVE
Tagline
Small Movements. Healthier Journeys.
Brand Personality
•	Friendly
•	Preventive
•	Modern
•	Human-centered
•	Trustworthy
•	Calm
•	Motivating
________________________________________
IMPORTANT DEVELOPMENT RULES
Before making any changes:
•	Analyze the existing codebase.
•	Preserve reusable components whenever possible.
•	Maintain responsive behavior across desktop, tablet, and mobile.
•	Follow accessibility best practices (WCAG AA).
•	Optimize performance.
•	Avoid unnecessary dependencies.
•	Keep animations smooth and lightweight.
•	Remove unsupported features.
•	The application should feel like a modern healthcare SaaS platform.
________________________________________
REMOVE FEATURES THAT ARE NOT INCLUDED IN THE MVP
Completely remove all references, UI components, routes, marketing content, icons, and code related to:
❌ Voice Assistance
Remove:
•	Voice Assistant
•	Voice Commands
•	Audio Coaching
•	Hands-Free Coaching
•	Voice AI
•	Audio Notifications
MOOVE does NOT provide hands-free voice coaching.
________________________________________
❌ Offline-First
Remove:
•	Offline Mode
•	Offline Exercise Library
•	Works Without Internet
•	Offline Sync
•	Offline First
Offline functionality is not part of this MVP.
________________________________________
LANDING PAGE
Polish the landing page while keeping it aligned with MOOVE's preventive health mission.
________________________________________
HERO SECTION
Current headline:
Turn Every Drive Into a Wellness Journey
Replace only the word "Wellness" with a rotating animated word.
Final format:
Turn Every Drive Into a [Animated Word] Journey
Suggested words:
•	Movement
•	Mobility
•	Prevention
•	Stretching
•	Recovery
•	Comfort
•	Energy
•	Health
•	Active
•	Better
Animation requirements:
•	Smooth fade or vertical text slider
•	Infinite loop
•	Around 2–3 seconds per word
•	No layout shift
•	Premium startup-quality animation
•	Responsive
________________________________________
FEATURE MARQUEE
Increase scrolling speed by approximately 80%.
The animation should:
•	scroll continuously
•	remain smooth
•	have no visible reset
•	feel energetic
•	remain readable
________________________________________
USE THE MOO MASCOT
Whenever the interface references:
•	Moo
•	AI Coach
•	Exercise Coach
•	Health Coach
Replace generic illustrations with:
[MASCOT REMOVE BG] MOOVE CHARACTER.png
Use the mascot consistently throughout the landing page and authenticated application.
________________________________________
SOLUTION DESCRIPTION
Update the landing page with the official project description.
What is Moove?
Moove is an AI-assisted, context-aware preventive health platform that transforms unavoidable sedentary periods into opportunities for healthier behavior through personalized micro-interventions.
Rather than asking users to dedicate additional time for exercise, Moove utilizes moments already present within a driver's routine such as:
•	Waiting in traffic
•	Parking
•	Before driving
•	After driving
•	Safe stationary moments
By combining:
•	Behavioral science
•	Personalized AI recommendations
•	Guided micro-movement interventions
•	Preventive health education
Moove makes preventive health more accessible, sustainable, and easier to adopt.
________________________________________
AUTHENTICATION
The application supports only one user role.
Driver
Completely remove:
•	Administrator
•	Admin Dashboard
•	Admin Login
•	Admin Routes
•	Admin Sidebar
•	Admin Permissions
________________________________________
AUTHENTICATION FLOW
Landing Page Buttons:
•	Get Started
•	Sign In
•	Create Account
•	Use Demo Account
________________________________________
Create Account
Fields:
•	Full Name
•	Email
•	Password
•	Confirm Password
After successful registration:
Automatically authenticate the user.
Redirect to:
/driver/dashboard
________________________________________
Sign In
Fields:
•	Email
•	Password
Successful login redirects to:
Driver Dashboard
________________________________________
Demo Account
Add a Continue with Demo Account button.
Automatically log in using:
Email
driver@moove.app
Password
Driver123!
Display demo credentials on the login page.
The Demo Account should load realistic sample data.
________________________________________
BUILD THE COMPLETE DRIVER APPLICATION
After authentication, the user should enter a fully functional Driver application.
Do NOT redirect users to an empty dashboard.
Create a complete experience.
________________________________________
DRIVER SIDEBAR
Include only:
🏠 Dashboard
🚗 Driving Sessions
🤸 Guided Exercises
🤖 AI Recommendations
📊 Sedentary Monitoring
💙 Preventive Health Dashboard
📚 Health Education
📝 Feedback & Validation
⚙️ Settings
🚪 Logout
________________________________________
FEATURE 1 — DRIVING SESSION TRACKING
Allow users to:
•	Start Driving Session
•	Pause Session
•	Resume Session
•	End Session
Track:
•	Driving Duration
•	Sedentary Duration
•	Daily Driving History
Display:
•	Live Timer
•	Driving Timeline
•	Session Summary
•	Weekly Statistics
•	Driving Calendar
________________________________________
FEATURE 2 — GUIDED MICRO-MOVEMENT INTERVENTIONS
Implement only these ten approved exercises.
Upper Body
•	Chin Tucks
•	Upper Trapezius Stretch
•	Shoulder Rolls
•	Wrist Flexor Stretch
Lower Body
•	Seated Figure-4 Glute Stretch
•	Seated Heel Raise and Toe Raise
•	Standing Hip Flexor & Calf Stretch
•	Seated Lateral Lumbar Side Stretch
•	20-20-20 Ocular Reset & Eye Blink
•	Seated Knee Extension & Quad Squeeze
Each exercise page must contain:
•	Exercise Name
•	Moo Character Illustration
•	Target Muscles
•	Why Drivers Need It
•	Recommended Duration
•	Recommended Context
•	Safety Badge
•	Key Instructions
•	Start Exercise
•	Mark Complete
Use the supplied safety matrix exactly.
Never recommend unsafe exercises during driving.
________________________________________
FEATURE 3 — AI-ASSISTED PERSONALIZED RECOMMENDATIONS
Implement an AI Coach page.
Display:
•	Personalized Health Insights
•	Behavioral Summary
•	Exercise Suggestions
•	Weekly Consistency
•	Encouragement Messages
Example:
"You've spent 90 minutes driving today. Consider taking a 30-second shoulder mobility break."
"You've completed three guided movements this week. Great consistency!"
The AI must NEVER:
•	Diagnose diseases
•	Recommend medication
•	Replace healthcare professionals
•	Provide medical treatment
Always display a preventive wellness disclaimer.
________________________________________
FEATURE 4 — SEDENTARY BEHAVIOR MONITORING
Track:
•	Daily Sedentary Duration
•	Exercise Completion
•	Preventive Health Engagement
Visualize:
•	Daily Trend
•	Weekly Trend
•	Progress Charts
•	Activity Timeline
________________________________________
FEATURE 5 — PREVENTIVE HEALTH DASHBOARD
Display:
•	Total Sedentary Time
•	Daily Movement Streak
•	Weekly Preventive Activities
•	Driving Statistics
•	Exercise Completion
•	Engagement Metrics
•	AI Summary
•	Today's Recommendation
________________________________________
FEATURE 6 — PREVENTIVE HEALTH EDUCATION
Create an Education page containing articles about:
•	Risks of prolonged sitting
•	Benefits of regular movement
•	Safe stretching practices
•	Preventive health recommendations
Each article should include:
•	Illustration
•	Reading Time
•	Summary
•	Read More modal
________________________________________
FEATURE 7 — USER FEEDBACK & VALIDATION
Create a research validation form.
Collect:
•	Usability Rating
•	Ease of Use
•	Perceived Stress Rating
•	Intervention Usefulness
•	Willingness to Continue Using MOOVE
•	Suggestions
Display a thank-you confirmation after submission.
Purpose:
Support TRL-4 validation.
________________________________________
DASHBOARD
The Driver Dashboard should contain:
•	Today's Driving Time
•	Today's Sedentary Time
•	Weekly Driving Hours
•	Exercise Completion
•	Movement Streak
•	AI Recommendation
•	Health Engagement Score
•	Recent Driving Sessions
•	Weekly Activity Chart
•	Today's Exercise
•	Preventive Health Tip
Populate with realistic mock data for the Demo Account.
Example:
Today's Driving Time
2h 18m
Today's Sedentary Time
2h 05m
Movement Streak
5 Days
Exercises Completed
17
Weekly Driving Hours
12.4
Today's Suggested Exercise
Shoulder Rolls
AI Recommendation
"Great consistency this week! Before your next trip, try a 30-second Chin Tuck."
________________________________________
SAFETY SECTION
Replace the generic car illustration with:
[MASCOT REMOVE BG] MOOVE CHARACTER.png
Add a subtle floating animation.
________________________________________
FINAL CTA
Improve mascot contrast.
Adjust:
•	background gradient
•	spacing
•	shadows
•	accessibility
________________________________________
FAQ SECTION
Add an FAQ accordion including:
•	What is MOOVE?
•	Is MOOVE free?
•	Can I use MOOVE while driving?
•	Is MOOVE a medical application?
•	How does AI work?
•	What exercises are included?
•	Is my data private?
________________________________________
ABOUT US
Anne Carol G. Jonson
Use:
"profile pic.png"
Title:
Full-Stack Developer
Secondary title:
Lead Software Engineer
Highlight:
•	Full-stack development
•	System architecture
•	AI integration
•	UI/UX implementation
•	Preventive health platform development
Do not emphasize "Lead Researcher" as the primary title.
________________________________________
Serva, Jean-Abrey S.
Use:
"abrey.jpg"
Title:
Multimedia Designer
Lead Exercise Animation Designer
Highlight:
•	Character animation
•	Motion graphics
•	Exercise movement visualization
•	Visual storytelling
________________________________________
UI/UX REQUIREMENTS
The entire application should resemble a premium healthcare SaaS platform.
Include:
•	Glassmorphism
•	Soft shadows
•	Beautiful cards
•	Interactive charts
•	Smooth animations
•	Skeleton loaders
•	Empty states using the Moo mascot
•	Consistent spacing
•	Professional typography
•	Responsive layouts
•	Accessibility support
________________________________________
FINAL ACCEPTANCE CHECKLIST
The implementation is complete only if:
•	✅ Hero animated text replaces only the word "Wellness."
•	✅ Feature Marquee scroll speed is increased by ~80%.
•	✅ Moo mascot is consistently used throughout the application.
•	✅ Voice Assistance has been completely removed.
•	✅ Offline-First functionality has been completely removed.
•	✅ Only one user role (Driver) exists.
•	✅ Administrator functionality has been completely removed.
•	✅ Create Account works correctly.
•	✅ Sign In works correctly.
•	✅ Demo Account logs in successfully.
•	✅ Demo Account loads realistic sample data.
•	✅ Users are redirected to a fully functional Driver application after authentication.
•	✅ All seven official MVP features are fully implemented.
•	✅ All ten approved exercises are implemented with correct safety contexts.
•	✅ AI recommendations are preventive only and never provide diagnosis or treatment.
•	✅ Dashboard displays meaningful health and driving insights.
•	✅ FAQ and About Us sections are implemented.
•	✅ Anne Carol G. Jonson is presented primarily as Full-Stack Developer.
•	✅ The application is fully responsive, accessible, polished, and presentation-ready for hackathons, capstone defense, investor demos, and TRL-4 validation.

