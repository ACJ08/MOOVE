________________________________________
MASTER PROMPT
Act as a Senior Product Manager, Senior UX Researcher, Senior UI/UX Designer, Senior Mobile Application Designer, Senior Full-Stack Software Architect, Senior Frontend Developer, Senior Backend Developer, Health Informatics Specialist, Preventive Healthcare Expert, and Business Analyst.
Your task is to design a complete, production-ready end-to-end User Journey Flow for my mobile application called Moove.
Moove is a preventive health mobile application that encourages drivers to perform safe micro-movement exercises before, during, and after driving to reduce sedentary behavior, physical fatigue, and musculoskeletal discomfort.
This is NOT simply a list of screens.
I want a complete product workflow that explains every interaction, every navigation, every system process, every AI recommendation trigger, and every backend process from the moment the user opens the application until the driving session has been completely finished.
Think like a Product Manager creating the application's functional specification before development.
________________________________________
OBJECTIVE
Create a numbered User Journey Flow beginning from Step 1 until the end of the application workflow.
Each step should explain:
•	What the user sees
•	What the user clicks
•	What happens in the frontend
•	What happens in the backend
•	What data is saved
•	Which APIs are called
•	Which database tables are updated
•	Which AI process is triggered
•	What notifications appear
•	Where the user is redirected next
Do not skip any transition.
Every interaction should feel realistic and production-ready.
________________________________________
ALSO REDESIGN THE APPLICATION NAVIGATION
Review my existing navigation and improve it.
You may:
•	Rename tabs
•	Remove unnecessary tabs
•	Add new tabs
•	Rearrange navigation
•	Edit the landing Page how it works section aligned with the user journey.. But don’t edit other parts in the landing page that are unnecessary
If doing so improves usability.
Explain why your navigation is better.
For example:
•	Home
•	Driving Session
•	Exercises
•	Dashboard
•	Learn
•	Feedback
•	Profile
Or propose something better.
________________________________________
COMPLETE USER JOURNEY
________________________________________
STEP 1 — Authentication
The application starts with:
•	Splash Screen
•	Welcome Screen
•	Onboarding
•	Login
•	Register
•	Forgot Password
•	Email Verification (optional)
After successful login,
DO NOT immediately send the user to Driving Session.
Instead, first personalize the experience.
________________________________________
STEP 2 — Quick Personalization Setup (First-Time Users Only)
Purpose:
Quickly personalize the application in under one minute by collecting only the essential information needed to tailor exercise recommendations, reminder intervals, and preventive health insights.
This setup should only appear on the user's first login. It can later be edited from the Profile or Settings page.
Display a progress indicator (e.g., "Quick Setup • 1 Minute • 8 Questions").
Design this setup as a modern onboarding wizard with one question per screen.
Question 1 – What type of driver are you?
•	Private Car Driver
•	Ride-Hailing Driver (Grab, JoyRide, etc.)
•	Taxi Driver
•	Delivery Driver
•	Truck Driver
•	Bus Driver
•	Van Driver
•	Other
Purpose:
Personalize exercise recommendations based on driving context.
________________________________________
Question 2 – How long do you usually drive each day?
•	Less than 1 hour
•	1–2 hours
•	2–4 hours
•	4–6 hours
•	More than 6 hours
Purpose:
Determine the default reminder interval and sedentary baseline.
________________________________________
Question 3 – When do you usually drive?
(Multiple Selection)
•	Morning
•	Afternoon
•	Evening
•	Night
•	Varies
Purpose:
Schedule reminders during typical driving hours.
________________________________________
Question 4 – Which areas usually feel tired after driving?
(Multiple Selection)
•	Neck
•	Shoulders
•	Upper Back
•	Lower Back
•	Hips / Glutes
•	Knees
•	Calves
•	Feet / Ankles
•	Wrists
•	Eyes
•	I rarely experience discomfort
Purpose:
Prioritize personalized exercise recommendations.
________________________________________
Question 5 – How often would you like movement reminders?
•	Every 15 minutes
•	Every 20 minutes
•	Every 30 minutes
•	Every 45 minutes
•	Every 60 minutes
•	I'll customize later
Purpose:
Configure default reminder intervals.
________________________________________
Question 6 – How would you like reminders to appear?
•	Automatically show recommended exercises
•	Ask before showing recommendations
•	Notification only
•	Manual reminders only
Purpose:
Configure reminder behavior.
________________________________________
Question 7 – Would you like warm-up exercises before every driving session?
•	Yes, always
•	Ask every session
•	No
Purpose:
Set the default driving preparation behavior.
________________________________________
Question 8 – Enable Notifications?
•	Allow Notifications
•	Maybe Later
Purpose:
Enable reminder notifications.
________________________________________
After Completing Setup
The system automatically:
•	Creates the user's personalization profile.
•	Saves onboarding preferences.
•	Initializes AI recommendation settings.
•	Configures default reminder intervals.
•	Stores notification preferences.
•	Creates the user's preventive health profile.
Then redirect the user to:
➡️ Driving Session Home.
________________________________________
STEP 3 — Driving Session Home
This becomes the application's primary screen.
Display:
Current Status
Ready to Drive
Buttons:
•	Start Driving
•	Configure Session
•	Warm-up First
Optional Route:
Home → Office
(Home and destination are optional.)
________________________________________
STEP 4 — Warm-up Exercises
Before driving,
the user may perform warm-up exercises.
Use the provided library of 10 exercises.
Determine which exercises are most appropriate before driving.
When an exercise is selected, display:
•	Exercise animation
•	Description
•	Target muscles
•	Why drivers need it
•	Safety reminder
•	Recommended duration
Allow users to customize:
•	Timer
•	Duration
•	Repetitions
Buttons:
•	Start Exercise
•	Skip
•	Back
After completion:
Mark the exercise as completed.
Ask:
Would you like another warm-up exercise?
or
Continue Driving
________________________________________
STEP 5 — Driving Session Configuration
Allow users to configure:
Reminder Interval
15
20
25
30
35
40
45
60
Custom
________________________________________
Break Context
•	Heavy Traffic
•	Parked Vehicle
•	Gas Station
•	Rest Stop
•	Before Driving
•	After Driving
•	Manual Break
________________________________________
Reminder Behavior
•	Auto Recommend
•	Ask First
•	Notification Only
•	Silent
Explain how every option changes the application's behavior.
________________________________________
STEP 6 — Start Driving
When the user presses
Start Driving
The backend should begin recording:
•	Session Start Time
•	Driving Duration
•	Reminder Schedule
•	Route (optional)
•	Current Session State
•	AI Monitoring State
Display controls:
•	Pause
•	End Session
•	I'm Safely Stopped
________________________________________
STEP 7 — During Driving
While driving,
the system continuously monitors:
•	Driving duration
•	Sedentary duration
•	Reminder schedule
•	Completed exercises
•	Driving context
•	AI recommendation triggers
Explain how these events are processed.
________________________________________
STEP 8 — Movement Break
When:
•	Reminder interval expires
OR
The user presses
"I'm Safely Stopped"
Display:
Recommended Exercises
Buttons:
•	Start Recommended Exercise
•	View More
•	Skip
View More should display every exercise that is safe for the current context.
Each exercise page should contain:
•	Animation
•	Description
•	Target muscles
•	Benefits
•	Timer
•	Repetition selector
•	Safety reminders
After completion ask:
Do another exercise?
or
Continue Driving
________________________________________
STEP 9 — End Driving Session
When End Session is selected,
the backend saves:
•	Total Driving Time
•	Break Count
•	Exercise Completion
•	Reminder Response Rate
•	Sedentary Duration
•	AI Recommendation History
•	Health Engagement Metrics
Explain every backend operation.
________________________________________
STEP 10 — Cool-down Exercises
Before finishing,
ask:
Would you like to perform cool-down exercises?
Automatically recommend only exercises appropriate for cool-down.
Allow users to customize:
•	Timer
•	Duration
•	Repetitions
Show animation.
Mark completed.
Ask:
Do another cool-down exercise?
or
Finish Driving Session
________________________________________
STEP 11 — Driving Session Report
Generate:
•	Driving Summary
•	Health Summary
•	Exercise Summary
•	Sedentary Summary
•	Break Summary
•	Daily Streak
•	Weekly Progress
•	AI Recommendation Summary
•	Achievements
•	Engagement Metrics
Explain how every metric is calculated.
________________________________________
FEATURE 4 — Sedentary Behavior Monitoring
Display:
•	Daily Sedentary Time
•	Exercise Completion Rate
•	Preventive Health Engagement
•	Behavioral Trends
•	Daily Health Summary
•	Progress Monitoring
Explain how these metrics are stored and updated.
________________________________________
FEATURE 5 — Preventive Health Dashboard
Display:
•	Total Sedentary Time
•	Daily Movement Streak
•	Weekly Preventive Activities
•	Driving Statistics
•	Monthly Progress
•	Historical Trends
•	Engagement Metrics
•	AI Behavioral Insights
Recommend appropriate chart types and explain what each visualization represents.
________________________________________
FEATURE 6 — Preventive Health Education
Recommend educational content based on the user's behavior.
Topics include:
•	Risks of prolonged sitting
•	Benefits of regular movement
•	Safe stretching techniques
•	Preventive health recommendations
Explain how content is personalized.
________________________________________
FEATURE 7 — TRL 4 Prototype Validation Module
Integrate the complete six-section TRL 4 user validation module into the application flow.
Include:
•	User Profile & Driving Context
•	Core Workflow Validation
•	Usability Evaluation
•	Preventive Health Intervention Validation
•	Behavior Change & Adoption
•	Open Feedback
________________________________________
SECTION 1 OF 6 — USER PROFILE & DRIVING CONTEXT
Purpose:
Identify whether participants match the intended beneficiary group and understand their driving habits.
Collect:
Demographic Information
Age
•	18–25
•	26–35
•	36–45
•	46–55
•	56+
Gender (Optional)
•	Male
•	Female
•	Non-binary
•	Prefer not to say
Location
•	NCR (Metro Manila)
•	CALABARZON
•	Other Philippines Region
________________________________________
Driving Profile
Occupation
(Optional)
________________________________________
Average Daily Driving Duration
•	Less than 1 hour
•	1–2 hours
•	2–4 hours
•	4–6 hours
•	More than 6 hours
Driving Frequency
•	Daily
•	4–6 days/week
•	2–3 days/week
•	Once a week
•	Occasionally
Vehicle Type
•	Sedan
•	SUV
•	Hatchback
•	Pickup Truck
•	Van / MPV
•	Crossover
•	Other
Years of Driving Experience
•	Less than 1 year
•	1–3 years
•	3–5 years
•	5–10 years
•	More than 10 years
Validation Purpose:
Confirm that tested users experience the problem Moove intends to solve.
________________________________________
SECTION 2 OF 6 — CORE WORKFLOW VALIDATION
Purpose:
Validate whether users can successfully use the main Moove workflow.
Measure:
•	Task completion rate
•	Time required
•	User difficulty
Participants complete:
Task 1:
Create a Moove account.
Measured:
✅ Successful completion
❌ Failed completion
________________________________________
Task 2:
Start and complete a driving session.
Measured:
•	Completion success (%)
•	Errors encountered
________________________________________
Task 3:
Receive a personalized recommendation.
Example:
"You've been driving for 90 minutes. Consider a short shoulder mobility break."
Measured:
Rating:
1 — Not relevant
2 — Slightly relevant
3 — Neutral
4 — Relevant
5 — Very relevant
________________________________________
Task 4:
Complete a guided micro-movement exercise.
Measured:
Exercise completion:
•	Completed successfully
•	Partially completed
•	Unable to complete
________________________________________
Task 5:
Review dashboard insights.
Measured:
Dashboard understanding:
1 — Very unclear
5 — Very clear
________________________________________
TRL 4 Metrics Generated:
Metric	Target
Workflow completion rate	≥80%
Exercise completion rate	≥70%
Recommendation relevance	≥4/5
Dashboard understanding	≥4/5
________________________________________
SECTION 3 OF 6 — USABILITY EVALUATION
Purpose:
Measure whether Moove is usable by real drivers.
Use a 5-point Likert scale:
1 = Strongly Disagree
5 = Strongly Agree
Statements:
System Usability
1.	Moove is easy to navigate.
2.	I understood how to use the application without assistance.
3.	The application layout is clear and organized.
4.	The features are easy to access.
________________________________________
Exercise Experience
5.	Exercise animations clearly demonstrate the movements.
6.	The instructions are easy to follow.
7.	The recommended exercise duration feels appropriate.
8.	The exercises are practical for my driving routine.
________________________________________
AI Recommendation Experience
9.	AI recommendations are understandable.
10.	AI recommendations are relevant to my driving behavior.
11.	The suggested interventions match my situation.
________________________________________
Dashboard Experience
12.	Driving and activity summaries are easy to understand.
13.	The dashboard motivates me to monitor my behavior.
________________________________________
TRL 4 Metrics:
Calculate:
Average Usability Score
Formula:
Total Usability Ratings / Number of Questions

