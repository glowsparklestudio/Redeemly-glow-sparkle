// SETUP INSTRUCTIONS
// 1. Go to Google Sheets, create a new spreadsheet.
// 2. Click Extensions > Apps Script.
// 3. Paste this code, replacing everything.
// 4. Click Deploy > New Deployment.
// 5. Select type "Web app".
// 6. Set "Execute as" to "Me", and "Who has access" to "Anyone".
// 7. Click Deploy, authorize the app, and copy the Web App URL.
// 8. Add VITE_GOOGLE_SHEETS_URL="YOUR_WEB_APP_URL" to your AI Studio Secrets or .env file.

const SHEET_NAME = 'Sheet1';

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const data = JSON.parse(e.postData.contents);
    
    // Create headers if empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Name',
        'Phone',
        'Gender',
        'Category',
        'Service',
        'Visit ID',
        'PIN',
        'Device ID',
        'Status'
      ]);
      sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
    }
    
    // Append the row
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || '',
      data.phone || '',
      data.gender || '',
      data.category || '',
      data.service || '',
      data.visit_id || '',
      data.pin || '',
      data.device_id || '',
      data.status || 'CLAIMED'
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle preflight OPTIONS requests for CORS if needed, though we use no-cors from frontend.
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
