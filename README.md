# Lotus Direct Care - Interactive Policy Manual

A comprehensive web-based policy manual with real-time Google Workspace integration for compliance tracking, document management, and operational procedures.

## Features

### 📋 Policy Management
- Interactive navigation for all policies and procedures
- Emergency response procedures with step-by-step guides
- Clinical protocols for specialized services (Ketamine therapy, mental health, etc.)
- HIPAA, OSHA, CLIA, and Wisconsin state compliance documentation

### 📊 Real-Time Compliance Tracking
- Live dashboard showing compliance status
- Automatic tracking of license and certification expiration dates
- Visual indicators (green/yellow/red) for document status
- Alerts for expiring documents within 30 days
- Integration with Google Sheets for data management

### 🔔 Automated Notifications
- Email alerts for expiring documents
- Customizable notification thresholds
- Batch notifications for multiple stakeholders

### 💾 Data Management
- Export compliance data to CSV or JSON formats
- Offline mode with cached data
- Automatic data synchronization every 5 minutes
- Secure API integration with Google Workspace

### 🎨 User Interface
- Responsive design for desktop and mobile
- Clean, professional healthcare-focused design
- Quick access dashboard with compliance widget
- Accordion-style content organization

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Google Account with Google Workspace access
- Netlify account for deployment

### Installation

1. Clone the repository:
```bash
git clone https://github.com/doctorargg/LDC_POLICY_MANUAL.git
cd LDC_POLICY_MANUAL
```

2. Install dependencies:
```bash
npm install
```

3. Set up Google Workspace integration:
   - Follow the detailed instructions in `GOOGLE_WORKSPACE_SETUP.md`
   - Create service account and download credentials
   - Set up compliance tracking spreadsheet

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

5. Deploy to Netlify:
```bash
# Windows
deploy.bat

# Mac/Linux
./deploy.sh
```

## Project Structure

```
├── index_improved.html      # Main application file
├── netlify/                 # Serverless functions
│   └── functions/
│       ├── getComplianceStatus.js
│       ├── checkDocumentExpiry.js
│       ├── sendExpiryNotifications.js
│       └── exportComplianceData.js
├── data/                    # Static data files
│   └── fallback-compliance-data.json
├── templates/               # CSV templates for Google Sheets
│   ├── compliance_data_template.csv
│   ├── certifications_template.csv
│   └── policies_template.csv
├── test/                    # Test files
│   ├── compliance.test.js
│   └── test-runner.html
└── docs/                    # Documentation
    └── GOOGLE_WORKSPACE_SETUP.md
```

## Usage

### Viewing the Policy Manual
1. Open the site in your browser
2. Navigate using the top menu or quick links
3. Click accordion headers to expand content

### Managing Compliance Data
1. Go to "Compliance Center" in the navigation
2. View real-time compliance metrics
3. Export data using CSV or JSON buttons
4. Set up Google Sheets with provided templates

### Setting Up Notifications
1. Configure `NOTIFICATION_EMAIL` in Netlify environment
2. Schedule the `sendExpiryNotifications` function
3. Customize notification thresholds in the function

## Testing

Run automated tests:
```bash
# Node.js tests
npm test

# Browser tests
npm run test:browser
```

## Security

- All API keys stored as environment variables
- Service account with minimal permissions
- No sensitive data in client-side code
- HTTPS enforced on Netlify deployment

## Troubleshooting

### Common Issues

1. **"Unable to Load Compliance Data" Error**
   - Check Google Cloud Console for API status
   - Verify service account permissions
   - Ensure spreadsheet is shared with service account

2. **Export Function Not Working**
   - Check browser console for errors
   - Verify Netlify function logs
   - Ensure proper CORS configuration

3. **Offline Mode Not Working**
   - Clear browser cache and localStorage
   - Check for fallback-compliance-data.json
   - Verify file paths are correct

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is proprietary to Lotus Direct Care. All rights reserved.

## Support

For technical support or questions:
- Check the troubleshooting guide
- Review Netlify function logs
- Contact IT support

---

Last Updated: January 2025
Version: 1.0.0