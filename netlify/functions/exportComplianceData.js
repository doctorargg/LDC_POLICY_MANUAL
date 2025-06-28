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
    // Get export format from query parameters
    const { format = 'csv' } = event.queryStringParameters || {};
    
    // Initialize Google Auth
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.COMPLIANCE_SPREADSHEET_ID;
    
    // Get all compliance data
    const ranges = [
      'Licenses!A1:F100',
      'Certifications!A1:F100', 
      'Policies!A1:F100',
      'Insurance!A1:F100'
    ];
    
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });

    // Combine all data
    let allData = [];
    const timestamp = new Date().toISOString();
    
    response.data.valueRanges.forEach((range, index) => {
      const sheetName = ranges[index].split('!')[0];
      if (range.values && range.values.length > 1) {
        // Skip header row (index 0) and add category column
        for (let i = 1; i < range.values.length; i++) {
          const row = range.values[i];
          if (row && row.length > 0) {
            allData.push({
              category: sheetName,
              type: row[0] || '',
              name: row[1] || '',
              expirationDate: row[2] || '',
              status: row[3] || '',
              lastUpdated: row[4] || '',
              notes: row[5] || '',
            });
          }
        }
      }
    });

    // Generate export based on format
    let exportData;
    let contentType;
    let filename;

    switch (format.toLowerCase()) {
      case 'json':
        exportData = JSON.stringify({
          exportDate: timestamp,
          totalRecords: allData.length,
          data: allData,
          metadata: {
            source: 'Lotus Direct Care Compliance System',
            spreadsheetId: spreadsheetId,
          }
        }, null, 2);
        contentType = 'application/json';
        filename = `compliance_export_${new Date().toISOString().split('T')[0]}.json`;
        break;

      case 'csv':
      default:
        // Create CSV with headers
        const csvHeaders = ['Category', 'Type', 'Name', 'Expiration Date', 'Status', 'Last Updated', 'Notes'];
        let csvContent = csvHeaders.join(',') + '\n';
        
        allData.forEach(item => {
          const row = [
            escapeCSV(item.category),
            escapeCSV(item.type),
            escapeCSV(item.name),
            escapeCSV(item.expirationDate),
            escapeCSV(item.status),
            escapeCSV(item.lastUpdated),
            escapeCSV(item.notes)
          ];
          csvContent += row.join(',') + '\n';
        });
        
        // Add summary at the end
        csvContent += '\n\n';
        csvContent += `"Export Date","${timestamp}"\n`;
        csvContent += `"Total Records","${allData.length}"\n`;
        
        exportData = csvContent;
        contentType = 'text/csv';
        filename = `compliance_export_${new Date().toISOString().split('T')[0]}.csv`;
        break;
    }

    // Calculate summary statistics
    const today = new Date();
    let expired = 0;
    let expiringSoon = 0;
    let current = 0;
    
    allData.forEach(item => {
      if (item.expirationDate) {
        const expDate = new Date(item.expirationDate);
        const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) {
          expired++;
        } else if (daysUntilExpiry <= 30) {
          expiringSoon++;
        } else {
          current++;
        }
      } else {
        current++; // No expiration counts as current
      }
    });

    // Return the export data
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
      body: exportData,
      isBase64Encoded: false,
    };

  } catch (error) {
    console.error('Error exporting compliance data:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to export compliance data',
        message: error.message 
      }),
    };
  }
};

// Helper function to escape CSV values
function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  
  const stringValue = value.toString();
  
  // Check if value needs to be quoted
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    // Escape double quotes by doubling them
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}