Target:
≥4.0 / 5
________________________________________
SECTION 4 OF 6 — PREVENTIVE HEALTH INTERVENTION VALIDATION
Purpose:
Determine whether Moove's intervention provides perceived value.
________________________________________
Stress Assessment
Before using Moove:
"My current stress/fatigue level before using Moove."
Scale:
1 (Very Low)
↓
5 (Very High)
After completing exercises:
"My current stress/fatigue level after using Moove."
Scale:
1 (Very Low)
↓
5 (Very High)
________________________________________
Calculate:
Perceived Stress Improvement
Formula:
Before Score - After Score

Example:
Before:
4/5
After:
2/5
Improvement:
2 points
________________________________________
Exercise Usefulness
Rate:
1 Poor
5 Excellent
•	Exercise usefulness
•	Physical comfort improvement
•	Ease of performing exercises
•	Safety during driving context
•	Time efficiency
________________________________________
TRL 4 Metrics:
Metric	Target
Average usefulness score	≥4/5
Users reporting improvement	≥60%
Exercise completion	≥70%
________________________________________
SECTION 5 OF 6 — BEHAVIOR CHANGE AND ADOPTION
Purpose:
Validate whether Moove can realistically become part of users' routines.
Questions:
________________________________________
Would you continue using Moove?
○ Yes
○ Maybe
○ No
________________________________________
Would you use Moove during long driving sessions?
○ Yes
○ Maybe
○ No
________________________________________
Would you recommend Moove to other drivers?
○ Yes
○ Maybe
○ No
________________________________________
Would Moove help you become more aware of prolonged sitting?
1 2 3 4 5
________________________________________
Did Moove encourage you to perform preventive movements?
1 2 3 4 5
________________________________________
TRL 4 Metrics:
Metric	Target
Future adoption intention	≥70% positive
Recommendation intention	≥70% positive
Awareness improvement	≥4/5
________________________________________
SECTION 6 OF 6 — OPEN FEEDBACK AND LEARNING
Purpose:
Capture qualitative insights required for TRL 4 reflection.
Questions:
________________________________________
What feature of Moove was most useful?
(Open response)
________________________________________
What part of Moove was difficult or confusing?
(Open response)
________________________________________
Were any exercises difficult to perform?
(Open response)
________________________________________
Did any recommendation feel inaccurate?
(Open response)
________________________________________
What improvements would make Moove more useful?
(Open response)
________________________________________
Additional comments:
(Open response)
________________________________________
Additional TRL 4 Evidence You Should Collect
Your Feedback Module should generate these outputs:
1. User Testing Summary Table
Example:
Participant	Driving Duration	Completed Exercise	Usability Score	Stress Before	Stress After
User 1	4 hrs/day	Yes	4.5	4	2
User 2	3 hrs/day	Yes	4.2	3	2
________________________________________
2. Prototype Screenshots
Include:
✅ Login flow
✅ Driving session tracking
✅ Exercise recommendation
✅ AI recommendation
✅ Dashboard
✅ Feedback submission page
________________________________________
3. Performance Evidence
Document:
•	Number of participants
•	Date of testing
•	Testing environment
•	Device used
•	Completion rate
•	Average scores
Example:
Testing Environment:
Mobile browser simulation using Android devices.

