# GitHub Copilot Instructions — Plant Tracker App

## 1. Purpose of These Instructions

This document defines the authoritative development rules, scope, and constraints for GitHub Copilot when generating or reviewing code for the Plant Tracker application.

Copilot must treat this file as a single source of truth and must not infer or invent functionality outside what is explicitly defined here.

When ambiguity exists, Copilot must ask clarifying questions instead of guessing.

## 2. Application Overview

### 2.1 App Identity

- **Name:** Plant Tracker (working name)
- **Type:** B2C mobile application
- **Platforms:** iOS and Android
- **Framework:** React Native

### 2.2 Core Purpose

Plant Tracker helps users manage houseplants with minimal effort by:

- Automatically generating plant care schedules
- Sending reminders for plant care tasks
- Tracking plant growth via photos and time-lapse
- Optionally integrating IoT sensor data to automate care confirmations

The app is designed for low-engagement, reminder-driven usage.

## 3. Target Users

- Casual houseplant owners
- Users with limited plant-care knowledge
- Users who prefer automation over manual tracking
- Users who may not know plant species names

Copilot must assume:

- Users open the app 1–2 times per week
- Notifications are the primary interaction driver

## 4. Core Functional Requirements

### 4.1 Onboarding & Plant Creation

- A user must add at least one plant for the app to be useful

Plant creation includes:

- Image-based plant identification
- User-defined plant name
- User-provided image

Plant misidentification is acceptable:

- Care schedules may be inaccurate as a result

The system must tolerate uncertainty and avoid assumptions.

Copilot must not require users to know plant species names.

### 4.2 Plant Care Tasks

Supported task types:

- Watering
- Fertilization
- Repotting
- User-defined custom tasks

Task characteristics:

- Tasks are binary (done / not done)
- No quantitative inputs (e.g., water amount)

### 4.3 Care Scheduling Logic

- Care schedules are automatically generated
- Users cannot manually override adaptive behavior

Repeated snoozing of tasks triggers:

- Automatically calculated schedule change suggestions

Schedule adjustments must be:

- Deterministic
- Explainable
- Consistent

Copilot must not introduce manual schedule editing unless explicitly instructed.

### 4.4 Notifications

- Notifications are the primary engagement mechanism
- Ignored or snoozed notifications are treated as behavioral signals
- Notification logic must be resilient to missed or delayed events

## 5. Growth Tracking

- Users manually upload plant photos
- The system stores photos chronologically
- A photo timeline and time-lapse view are supported
- No AI-based image analysis for growth interpretation is required

Copilot must not add visual analysis features unless explicitly requested.

## 6. IoT Integration

### 6.1 Scope

- IoT integration is optional, but supported

Supported sensor types:

- Soil moisture
- Light exposure
- Temperature
- Humidity

### 6.2 Behavior

- Sensor data can replace manual task confirmation

Example behaviors:

- Soil moisture below threshold → watering task auto-completed or triggered
- Insufficient light → user notification
- Temperature anomaly → warning notification

Copilot must:

- Treat all IoT input as untrusted
- Implement fail-safe behavior when data is missing or inconsistent
- Default to conservative actions on sensor failure

## 7. Data & History

Users must be able to view:

- Task completion history
- Sensor data charts
- Photo timeline

Optional (non-mandatory):

- Data export functionality

Copilot should treat data export as a non-MVP feature unless explicitly requested.

## 8. Explicit Non-Features (Hard Constraints)

Copilot must not generate, suggest, or scaffold:

- AI chat assistants
- Plant marketplaces
- Social or community features
- Forums or user-to-user interaction

Any code or suggestion touching these areas must be rejected.

## 9. Copilot Responsibilities

Copilot is expected to:

- Generate implementation-ready code
- Review existing code for correctness and maintainability
- Propose architecture and refactoring when appropriate
- Enforce constraints defined in this document

Copilot is allowed to:

- Decide between reasonable technical alternatives
- Provide suggestions with justification

Copilot is not allowed to:

- Expand scope
- Introduce speculative features
- Assume missing requirements

## 10. Ambiguity Handling Rules

When encountering unclear or missing requirements, Copilot must:

1. Ask clarifying questions
2. Avoid assumptions
3. Prefer simplicity and maintainability
4. Avoid premature optimization
5. Avoid scope expansion

## 11. Technical & Security Requirements

All generated or reviewed code must:

- Follow secure coding best practices
- Protect user and sensor data
- Follow mobile platform security guidelines
- Minimize permissions
- Be resilient to malformed or malicious IoT input

Security considerations take priority over feature completeness.

## 12. Instruction Finality

This document is authoritative and final.

Any change in behavior or scope requires:

- An explicit update to this file, or
- A clearly stated override in the prompt

Copilot must always assume this document reflects the current intended behavior of the application.