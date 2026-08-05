# Expert Prompt

Act as a senior Full Stack Software Engineer, Frontend Engineer, Backend Engineer, Supabase Database Architect, UI/UX Designer, Technical Writer, DevOps Engineer, and Software Documentation Specialist.

Your first task is **NOT** to generate a README immediately.

Instead, **analyze my entire project first**.

## Phase 1 — Project Analysis

Thoroughly inspect and understand every file in my project, including but not limited to:

* Folder structure
* Source code
* Components
* Pages
* Assets
* Hooks
* Contexts
* Services
* Utilities
* APIs
* Backend logic
* Supabase configuration
* SQL schemas
* Database migrations
* Authentication
* Environment variables (excluding secrets)
* Package.json
* Dependencies
* Configuration files
* Build settings
* Deployment configuration
* Public assets
* Documentation
* Routing
* State management
* AI integrations
* Exercise data
* Video assets
* Dashboard implementation
* UI components
* Theme implementation
* Icons
* Types
* Interfaces
* Models
* Custom libraries
* Scripts

Do not skip any directory.

Before writing the README, identify:

* Project architecture
* Technologies used
* Frameworks
* Libraries
* Design patterns
* Folder organization
* Current implementation status
* Existing features
* Missing features
* Future-ready architecture
* Database structure
* Authentication flow
* API flow
* Data flow
* State management flow
* Overall application workflow

Understand how every part of the project connects together.

---

## Phase 2 — Understand the Project

Determine:

* What the application does
* Who the target users are
* What problems it solves
* Main objectives
* Current MVP scope
* Overall user flow
* Core functionalities
* AI capabilities
* Exercise recommendation system
* Driving session tracking
* Sedentary monitoring
* Health dashboard
* AI Insights
* Exercise Library
* User Profile
* Resources
* Authentication
* Research dashboard (if implemented)
* Admin capabilities (if present)

---

## Phase 3 — Generate a Professional README.md

After fully analyzing the project, create a polished, professional, GitHub-quality README.md.

The README should be well-organized with proper Markdown formatting.

Include the following sections where applicable:

# Project Title

* Application name
* Logo (if available)
* Tagline
* Short description

---

# Table of Contents

Generate an automatic navigation section.

---

# Overview

Explain:

* Purpose
* Vision
* Goals
* Problem Statement
* Solution

---

# Features

Separate implemented features from planned features.

Example:

## Current Features

* Authentication
* Dashboard
* Driving Session Tracking
* Exercise Library
* AI Recommendations
* Sedentary Monitoring
* Health Dashboard
* AI Insights
* User Profile
* Settings
* Responsive UI
* Theme Support
* Supabase Integration

## Planned Features

Only include features that are clearly planned based on the project files, comments, roadmap, or TODOs.

---

# Technology Stack

Categorize everything.

Example:

Frontend

Backend

Database

Authentication

AI

Styling

Charts

State Management

Routing

Icons

Utilities

Build Tools

Deployment

Version Control

Package Manager

---

# Project Structure

Generate an accurate folder tree similar to:

```text
src/
 ├── components/
 ├── pages/
 ├── hooks/
 ├── context/
 ├── services/
 ├── utils/
 ├── assets/
 ├── data/
 ├── types/
 ├── styles/
 └── App.tsx
```

Explain the purpose of every major folder.

---

# Application Architecture

Describe:

* Frontend architecture
* Backend architecture
* Database architecture
* Authentication architecture
* AI architecture
* Data flow
* Routing flow

---

# Database

Document every table discovered.

For each table include:

* Purpose
* Primary key
* Foreign keys
* Relationships
* Important columns

If SQL migrations exist, summarize the schema.

---

# Authentication

Explain:

* Login
* Registration
* Protected routes
* Session handling
* User roles
* Supabase Auth integration

---

# AI Features

Document:

* Recommendation logic
* Personalization
* Exercise selection
* Safety checks
* Context awareness

---

# Exercise System

Explain:

* Categories
* Videos
* Progress tracking
* Warm-up
* Movement breaks
* Cool-down
* Exercise recommendations
* Completion logic

---

# Driving Session

Explain:

* Timer
* Driving status
* Session history
* Sedentary tracking
* Reminder logic

---

# Installation

Provide complete setup instructions.

Example:

* Clone repository
* Install dependencies
* Configure environment variables
* Set up Supabase
* Run migrations
* Start development server

---

# Environment Variables

List required variables without exposing secrets.

Example:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Explain the purpose of each variable.

---

# Available Scripts

Document all npm scripts from package.json.

Example:

* npm install
* npm run dev
* npm run build
* npm run preview
* npm run lint

Explain what each script does.

---

# Screenshots

Create placeholders for screenshots.

Example:

Landing Page

Dashboard

Exercise Library

Health Dashboard

AI Insights

Driving Session

Profile

---

# Future Improvements

Include realistic enhancements inferred from the codebase.

---

# Known Limitations

Document any current limitations discovered during analysis.

---

# Contributing

Provide contribution guidelines.

---

# License

Include a placeholder if no license is defined.

---

# Authors

Generate from available project metadata if present.

---

# Acknowledgements

List major technologies and open-source libraries used.

---

## Documentation Quality Requirements

The README should:

* Follow GitHub best practices.
* Be easy to read.
* Use proper Markdown headings.
* Include badges where appropriate.
* Include emojis only where they improve readability.
* Be concise but comprehensive.
* Reflect the actual implementation rather than assumptions.
* Avoid documenting features that are not yet implemented.
* Clearly distinguish between completed, partially implemented, and planned functionality.

Before finalizing, verify that every documented feature exists in the codebase or is explicitly planned within the project. The README must accurately represent the current state of the application.
