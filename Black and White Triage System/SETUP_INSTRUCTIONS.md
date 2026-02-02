# Black and White Accounting - Triage System Setup Instructions

## Overview
This triage system consists of two main components:
1. **Frontend HTML file** - Can be embedded in Squarespace
2. **Google Apps Script Backend** - Handles data storage and API requests

## Step 1: Set Up Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it something like "Black and White Triage System"
4. **Copy the Spreadsheet ID** from the URL:
   - The URL will look like: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`
   - Copy the part between `/d/` and `/edit`

## Step 2: Set Up Google Apps Script Backend

1. In your Google Spreadsheet, go to **Extensions > Apps Script**
2. Delete any default code in the script editor
3. Copy and paste the entire contents of `apps-script-backend.js` into the editor
4. **IMPORTANT**: Update line 17 in the script:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   ```
   Replace `YOUR_SPREADSHEET_ID_HERE` with the Spreadsheet ID you copied in Step 1

5. Save the script (Ctrl+S or Cmd+S)
6. Name your project (e.g., "Triage System Backend")

## Step 3: Initialize the Sheets

1. In the Apps Script editor, click on the function dropdown (it will say "myFunction" or similar)
2. Select `setupSheets` from the dropdown
3. Click the **Run** button (▶️)
4. You may be prompted to authorize the script:
   - Click "Review Permissions"
   - Choose your Google account
   - Click "Advanced" → "Go to [Your Project Name] (unsafe)"
   - Click "Allow"
5. Check the execution log - you should see "Setup complete!" messages
6. Go back to your Google Spreadsheet - you should now see two new sheets:
   - **TriageEntries** - stores all triage entries
   - **TeamMembers** - stores employee information (auto-populated as users log in)

## Step 4: Deploy as Web App

1. In the Apps Script editor, click **Deploy > New deployment**
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**
3. Configure the deployment:
   - **Description**: "Triage System API v1" (or any description)
   - **Execute as**: Me ([your email])
   - **Who has access**: Anyone (or "Anyone with Google account" for more security)
   - Click **Deploy**
4. **Copy the Web App URL** - You'll need this for the frontend
   - It will look like: `https://script.google.com/macros/s/AKfycb.../exec`
5. Click **Done**

## Step 5: Update Frontend HTML File

1. Open `triage-system.html` in a text editor
2. Find line 475 (look for `const API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';`)
3. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with the Web App URL you copied in Step 4
   ```javascript
   const API_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
   ```
4. Save the file

## Step 6: Embed in Squarespace

1. Log in to your Squarespace account
2. Go to the page where you want to add the triage system
3. Add a **Code Block** element:
   - Click **Edit** on your page
   - Click the **+** button to add content
   - Select **Code** from the blocks
4. In the code block, click **</>** to view HTML
5. Copy the entire contents of `triage-system.html`
6. Paste it into the code block
7. Click **Save** and **Publish**

## Step 7: Test the System

1. Visit your Squarespace page
2. You should see the login screen
3. Enter any name and email (this will be saved as the user who created entries)
4. Click **Login**
5. Try creating a new triage entry:
   - Click **+ New Triage**
   - Fill in the required fields (Client Name, Description, Importance, Status)
   - Add optional fields (phone, email, deadline, assign to, notes)
   - Click **Save Triage**
6. Verify the entry appears in your Google Spreadsheet:
   - Go to your Google Spreadsheet
   - Check the **TriageEntries** sheet - you should see your new entry

## Features Included

### Core Features
- ✅ User login system (tracks who created each entry)
- ✅ Create, edit, and delete triage entries
- ✅ Client details (name, phone, email)
- ✅ Importance rating (Critical, High, Medium, Low)
- ✅ Status tracking (Open, In Progress, Resolved)
- ✅ Assign entries to team members
- ✅ Deadline setting with visual warnings for overdue/urgent items
- ✅ Additional notes field
- ✅ Search functionality
- ✅ Filter by importance, status, and assigned team member
- ✅ Sort by deadline urgency and importance
- ✅ Loading states and animations
- ✅ Toast notifications for user feedback
- ✅ Responsive design (works on mobile and desktop)
- ✅ Automatic team member tracking

### UI/UX Features
- ✅ Modern, polished interface
- ✅ Color-coded importance badges
- ✅ Status badges
- ✅ Deadline warnings (overdue items pulse red)
- ✅ Empty state messages
- ✅ Modal dialogs for create/edit
- ✅ Form validation
- ✅ Confirmation dialogs for deletions
- ✅ Smooth animations and transitions

## Troubleshooting

### Issue: "Error connecting to server"
- **Solution**: Double-check that the API_URL in the HTML file matches your deployed Web App URL exactly
- Make sure the Web App deployment has "Anyone" access enabled

### Issue: "Spreadsheet not found" or permission errors
- **Solution**: 
  1. Verify the SPREADSHEET_ID in the Apps Script code is correct
  2. Make sure the Apps Script project has access to the spreadsheet
  3. Try running `setupSheets()` function again in Apps Script

### Issue: Sheets not being created
- **Solution**: 
  1. Run the `setupSheets()` function manually in Apps Script
  2. Check the execution log for any errors
  3. Make sure you've authorized all required permissions

### Issue: Data not saving
- **Solution**:
  1. Check the browser console (F12) for JavaScript errors
  2. Verify the Web App is deployed and accessible
  3. Check Apps Script execution logs for errors

### Issue: CORS errors
- **Solution**: Make sure your Web App deployment has "Anyone" or "Anyone with Google account" access. Restricted access can cause CORS issues.

## Security Notes

- The current setup allows anyone with the URL to access the system
- For production use, consider:
  - Using "Anyone with Google account" access instead of "Anyone"
  - Adding authentication to the Apps Script backend
  - Implementing user role management
  - Adding rate limiting

## Customization

### Adding Team Members Manually
You can manually add team members to the **TeamMembers** sheet:
1. Open your Google Spreadsheet
2. Go to the **TeamMembers** sheet
3. Add a new row with:
   - Column A: Employee Name
   - Column B: Email (optional)
   - Column C: Timestamp (can be left blank)

### Changing Colors/Theme
Edit the CSS in the `<style>` section of `triage-system.html` to match your brand colors.

### Adding More Fields
1. Add new form fields in the modal (`triageForm`)
2. Update the JavaScript `saveTriage()` function to include new fields
3. Update the Apps Script `createTriage()` and `updateTriage()` functions
4. Add the new column headers to the Apps Script sheet initialization

## Support

If you encounter any issues:
1. Check the browser console (F12) for JavaScript errors
2. Check Apps Script execution logs
3. Verify all URLs and IDs are correctly set
4. Ensure all permissions are granted

## Next Steps

Once the system is set up and working:
1. Train your team on how to use it
2. Set up regular data exports/backups from Google Sheets
3. Consider adding email notifications for critical items
4. Add additional features as needed (e.g., reports, analytics)







