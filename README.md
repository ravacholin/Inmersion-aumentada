<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Inmersión Aumentada - AR Spanish Learning App

An augmented reality app that helps you learn contextual Spanish by analyzing images and providing relevant phrases.

View your app in AI Studio: https://ai.studio/apps/drive/1KNZC4tgYYTV3bakOd36BpfHIdOfncIib

## 🔑 Important: Two Google Services Required

This app uses **two separate Google services**:

### 1. Google OAuth (Already Configured ✅)
- **Purpose:** User authentication (login)
- **What it does:** Allows users to sign in with their Google account
- **Status:** Already set up with Client ID

### 2. Google Gemini API (Requires Your API Key 🔑)
- **Purpose:** AI image analysis
- **What it does:** Powers the AI that analyzes images and generates Spanish phrases
- **Status:** Requires a free API key from Google

**These are completely separate services!** Logging in with Google OAuth does NOT give you access to the Gemini API.

## 🚀 Quick Start

### Option 1: Use the App (Easiest)
1. Open the deployed app
2. Sign in with Google OAuth
3. When prompted, enter your Gemini API key (get it from [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey))
4. The app will save your key in your browser's local storage

### Option 2: Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. (Optional) Set up environment variables for local development:
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

4. If you didn't set the environment variable, the app will prompt you to enter your API key in the UI.

## 🔐 Getting Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)
5. Enter it in the app when prompted OR add it to `.env.local`

**Note:** The Gemini API has a generous free tier, so you don't need to pay to use this app!

## 🛡️ Security Note

Your Gemini API key is either:
- Stored in your browser's local storage (if entered in the UI)
- Stored in `.env.local` (if running locally)

The key is only sent to Google's Gemini API and nowhere else. However, since this is a client-side app, the API key is exposed in the browser. For production use, consider using a backend proxy to secure your API key.
