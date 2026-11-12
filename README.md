# Presenter - Live Class Web Application

A lightweight, real-time presentation and live quiz platform built with **Vue 3**, **Vite**, and **Tailwind CSS**, designed for zero-friction deployment on **Vercel** with **no database required**, powered by **Pusher**.

---

## Features

- **Three Dedicated Roles**:
  - **Admin**: Creates presentation rooms and generates secure 6-digit class codes.
  - **Mentor**: Controls the live class session, advances/reverses steps, reveals quiz answers, and monitors student activity in real time.
  - **Student**: Enters the 6-digit code and display name to participate in synchronized slides and live MCQ quizzes.
- **Ordered Step Architecture**:
  - Image 1 (`StepImage1.vue`), Image 2 (`StepImage2.vue`), Image 3 (`StepImage3.vue`), Counter component (`Counter.vue`), followed by the MCQ test.
  - Extensible: adding a new step or question requires only creating a new `.vue` file and adding its name to the ordered list in `ClassRoom.vue`.
- **Synchronized Live MCQ Test**:
  - 3 questions randomly selected once per room from an extensible pool of sample questions.
  - Questions appear in the exact same order for all students.
  - Mentor sees live response statistics: Active participants, Correct answers, Incorrect answers, Answered progress bar, and individual student submissions.
  - "Show Correct Answer" button reveals the right choice to both Mentor and Students.
  - Comprehensive final summary: Aggregate stats and question table for the Mentor, and personalized score circle and review for Students.
- **Real-Time Sync via Pusher**:
  - Powered by **Pusher Channels** (Free Sandbox: 200,000 messages/day, 100 concurrent connections).
  - Uses serverless endpoint `/api/pusher/trigger` for Vercel, and dev middleware for local Vite development.
  - Built-in zero-config **BroadcastChannel** fallback for local testing across browser tabs.
- **Clean Design**:
  - Professional light theme matching the UI specifications pixel-for-pixel with zero emojis.

---

## Project Structure

```text
Precenter/
├── api/
│   └── pusher/
│       └── trigger.js             # Vercel serverless function to trigger Pusher events
├── index.html                     # HTML entry point with Inter font & Presenter title
├── package.json                   # Project dependencies and npm scripts
├── vite.config.js                 # Vite configuration with Pusher dev trigger middleware
├── tailwind.config.js             # Tailwind CSS theme & typography configuration
├── postcss.config.js              # PostCSS plugins
├── vercel.json                    # Vercel deployment & SPA rewrite routing
├── .env.example                   # Template for environment variables (Pusher)
├── README.md                      # Documentation & guide
├── public/
│   ├── images/
│   │   ├── slide1.jpg             # Image 1: "Introduction — 1 of 3"
│   │   ├── slide2.jpg             # Image 2: "Key Concepts — 2 of 3"
│   │   └── slide3.jpg             # Image 3: "Practical Application — 3 of 3"
│   └── vite.svg
├── src/
│   ├── main.js                    # Vue application entry point
│   ├── style.css                  # Tailwind styles and transitions
│   ├── App.vue                    # Root coordinator managing views & navigation
│   ├── services/
│   │   └── realtime.js            # Real-time service powered by Pusher & BroadcastChannel
│   ├── components/
│   │   ├── Navbar.vue             # Header with Presenter logo, Room pill, Role pill, Leave link
│   │   ├── RoleSelector.vue       # Welcome screen with Admin, Mentor, and Student role cards
│   │   ├── AdminRoomView.vue      # 6-digit room code display, Copy Code button, and instructions
│   │   ├── MentorLoginView.vue    # Mentor room code entry screen
│   │   ├── StudentJoinView.vue    # Student room code and display name entry screens
│   │   ├── StudentWaiting.vue     # Waiting for class to start screen with animated spinner
│   │   ├── ClassRoom.vue          # MAIN Vue orchestrator holding the ordered steps list
│   │   ├── QuestionView.vue       # Modular question template for Mentor and Student views
│   │   ├── MCQMentorSummary.vue   # Mentor final results dashboard with 3 stats & table
│   │   └── MCQStudentScore.vue    # Student final score screen with score ring & question review
│   └── steps/
│       ├── StepImage1.vue         # Step 1 component
│       ├── StepImage2.vue         # Step 2 component
│       ├── StepImage3.vue         # Step 3 component
│       ├── Counter.vue            # Step 4: Interactive Counter component
│       └── questions/
│           ├── Question1.vue      # Question 1: Networking (DHCP)
│           ├── Question2.vue      # Question 2: Databases (MongoDB)
│           ├── Question3.vue      # Question 3: Web Development (CSS)
│           ├── Question4.vue      # Question 4: JavaScript (Array push)
│           ├── Question5.vue      # Question 5: Cloud & DevOps (Docker)
│           └── Question6.vue      # Question 6: Operating Systems (Kernel)
```

---

## How to Add New Steps

To add a new step to the class flow, create a new Vue file and add its name to the `baseSteps` array in `src/components/ClassRoom.vue`. No other code needs to be modified!

### Example: Adding a New Slide Step
1. Create `src/steps/StepImage4.vue`:
```vue
<template>
  <div class="step-image-view w-full">
    <div class="relative w-full rounded-2xl overflow-hidden bg-gray-900 shadow-sm aspect-[16/10] max-h-[500px]">
      <img src="/images/slide4.jpg" alt="Summary" class="w-full h-full object-cover" />
      <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 p-6">
        <p class="text-white font-medium">Summary & Takeaways — 4 of 4</p>
      </div>
    </div>
  </div>
</template>
```

2. Open `src/components/ClassRoom.vue` and add it to `baseSteps`:
```javascript
import StepImage4 from '../steps/StepImage4.vue'

const baseSteps = [
  StepImage1,
  StepImage2,
  StepImage3,
  StepImage4,  // <-- Added here!
  Counter
]
```
The new step will automatically appear in that exact order on the web for both Mentor and all Students.

---

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Optional for Local Testing)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Pusher credentials from [pusher.com](https://dashboard.pusher.com):
```env
VITE_PUSHER_KEY=your_pusher_key_here
VITE_PUSHER_CLUSTER=ap2
PUSHER_APP_ID=your_pusher_app_id_here
PUSHER_SECRET=your_pusher_secret_here
```
> **Tip**: If keys are omitted during local development, the app automatically runs in **BroadcastChannel mode**, allowing multiple browser tabs (e.g., one Mentor tab and multiple Student tabs) to synchronize seamlessly on `localhost` without any setup!

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Vercel Deployment

1. Push your repository to **GitHub** (or GitLab / Bitbucket).
2. Go to [vercel.com](https://vercel.com) and click **"Add New..."** -> **"Project"**.
3. Import your repository. Vercel will automatically detect:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In the **Environment Variables** section, add your Pusher credentials:
   - `VITE_PUSHER_KEY`: Your Pusher app key
   - `VITE_PUSHER_CLUSTER`: Your Pusher cluster (e.g., `ap2` or `mt1`)
   - `PUSHER_APP_ID`: Your Pusher app ID
   - `PUSHER_SECRET`: Your Pusher secret key
5. Click **Deploy**. Your application is live worldwide!
