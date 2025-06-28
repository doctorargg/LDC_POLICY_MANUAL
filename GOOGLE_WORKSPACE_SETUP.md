# Google Workspace Compliance Integration Setup Guide

This guide will help you set up the Google Workspace integration for real-time compliance tracking in your Lotus Direct Care Policy Manual.

## Overview

The compliance system automatically pulls data from Google Sheets to display:
- License expiration dates and statuses
- Certification tracking
- Policy review dates
- Real-time compliance percentages
- Alerts for expiring documents

## Prerequisites

- Google Account with access to Google Workspace
- Netlify account for hosting
- Basic familiarity with Google Cloud Console

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Create Project" or select from dropdown
3. Name your project: "Lotus Direct Care Compliance"
4. Note your Project ID (you'll need this later)

## Step 2: Enable Required APIs

In your Google Cloud Project:

1. Go to "APIs & Services" > "Enable APIs and Services"
2. Search for and enable these APIs:
   - Google Drive API
   - Google Sheets API
   - Google Docs API

## Step 3: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Service account details:
   - Name: `compliance-tracker`
   - ID: `compliance-tracker`
   - Description: "Service account for compliance tracking"
4. Click "Create and Continue"
5. Grant roles:
   - Basic > Viewer
6. Click "Done"

## Step 4: Generate Service Account Key

1. Click on your service account email
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose JSON format
5. Download the key file (keep this secure!)

## Step 5: Create Google Sheets Structure

### 1. Create Compliance Master Spreadsheet

Create a new Google Sheet named "Lotus Direct Care Compliance Master" with these tabs:

#### Tab 1: Licenses
| Column | Description | Example |
|--------|-------------|---------|
| A | Type | Medical License |
| B | Name | Dr. Jane Smith - WI Medical License |
| C | Expiration Date | 2025-12-31 |
| D | Status | Current |
| E | Last Updated | 2025-01-15 |
| F | Notes | Renewal submitted |

#### Tab 2: Certifications
| Column | Description | Example |
|--------|-------------|---------|
| A | Type | BLS |
| B | Name | Dr. Jane Smith - BLS Certification |
| C | Expiration Date | 2025-06-30 |
| D | Status | Current |
| E | Last Updated | 2025-01-15 |
| F | Notes | AHA Provider |

#### Tab 3: Policies
| Column | Description | Example |
|--------|-------------|---------|
| A | Type | Clinical Protocol |
| B | Name | HIPAA Privacy Policy |
| C | Review Date | 2025-03-01 |
| D | Status | Current |
| E | Last Updated | 2025-01-15 |
| F | Notes | Annual review |

#### Tab 4: Insurance
| Column | Description | Example |
|--------|-------------|---------|
| A | Type | Malpractice |
| B | Name | Professional Liability Insurance |
| C | Expiration Date | 2025-12-31 |
| D | Status | Current |
| E | Last Updated | 2025-01-15 |
| F | Notes | Policy #12345 |

### 2. Share with Service Account

1. Open your spreadsheet
2. Click "Share" button
3. Add the service account email (found in your service account details)
4. Grant "Viewer" permission
5. Click "Send"

### 3. Get Spreadsheet ID

1. Open your spreadsheet
2. Look at the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
3. Copy the SPREADSHEET_ID portion

## Step 6: Create Google Drive Folder Structure

Create this folder structure in Google Drive:

```
/Lotus Direct Care Compliance/
├── /Active Documents/
│   ├── /Licenses/
│   ├── /Certifications/
│   ├── /Insurance/
│   └── /Policies/
├── /Archive/
│   └── /[Year folders]/
└── /Templates/
    ├── Policy Review Checklist.docx
    └── Compliance Audit Template.docx
```

Share the main folder with your service account email.

## Step 7: Deploy to Netlify

### 1. Environment Variables

In Netlify dashboard:
1. Go to Site Settings > Environment Variables
2. Add these variables:

```
GOOGLE_SERVICE_ACCOUNT_KEY = [paste entire JSON key file contents]
COMPLIANCE_SPREADSHEET_ID = [your spreadsheet ID]
```

### 2. Deploy Settings

1. Connect your GitHub repository
2. Build settings:
   - Build command: `npm install`
   - Publish directory: `.`
3. Deploy the site

## Step 8: Test the Integration

1. Visit your Netlify site URL
2. Navigate to "Compliance Center"
3. You should see:
   - Loading spinner initially
   - Real-time compliance data from your Google Sheet
   - Color-coded status badges
   - Expiration alerts

## Maintenance

### Adding New Items
1. Add rows to appropriate tabs in Google Sheets
2. Data appears automatically on next refresh (5 minutes)

### Updating Status
1. Update cells in Google Sheets
2. Changes reflect in real-time

### Document Management
1. Upload documents to appropriate Google Drive folders
2. Reference in spreadsheet for tracking

## Troubleshooting

### "Unable to Load Compliance Data" Error
- Check service account permissions
- Verify spreadsheet ID is correct
- Ensure APIs are enabled
- Check Netlify function logs

### Data Not Updating
- Verify date formats (YYYY-MM-DD)
- Check sharing permissions
- Clear browser cache
- Check console for errors

## Security Notes

- Never commit service account keys to Git
- Use Netlify environment variables only
- Regularly rotate service account keys
- Limit service account permissions to minimum needed

## Support

For issues:
1. Check Netlify function logs
2. Verify Google Cloud Console for API errors
3. Ensure all permissions are correctly set

---

Last Updated: January 2025