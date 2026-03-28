# Saving Quiz Results to Google Sheets — Setup Guide

This guide walks you through connecting the personality quiz to a Google Sheet so every completed quiz automatically saves the results.

---

## Step 1: Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click the big **+** (Blank spreadsheet) to create a new sheet
3. Name it something like **Personality Quiz Results** (click "Untitled spreadsheet" in the top-left to rename)

You don't need to add any headers — the script will do that for you.

---

## Step 2: Open Apps Script

1. In your new Google Sheet, click **Extensions** in the top menu bar
2. Click **Apps Script**
3. A new tab opens — this is the script editor where you'll paste the code

---

## Step 3: Paste the Code

1. In the Apps Script editor, you'll see a file called `Code.gs` with some placeholder text
2. **Select all** the placeholder text (Ctrl+A) and **delete** it
3. Open the file `google-sheets-webhook.js` from the quiz project folder
4. **Copy everything** from that file and **paste** it into the Apps Script editor
5. Click the **floppy disk icon** (or Ctrl+S) to save
6. You can rename the project to "Personality Quiz Webhook" by clicking "Untitled project" at the top-left

---

## Step 4: Set Up the Sheet Headers

Before deploying, run the header setup so your sheet has column names:

1. In the Apps Script editor, look at the dropdown near the top that says **doPost** — click it and select **setupHeaders**
2. Click the **Run** button (the play/triangle icon)
3. Google will ask you to **review permissions** — click **Review permissions**
4. Choose your Google account
5. You may see a warning that says "Google hasn't verified this app" — click **Advanced**, then **Go to Personality Quiz Webhook (unsafe)**
6. Click **Allow**
7. Switch back to your Google Sheet tab — you should see bold headers in row 1

---

## Step 5: Deploy as a Web App

1. Go back to the Apps Script editor tab
2. Click the blue **Deploy** button in the top-right
3. Click **New deployment**
4. Next to "Select type", click the **gear icon** and choose **Web app**
5. Fill in these settings:
   - **Description:** `Personality Quiz Webhook` (or anything you like)
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
6. Click **Deploy**
7. Google may ask for permissions again — follow the same steps as Step 4 (Review permissions, Allow)
8. You'll see a **Web app URL** — it looks something like:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
9. **Copy this URL** — this is your webhook URL

---

## Step 6: Connect It to the Quiz App

This is where you (or the developer) paste the webhook URL into the quiz code so results get sent automatically.

The quiz app needs a small update to send results to your new webhook. The code will make a POST request to that URL with the quiz results whenever someone finishes the quiz.

The data sent looks like this:

```json
{
  "timestamp": "2026-03-27T10:30:00.000Z",
  "name": "Jane",
  "mbtiType": "ENFP",
  "enneagramType": "7w6",
  "discType": "I",
  "loveLanguage": "Quality Time",
  "bigFive": {
    "O": 85,
    "C": 60,
    "E": 72,
    "A": 68,
    "N": 35
  }
}
```

---

## Step 7: Test It

1. Open the webhook URL in your browser — you should see:
   ```json
   {"status":"ok","message":"Webhook is running"}
   ```
   This confirms the webhook is live.
2. Complete the quiz and check your Google Sheet — a new row should appear.

---

## Updating the Script Later

If you ever need to change the code:

1. Open the Google Sheet
2. Go to **Extensions** > **Apps Script**
3. Make your changes and save
4. Click **Deploy** > **Manage deployments**
5. Click the **pencil icon** next to your deployment
6. Change **Version** to **New version**
7. Click **Deploy**

The URL stays the same — no need to update the quiz app.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "Google hasn't verified this app" warning | Click **Advanced** > **Go to ... (unsafe)** — this is normal for personal scripts |
| No new rows appearing | Check that "Who has access" is set to **Anyone** in the deployment settings |
| Error response from webhook | Open Apps Script, click **Executions** in the left sidebar to see error logs |
| Need to re-deploy | **Deploy** > **Manage deployments** > pencil icon > set version to **New version** > Deploy |
