const { google } = require('googleapis');

// This function can be called on a schedule (e.g., daily via Netlify scheduled functions)
// or manually via API endpoint
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
    // Initialize Google Auth
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/gmail.send',
      ],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const gmail = google.gmail({ version: 'v1', auth });
    
    const spreadsheetId = process.env.COMPLIANCE_SPREADSHEET_ID;
    const recipientEmail = process.env.NOTIFICATION_EMAIL || 'admin@lotusdirectcare.com';
    
    // Get all documents with expiration dates
    const ranges = ['Licenses!A2:F100', 'Certifications!A2:F100', 'Insurance!A2:F100'];
    
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });

    const expiringDocuments = [];
    const expiredDocuments = [];
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Process all documents
    response.data.valueRanges.forEach((range, index) => {
      const sheetName = ranges[index].split('!')[0];
      if (range.values) {
        range.values.forEach(row => {
          if (row[2]) { // Has expiration date
            const expDate = new Date(row[2]);
            const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
            
            if (expDate < today) {
              expiredDocuments.push({
                category: sheetName,
                name: row[1] || 'Unknown',
                expirationDate: row[2],
                daysOverdue: Math.abs(daysUntilExpiry),
              });
            } else if (expDate <= thirtyDaysFromNow) {
              expiringDocuments.push({
                category: sheetName,
                name: row[1] || 'Unknown',
                expirationDate: row[2],
                daysUntilExpiry,
              });
            }
          }
        });
      }
    });

    // Only send email if there are expiring or expired documents
    if (expiredDocuments.length === 0 && expiringDocuments.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'No documents expiring within 30 days',
          checked: new Date().toISOString(),
        }),
      };
    }

    // Create email content
    let emailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4C6B57; border-bottom: 2px solid #4C6B57; padding-bottom: 10px;">
              Lotus Direct Care - Compliance Alert
            </h2>
            <p>This is an automated notification regarding documents that require attention.</p>
    `;

    // Add expired documents section
    if (expiredDocuments.length > 0) {
      emailHtml += `
        <div style="background-color: #fee; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0;">
          <h3 style="color: #dc3545; margin-top: 0;">⚠️ Expired Documents (${expiredDocuments.length})</h3>
          <ul style="margin: 10px 0;">
      `;
      
      expiredDocuments.forEach(doc => {
        emailHtml += `
          <li style="margin: 5px 0;">
            <strong>${doc.name}</strong> (${doc.category})
            <br>Expired: ${doc.expirationDate} (${doc.daysOverdue} days overdue)
          </li>
        `;
      });
      
      emailHtml += '</ul></div>';
    }

    // Add expiring documents section
    if (expiringDocuments.length > 0) {
      emailHtml += `
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">📅 Expiring Soon (${expiringDocuments.length})</h3>
          <ul style="margin: 10px 0;">
      `;
      
      expiringDocuments.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
      
      expiringDocuments.forEach(doc => {
        emailHtml += `
          <li style="margin: 5px 0;">
            <strong>${doc.name}</strong> (${doc.category})
            <br>Expires: ${doc.expirationDate} (${doc.daysUntilExpiry} days remaining)
          </li>
        `;
      });
      
      emailHtml += '</ul></div>';
    }

    emailHtml += `
            <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
              <p style="margin: 5px 0;"><strong>Action Required:</strong></p>
              <ol style="margin: 10px 0;">
                <li>Review the compliance dashboard for full details</li>
                <li>Contact relevant parties to renew expiring documents</li>
                <li>Update the compliance spreadsheet once renewals are complete</li>
              </ol>
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #666;">
              This is an automated message from the Lotus Direct Care Compliance System.
              <br>Generated on: ${new Date().toLocaleString()}
            </p>
          </div>
        </body>
      </html>
    `;

    // Create plain text version
    let emailText = 'Lotus Direct Care - Compliance Alert\n\n';
    
    if (expiredDocuments.length > 0) {
      emailText += `EXPIRED DOCUMENTS (${expiredDocuments.length}):\n`;
      expiredDocuments.forEach(doc => {
        emailText += `- ${doc.name} (${doc.category}) - Expired ${doc.expirationDate}\n`;
      });
      emailText += '\n';
    }
    
    if (expiringDocuments.length > 0) {
      emailText += `EXPIRING SOON (${expiringDocuments.length}):\n`;
      expiringDocuments.forEach(doc => {
        emailText += `- ${doc.name} (${doc.category}) - Expires ${doc.expirationDate}\n`;
      });
    }

    // Create email message
    const subject = `Compliance Alert: ${expiredDocuments.length} Expired, ${expiringDocuments.length} Expiring Soon`;
    
    const message = [
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `To: ${recipientEmail}`,
      `Subject: ${subject}`,
      '',
      emailHtml,
    ].join('\n');

    // Encode the message
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Note: Sending email via Gmail API requires additional setup
    // For now, we'll return the email content that can be sent via other means
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        summary: {
          expired: expiredDocuments.length,
          expiring: expiringDocuments.length,
          recipient: recipientEmail,
          subject: subject,
        },
        // In production, you would send the email here
        // For now, return the content for manual sending
        emailContent: {
          html: emailHtml,
          text: emailText,
          subject: subject,
        },
        documents: {
          expired: expiredDocuments,
          expiring: expiringDocuments,
        },
        generated: new Date().toISOString(),
      }),
    };

  } catch (error) {
    console.error('Error generating expiry notifications:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate notifications',
        message: error.message 
      }),
    };
  }
};