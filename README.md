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

Follow these detailed steps to create your free Gemini API key:

### Step 1: Access Google AI Studio
1. Open your browser and go to [Google AI Studio API Keys page](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account if you're not already logged in
   - Use any personal Google account (Gmail)
   - You don't need a Google Cloud account or payment method for the free tier

### Step 2: Create Your API Key

**If you see existing API keys:**
- You can reuse an existing key if you have one
- Simply copy the key by clicking the copy icon next to it
- Skip to Step 3

**If this is your first time (no existing keys):**

1. Look for the blue **"Create API Key"** button (usually in the top right or center of the page)
2. Click **"Create API Key"**
3. You'll see a dialog with two options:
   - **"Create API key in new project"** - Choose this if you don't have a Google Cloud project (recommended for most users)
   - **"Create API key in existing project"** - Choose this only if you already have a Google Cloud project you want to use

4. For most users: Click **"Create API key in new project"**
   - Google will automatically create a new project for you
   - Wait a few seconds while the project and key are being created

5. A dialog will appear showing your new API key
   - The key will look like: `AIzaSyD...` (starts with `AIza`)
   - **Important:** Click the **copy icon** to copy the key immediately
   - You can also click "Show API key" to reveal it if it's hidden

### Step 3: Verify Your API Key
- Your API key should be approximately 39 characters long
- It should start with `AIza`
- Example format: `AIzaSyD-Xxxxxxxxxxxxxxxxxxxxxxxxxxx-Xxxx`

### Step 4: Use Your API Key

**Option A: Enter in the App (Recommended)**
1. Paste the API key when the app prompts you
2. The app will securely store it in your browser's local storage
3. You won't need to enter it again on the same browser

**Option B: Set as Environment Variable (For Local Development)**
1. Copy `.env.local.example` to `.env.local`
2. Open `.env.local` and replace `your_gemini_api_key_here` with your actual key:
   ```
   GEMINI_API_KEY=AIzaSyD-Xxxxxxxxxxxxxxxxxxxxxxxxxxx-Xxxx
   ```
3. Save the file and restart your development server

### Troubleshooting

**Problem: "Create API Key" button is grayed out or disabled**
- Solution: Make sure you're signed in with a Google account
- Try refreshing the page
- Clear your browser cache and try again

**Problem: API key doesn't work / Getting 403 errors**
- Solution: Make sure you copied the entire key (all 39 characters)
- Verify there are no extra spaces before or after the key
- The Gemini API might need a few minutes to activate after creation - wait 2-5 minutes and try again

**Problem: Can't find the API keys page**
- Solution: Make sure you're using the direct link: https://aistudio.google.com/app/apikey
- The page requires JavaScript to be enabled in your browser

### API Key Security & Best Practices

- **Free Tier Limits:** The Gemini API offers a generous free tier with up to 60 requests per minute
- **Don't share your API key:** Treat it like a password
- **Regenerate if exposed:** If you accidentally expose your key publicly, delete it in AI Studio and create a new one
- **Browser storage:** When using the app, your key is stored only in your browser's local storage and is sent only to Google's Gemini API
- **Production use:** For production applications, implement a backend proxy to keep your API key secure and hidden from the client side

**Note:** The Gemini API has a generous free tier, so you don't need to pay to use this app!

## 🛡️ Security Note

Your Gemini API key is either:
- Stored in your browser's local storage (if entered in the UI)
- Stored in `.env.local` (if running locally)

The key is only sent to Google's Gemini API and nowhere else. However, since this is a client-side app, the API key is exposed in the browser. For production use, consider using a backend proxy to secure your API key.
