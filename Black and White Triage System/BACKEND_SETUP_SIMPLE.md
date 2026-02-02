# Backend Setup - Quick Guide

## Step 1: Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a **new blank spreadsheet**
3. Name it: `Black and White Triage System`
4. **Copy the Spreadsheet ID** from the URL:
   - URL looks like: `https://docs.google.com/spreadsheets/d/ABC123XYZ/edit`
   - Copy just: `ABC123XYZ` (the part between `/d/` and `/edit`)

## Step 2: Paste Backend Code

1. Open your spreadsheet
2. Go to **Extensions > Apps Script**
3. Delete any existing code in the editor
4. Copy and paste the entire contents of `apps-script-backend.js`
5. Find this line (around line 19):
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   ```
6. Replace `YOUR_SPREADSHEET_ID_HERE` with your Spreadsheet ID:
   ```javascript
   const SPREADSHEET_ID = 'ABC123XYZ';  // Your actual ID here
   ```
7. Click **Save** (Ctrl+S or Cmd+S)
8. Name your project: `Triage System Backend`

## Step 3: Auto-Setup Sheets (OPTIONAL - Auto-creates on first use)

**Good news:** The code automatically creates all sheets with headers when first used! You can skip this step.

**OR** if you want to see them immediately:

1. In Apps Script editor, click the function dropdown (top center)
2. Select `setupSheets`
3. Click **Run** (▶️ button)
4. If prompted, click **Review Permissions** → **Advanced** → **Go to [Project Name] (unsafe)** → **Allow**
5. Check the execution log - should say "Setup complete!"
6. Go back to your spreadsheet - you should now see:
   - **TriageEntries** sheet (with all 14 columns)
   - **TeamMembers** sheet (with 3 columns)

## Step 4: Deploy as Web App

1. In Apps Script editor, click **Deploy > New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure:
   - **Description**: `Triage System API`
   - **Execute as**: `Me` (your email)
   - **Who has access**: `Anyone` (or `Anyone with Google account` for security)
5. Click **Deploy**
6. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/AKfycb.../exec`)
7. Click **Done**

## Step 5: Give Me the Links

Send me:
1. **Web App URL** (from Step 4)
2. **Spreadsheet URL** (the full Google Sheets link)

I'll update the frontend code with your Web App URL, and you'll be ready to go!

## That's It!

The system will automatically:
- ✅ Create all required sheets with proper headers (on first use)
- ✅ Set up all 14 columns in TriageEntries sheet automatically
- ✅ Set up all 3 columns in TeamMembers sheet automatically
- ✅ Track team members as users log in
- ✅ Handle all data operations

**No manual sheet setup needed - everything is automatic!**

Once you send me the Web App URL and Spreadsheet URL, I'll update the frontend code and you're ready to go!

