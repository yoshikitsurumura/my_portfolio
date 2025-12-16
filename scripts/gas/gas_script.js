function doGet(e) {
  const sheetName = e.parameter.sheet || 'Sheet1';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify({error: "Sheet not found"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const range = sheet.getDataRange();
  const values = range.getValues();
  const headers = values.shift();
  
  const data = values.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      if (row[index] instanceof Date) {
        obj[header] = row[index].toISOString();
      } else {
        obj[header] = row[index];
      }
    });
    return obj;
  });
  
  const publicData = data.filter(item => item.status === 'public');

  if (e.parameter.id) {
    const articleId = e.parameter.id;
    const article = publicData.find(item => String(item.id) === articleId);
    if (article) {
      return ContentService
        .createTextOutput(JSON.stringify(article))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService
        .createTextOutput(JSON.stringify({error: "Article not found"}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(publicData))
    .setMimeType(ContentService.MimeType.JSON);
}