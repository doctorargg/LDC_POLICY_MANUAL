const { google } = require('googleapis');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.COMPLIANCE_SPREADSHEET_ID;

    // Get all documents with expiration dates
    const ranges = ['Licenses!A2:F100', 'Certifications!A2:F100', 'Insurance!A2:F100'];
    
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });

    const expiringDocuments = [];
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysFromNow = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);

    response.data.valueRanges.forEach((range, index) => {
      const sheetName = ranges[index].split('!')[0];
      if (range.values) {
        range.values.forEach(row => {
          if (row[2]) { // Has expiration date
            const expDate = new Date(row[2]);
            const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
            
            if (expDate <= sixtyDaysFromNow) {
              expiringDocuments.push({
                category: sheetName,
                type: row[0] || '',
                name: row[1] || '',
                expirationDate: row[2],
                daysUntilExpiry,
                status: expDate < today ? 'expired' : 
                        expDate <= thirtyDaysFromNow ? 'urgent' : 'warning',
                responsible: row[6] || 'Not assigned',
              });
            }
          }
        });
      }
    });

    // Sort by urgency
    expiringDocuments.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        expiringDocuments,
        summary: {
          expired: expiringDocuments.filter(d => d.status === 'expired').length,
          urgent: expiringDocuments.filter(d => d.status === 'urgent').length,
          warning: expiringDocuments.filter(d => d.status === 'warning').length,
          total: expiringDocuments.length,
        },
        lastChecked: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Error checking document expiry:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to check document expiry',
        message: error.message 
      }),
    };
  }
};