Participants:
8 licensed drivers from NCR and CALABARZON.

Duration:
7 days.

Results:
87.5% workflow completion rate
4.3/5 average usability score
78% willingness to continue usage
Admin Role (Prototype Evaluator)
The Admin role manages the entire TRL 4 validation process.
TRL 4 Validation Center

├── Prototype Overview
├── Part 1 – Testing Preparation
├── Live Testing Monitor
├── Part 2 – Rapid Testing Results
├── Part 3 – Feedback Synthesis
├── TRL 4 Evidence Center
└── Prototype Iteration Plan
Feature 7 – Validation Survey
Section 1 – Driver Profile
Collects:
•	Age
•	Gender (Optional)
•	Location
•	Occupation
•	Daily driving duration
•	Driving frequency
•	Vehicle type
•	Driving experience
Purpose:
Confirm that participants represent the intended target users.
________________________________________
Section 2 – Core Workflow Validation
Evaluates whether users successfully completed the prototype.
Questions include:
•	Was it easy to start a driving session?
•	Were the AI recommendations understandable?
•	Were the guided exercises easy to complete?
•	Was the dashboard easy to understand?
Purpose:
Measure successful completion of the application's core workflow.
________________________________________
Section 3 – Usability Evaluation
5-point Likert Scale
Measures:
•	Ease of use
•	Navigation
•	Interface clarity
•	Exercise instructions
•	Dashboard readability
•	AI recommendation clarity
•	Overall user experience
Purpose:
Measure usability of the prototype.
________________________________________
Section 4 – Intervention Effectiveness
Measures:
Stress before using Moove
↓
Stress after completing the guided exercise
Also rates:
•	Exercise usefulness
•	Practicality
•	Break timing
•	Physical comfort
Purpose:
Measure perceived effectiveness of the intervention.
________________________________________
Section 5 – Future Adoption
Questions include:
•	Would you continue using Moove?
•	Would you recommend Moove?
•	Would you install Moove?
•	Did Moove increase your awareness of prolonged sitting?
Purpose:
Measure future adoption potential.
________________________________________
Section 6 – Open Feedback
Questions:
•	What did you like most?
•	What was confusing?
•	What should be improved?
•	Additional features
•	General comments
Purpose:
Collect qualitative feedback for prototype improvements.
________________________________________
ADMIN SIDE
TRL 4 Validation Center
________________________________________
Prototype Overview
Displays:
•	Prototype Version
•	Testing Period
•	Number of Participants
•	Testing Status
•	Current Validation Progress
________________________________________
PART 1 — TESTING PREPARATION
Purpose
Document the testing plan before user testing begins.
________________________________________
Testing Setup
Item	Value
Prototype Version	Moove MVP v1.0
Testing Environment	Online mobile-responsive web application
Testing Method	Structured In-App Survey
Target Participants	5–10 Licensed Drivers
Target Locations	NCR and CALABARZON
Devices	Personal smartphones and laptops
Testing Duration	Single testing session per participant
________________________________________
Assumptions to Validate
Assumption	Prototype Feature
Drivers can complete the core workflow	Driving Session Tracking
Drivers understand guided exercises	Guided Exercise Module
AI recommendations are understandable	AI Recommendation Module
Dashboard information is understandable	Preventive Health Dashboard
Users are willing to continue using Moove	Validation Survey
________________________________________
Metrics (Defined Before Testing)
Metric	Target
Workflow Completion Rate	≥80%
Average Usability Score	≥4.0 / 5
Exercise Completion Rate	≥70%
AI Recommendation Rating	≥4.0 / 5
Average Stress Improvement	≥1-point reduction
Future Adoption Intention	≥70% positive responses
These metrics are established before testing begins, satisfying TRL 4 requirements.
________________________________________
Live Testing Monitor
Displays real-time testing progress.
Cards:
•	Total Participants
•	Completed Surveys
•	Workflow Completion Rate
•	Average Usability
•	Average Stress Improvement
•	Adoption Rate
________________________________________
PART 2 — RAPID TESTING RESULTS
Displays completed testing sessions.
Each participant record includes:
•	Driver profile
•	Driving session summary
•	Exercise completion status
•	AI recommendation rating
•	Usability score
•	Stress before/after
•	Adoption intention
•	Open-ended feedback
________________________________________
Rapid Testing Summary
Automatically aggregates results.
Example:
Metric	Result
Participants	8
Completed Workflow	7
Average Usability	4.3 / 5
Exercise Completion Rate	75%
Average Stress Reduction	1.4 points
Adoption Intention	78%
Purpose:
Provide measurable validation results.
________________________________________
PART 3 — FEEDBACK SYNTHESIS
Transforms survey results into actionable insights.
________________________________________
Top 5 Insights
Displays:
Insight	Evidence	Recommended Action
Drivers preferred seated exercises	Mentioned by 7 of 8 users	Expand seated exercise library
Dashboard contains too much information	Average dashboard score: 3.8/5	Simplify dashboard layout
AI recommendations were understandable	Average score: 4.4/5	Maintain current wording
Users appreciated short exercises	Repeated open feedback	Keep interventions under 60 seconds
Reminder timing needs improvement	Common user suggestion	Add customizable reminder settings
________________________________________
Feedback Categorization
Desirability
Evaluates whether users want the solution.
Displays:
•	Average usability score
•	Adoption intention
•	Most-liked features
•	Most-requested improvements
________________________________________
Feasibility
Evaluates whether the solution is technically achievable.
Displays:
Working components:
•	Driving tracker
•	Guided exercises
•	AI recommendations
•	Dashboard
•	Validation survey
Technical improvements:
•	Better AI personalization
•	Improved dashboard readability
•	Enhanced exercise animations
________________________________________
Viability
Evaluates long-term sustainability.
Displays:
Current prototype cost:
•	PHP 0 (using free-tier technologies)
Potential future partnerships:
•	Driver communities
•	Workplace wellness programs
•	Local Government Units (LGUs)
•	Insurance and wellness partners
Potential future revenue or deployment models:
•	Corporate wellness programs
•	Organizational licensing
•	Preventive health partnerships
________________________________________
Prototype Improvement Plan
Based on synthesized feedback, the Admin documents planned changes.
Identified Issue	Priority	Planned Improvement	Next Version
Dashboard clutter	High	Simplify dashboard layout	MVP v1.1
Reminder timing	Medium	Add reminder customization	MVP v1.1
Limited seated exercise options	Medium	Expand exercise library	MVP v1.2
AI personalization	Medium	Improve recommendation logic	MVP v1.2
________________________________________
TRL 4 Evidence Center
Stores all validation evidence in one place.
Working Prototype
•	Prototype version
•	Implemented MVP features
•	Deployment status
________________________________________
Testing Documentation
•	Testing setup
•	Testing schedule
•	Participant criteria
•	Testing method
•	Predefined metrics
________________________________________
Measurable Results
•	Summary tables
•	Charts
•	Completion rates
•	Usability scores
•	Stress improvement
•	Adoption intention
________________________________________
Validation Evidence
•	Prototype screenshots
•	Screen recordings (if available)
•	Performance logs
•	Survey responses
•	Open feedback
________________________________________
Learning & Next Steps
Summarizes:
•	What worked
•	What did not work
•	Unexpected findings
•	Planned improvements
•	Next prototype version
•	Future testing plan
________________________________________
Alignment with UNLEASH Testing Phase & TRL 4
Requirement	Implementation in Moove
Working Prototype	Complete end-to-end driver workflow (Driving Session → AI Recommendation → Guided Exercise → Dashboard → Validation Survey)
Defined Testing Setup	Admin "Part 1 – Testing Preparation" documents participants, environment, assumptions, survey method, and success criteria before testing.
Metrics Chosen Before Testing	Workflow completion, usability, exercise completion, AI recommendation rating, stress improvement, and adoption intention are predefined in the admin panel.
Measurable Results	Survey scores and system logs are aggregated into dashboards, tables, and charts in "Part 2 – Rapid Testing Results."
Evidence of Progress	Screenshots, performance logs, structured survey responses, summary tables, and prototype versions are stored in the TRL 4 Evidence Center.
Learning & Next Steps	"Part 3 – Feedback Synthesis" categorizes findings into Desirability, Feasibility, and Viability, then produces a prioritized Prototype Improvement Plan for the next testing cycle.
This structure ensures that drivers only participate in testing, while administrators manage, analyze, and document the entire validation process, directly supporting the UNLEASH Testing Phase and satisfying all core TRL 4 evidence requirements.

