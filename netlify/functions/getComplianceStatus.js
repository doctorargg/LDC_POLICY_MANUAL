const { google } = require('googleapis');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Initialize Google Auth from environment variables
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/drive.readonly',
      ],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });

    // Get compliance data from Google Sheets
    const spreadsheetId = process.env.COMPLIANCE_SPREADSHEET_ID;
    
    // Fetch license data
    const licenseResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Licenses!A2:F100', // Adjust range as needed
    });

    // Fetch certification data
    const certResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Certifications!A2:F100',
    });

    // Fetch policy data
    const policyResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Policies!A2:F100',
    });

    // Process the data
    const processData = (rows) => {
      if (!rows || !rows.length) return [];
      
      return rows.map(row => ({
        type: row[0] || '',
        name: row[1] || '',
        expirationDate: row[2] || '',
        status: row[3] || '',
        lastUpdated: row[4] || '',
        notes: row[5] || '',
      }));
    };

    const licenses = processData(licenseResponse.data.values);
    const certifications = processData(certResponse.data.values);
    const policies = processData(policyResponse.data.values);

    // Calculate compliance metrics
    const calculateCompliance = (items) => {
      const total = items.length;
      if (total === 0) return { percentage: 100, expired: 0, expiringSoon: 0 };

      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      let expired = 0;
      let expiringSoon = 0;
      let current = 0;

      items.forEach(item => {
        if (item.expirationDate) {
          const expDate = new Date(item.expirationDate);
          if (expDate < today) {
            expired++;
          } else if (expDate < thirtyDaysFromNow) {
            expiringSoon++;
          } else {
            current++;
          }
        } else {
          current++; // No expiration date means it's current
        }
      });

      const percentage = Math.round((current / total) * 100);
      
      return { percentage, expired, expiringSoon, current, total };
    };

    const complianceData = {
      licenses: {
        items: licenses,
        metrics: calculateCompliance(licenses),
      },
      certifications: {
        items: certifications,
        metrics: calculateCompliance(certifications),
      },
      policies: {
        items: policies,
        metrics: calculateCompliance(policies),
      },
      overall: {
        lastUpdated: new Date().toISOString(),
      },
    };

    // Calculate overall compliance percentage
    const allItems = [...licenses, ...certifications, ...policies];
    complianceData.overall.metrics = calculateCompliance(allItems);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(complianceData),
    };
  } catch (error) {
    console.error('Error fetching compliance data:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch compliance data',
        message: error.message 
      }),
    };
  }
};