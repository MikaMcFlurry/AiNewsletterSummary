AI Email-newsletter Summary
This repository contains a Google Apps Script to automatically summarize emails using the OpenAI GPT-3.5-turbo model. The script retrieves emails sent to specified recipients, saves them as text files in Google Drive, and generates a summary of the emails using the GPT-3.5-turbo model. Finally, the summary is sent to designated recipients via email.

Features
    -Retrieve emails sent to specific recipients within the last 24 hours
    -Save the retrieved emails as text files in Google Drive
    -Generate summaries of the emails using OpenAI's GPT-3.5-turbo model
    -Send the generated summaries to specified email recipients
    -Support Gmail's "plus" addressing feature for creating custom email aliases

Prerequisites
    -A Google account with access to Google Apps Script, Google Drive, and Gmail
    -An OpenAI API key for using the GPT-3.5-turbo model

Setup
    1. Create a new Google Sheets document and create two sheets named "Variables" and "Recipients".

    2. In the "Variables" sheet, add the following information:

        openAiApiKey | [Your OpenAI API Key]
        folderId     | [Google Drive Folder ID to store email text files]

    3. In the "Recipients" sheet, add the email addresses of the recipients in the following format:

        | Newsletter Recipients | Summary Recipients |
        |-----------------------|--------------------|
        | recipient1@email.com  | summary1@email.com |
        | recipient2@email.com  | summary2@email.com |
    
        To use Gmail's "plus" addressing feature, simply add +yourtext before the @ symbol. For example: example@gmail.com can be example+newsletter@gmail.com.

    4.  Create a new Google Apps Script project and copy the code provided in the Code.gs file in this repository.

    5. Replace the SPREADSHEET_ID variable with the ID of your newly created Google Sheets document.

    6. Save and deploy the script by selecting "Publish" > "Deploy as API executable" in the Google Apps Script editor.

Usage
To automate the script to run every 24 hours, follow these steps:

    1. In the Google Apps Script editor, click on the clock icon to open the "Triggers" page.
    2, Click on the "+ Add Trigger" button at the bottom right of the page.
    3. In the "Choose which function to run" dropdown menu, select the main function.
    4. In the "Select event source" dropdown menu, choose "Time-driven."
    5. In the "Select type of time based trigger" dropdown menu, select "Day timer."
    6. Choose the time range you want the script to run (e.g., "2am to 3am").
    7. Optionally, you can set the "Failure notification settings" to receive an email if the script fails to execute.
    8. Click on "Save" to create the trigger.

Now the script will automatically run every 24 hours within the specified time range.