Automatically generate:
•	User Testing Summary Table
•	Workflow Completion Rate
•	Exercise Completion Rate
•	Average Usability Score
•	Recommendation Relevance Score
•	Stress Improvement Score
•	Dashboard Understanding Score
•	Future Adoption Intention
•	Testing Environment Summary
•	Participant Statistics
________________________________________
AI RECOMMENDATION ENGINE
Design an AI recommendation system that:
•	Does not diagnose diseases.
•	Does not provide medical advice.
•	Provides only preventive health recommendations.
Generate recommendations using:
•	Driving duration
•	Sedentary duration
•	Driving context
•	Reminder schedule
•	Completed exercises
•	User preferences
•	Personalized onboarding responses
•	Historical exercise behavior
•	Time of day
•	Previous driving sessions
Provide:
•	Behavioral summaries
•	Positive reinforcement
•	Consistency tracking
•	Preventive health insights
•	Safe exercise recommendations
________________________________________
SYSTEM ARCHITECTURE
For every major interaction, explain:
•	Frontend behavior
•	Backend API endpoints
•	Database operations
•	Local storage/session management
•	Notification triggers
•	AI processing flow
•	Navigation logic
•	Error handling
•	Edge cases
•	Success scenarios
________________________________________
FINAL DELIVERABLE
Produce a complete, production-ready User Journey & Functional Specification that includes:
1.	End-to-end numbered user journey (authentication to session completion).
2.	Redesigned navigation structure with rationale.
3.	Screen-by-screen UI and UX flow.
4.	Frontend interactions.
5.	Backend workflows and API calls.
6.	Database entities and operations.
7.	AI recommendation logic and personalization.
8.	Exercise categorization (Warm-up, Driving, Parked, Cool-down) with justification.
9.	Sedentary behavior monitoring workflow.
10.	Preventive Health Dashboard design.
11.	Preventive Health Education workflow.
12.	Integrated TRL 4 Prototype Validation workflow.
13.	Decision trees and alternative user paths.
14.	Error states, edge cases, and recovery flows.
15.	UX recommendations aligned with Material Design 3, Apple Human Interface Guidelines, and WCAG 2.2 accessibility standards.
16.	Recommendations to improve usability, driver safety, engagement, and long-term adoption while ensuring the application remains focused on preventive health rather than medical diagnosis.

