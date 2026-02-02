/**
 * Black and White Accounting - Triage System Backend
 * Google Apps Script Backend
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Spreadsheet
 * 2. Open Google Apps Script (Extensions > Apps Script)
 * 3. Paste this code into the script editor
 * 4. Create the following sheets in your spreadsheet:
 *    - "TriageEntries" (for triage data)
 *    - "TeamMembers" (for employee data)
 * 5. Deploy as a web app with:
 *    - Execute as: Me
 *    - Who has access: Anyone (or specific users)
 * 6. Copy the web app URL and update the API_URL in the HTML file
 */

// Configuration - Update this with your Spreadsheet ID
const SPREADSHEET_ID = '1zvC5jCw3I0Ee_VEghnGem01uXJdMFCi_xLkKM3E9MAk';

// Sheet names
const SHEET_TRIAGE = 'TriageEntries';
const SHEET_TEAM = 'TeamMembers';
const SHEET_ARCHIVE = 'TriageArchive';
const SHEET_CATEGORIES = 'Categories';

/**
 * Handle OPTIONS request for CORS preflight
 */
function doOptions() {
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Entry point for GET (JSONP) requests
 */
function doGet(e) {
  return handleRequest(e);
}

/**
 * Entry point for POST requests (optional fallback)
 */
function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  let callback = null;
  try {
    const params = e.parameter || {};
    const action = params.action;
    callback = params.callback;
    let data = {};

    if (params.data) {
      try {
        data = JSON.parse(params.data);
      } catch (parseError) {
        data = params;
      }
    } else if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseError) {
        data = params;
      }
    }

    if (!action) {
      return createJsonOutput(createResponse(false, 'No action specified'), callback);
    }

    let response;
    try {
      switch (action) {
        case 'createTriage':
          response = createTriage(data);
          break;
        case 'updateTriage':
          response = updateTriage(data);
          break;
        case 'deleteTriage':
          response = deleteTriage(data);
          break;
        case 'archiveTriage':
          response = archiveTriage(data);
          break;
        case 'getTriageEntries':
          response = getTriageEntries();
          break;
        case 'getArchivedTriage':
          response = getArchivedTriageEntries();
          break;
        case 'getTeamMembers':
          response = getTeamMembers();
          break;
        case 'addTeamMember':
          response = addTeamMember(data);
          break;
        case 'getCategories':
          response = getCategories();
          break;
        case 'addCategory':
          response = addCategory(data);
          break;
        case 'test':
          response = createResponse(true, 'API is working! Server time: ' + new Date().toISOString());
          break;
        default:
          response = createResponse(false, 'Unknown action: ' + action);
          break;
      }
    } catch (actionError) {
      // Log error for debugging
      Logger.log('Error executing action ' + action + ': ' + actionError.toString());
      Logger.log('Stack: ' + actionError.stack);
      response = createResponse(false, 'Error executing ' + action + ': ' + actionError.toString());
    }

    return createJsonOutput(response, callback);
  } catch (error) {
    // Log error for debugging
    Logger.log('Error in handleRequest: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    return createJsonOutput(createResponse(false, 'Server error: ' + error.toString()), callback);
  }
}

/**
 * Initialize spreadsheet and sheets
 */
function getSpreadsheet() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    if (!ss) {
      throw new Error('Spreadsheet not found. Check SPREADSHEET_ID: ' + SPREADSHEET_ID);
    }
  
  const triageHeaders = [
    'ID', 'Client Name', 'Business Name', 'Client Phone', 'Client Email', 'Description',
    'Importance', 'Assigned To', 'Status', 'Deadline', 'Notes',
    'Created By', 'Created By Email', 'Created At', 'Updated At', 'Category',
    'Confirmation 1', 'Confirmation 2', 'Confirmation 3'
  ];

  // Create TriageEntries sheet if it doesn't exist
  let triageSheet = ss.getSheetByName(SHEET_TRIAGE);
  if (!triageSheet) {
    triageSheet = ss.insertSheet(SHEET_TRIAGE);
  }

  if (triageSheet.getMaxColumns() < triageHeaders.length) {
    triageSheet.insertColumnsAfter(triageSheet.getMaxColumns(), triageHeaders.length - triageSheet.getMaxColumns());
  }

  const currentTriageHeaders = triageSheet.getRange(1, 1, 1, triageSheet.getLastColumn()).getValues()[0];
  if (currentTriageHeaders.indexOf('Business Name') === -1) {
    triageSheet.insertColumnAfter(2);
  }

  // Migration: If Category column exists in wrong position (column 7), move it to the end
  const categoryIndex = currentTriageHeaders.indexOf('Category');
  if (categoryIndex !== -1 && categoryIndex !== 15) {
    // Category exists but in wrong position - need to migrate data
    const lastRow = triageSheet.getLastRow();
    if (lastRow > 1) {
      // Get all data rows
      const dataRange = triageSheet.getRange(2, 1, lastRow - 1, triageSheet.getLastColumn());
      const allData = dataRange.getValues();
      
      // Delete the Category column from its current position
      triageSheet.deleteColumn(categoryIndex + 1);
      
      // Re-read headers after deletion
      const newHeaders = triageSheet.getRange(1, 1, 1, triageSheet.getLastColumn()).getValues()[0];
      
      // If Category column doesn't exist at the end, add it
      if (newHeaders.indexOf('Category') === -1) {
        triageSheet.insertColumnAfter(triageSheet.getLastColumn());
      }
      
      // Update headers
      triageSheet.getRange(1, 1, 1, triageHeaders.length).setValues([triageHeaders]);
      
      // Restore data with correct column alignment
      // Re-read all data to get correct column count
      const currentLastCol = triageSheet.getLastColumn();
      if (currentLastCol >= triageHeaders.length) {
        // Clear old data
        if (lastRow > 1) {
          triageSheet.getRange(2, 1, lastRow - 1, currentLastCol).clearContent();
        }
        
        // Write data back with correct alignment
        // Map old columns to new columns
        for (let i = 0; i < allData.length; i++) {
          const row = allData[i];
          const newRow = [
            row[0],  // ID
            row[1],  // Client Name
            row[2],  // Business Name
            row[3],  // Client Phone
            row[4],  // Client Email
            row[5],  // Description
            row[6] || row[7] || '',  // Importance (was 6, might be 7 if Category was inserted)
            row[7] || row[8] || '',  // Assigned To
            row[8] || row[9] || '',  // Status
            row[9] || row[10] || '', // Deadline
            row[10] || row[11] || '', // Notes
            row[11] || row[12] || '', // Created By
            row[12] || row[13] || '', // Created By Email
            row[13] || row[14] || '', // Created At
            row[14] || row[15] || '', // Updated At
            row[categoryIndex] || ''  // Category (from old position)
          ];
          triageSheet.getRange(i + 2, 1, 1, newRow.length).setValues([newRow]);
        }
      }
    } else {
      // No data rows, just fix headers
      triageSheet.deleteColumn(categoryIndex + 1);
      triageSheet.insertColumnAfter(triageSheet.getLastColumn());
    }
  }

  triageSheet.getRange(1, 1, 1, triageHeaders.length).setValues([triageHeaders]);
  triageSheet.getRange(1, 1, 1, triageHeaders.length).setFontWeight('bold');
  triageSheet.setFrozenRows(1);
  
  // Set phone number column (column 4) to text format to preserve leading zeros
  const phoneColumn = 4; // Client Phone is the 4th column (0-indexed would be 3, but Sheets uses 1-indexed)
  triageSheet.getRange(2, phoneColumn, triageSheet.getMaxRows() - 1, 1).setNumberFormat('@');
  
  // Create TeamMembers sheet if it doesn't exist
  let teamSheet = ss.getSheetByName(SHEET_TEAM);
  if (!teamSheet) {
    teamSheet = ss.insertSheet(SHEET_TEAM);
    const headers = ['Name', 'Email', 'Added At'];
    teamSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    teamSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    teamSheet.setFrozenRows(1);
  }

  // Create archive sheet if missing
  let archiveSheet = ss.getSheetByName(SHEET_ARCHIVE);
  if (!archiveSheet) {
    archiveSheet = ss.insertSheet(SHEET_ARCHIVE);
  }

  const archiveHeaders = [
    'ID', 'Client Name', 'Business Name', 'Client Phone', 'Client Email', 'Description',
    'Importance', 'Assigned To', 'Status', 'Deadline', 'Notes',
    'Created By', 'Created By Email', 'Created At', 'Updated At', 'Category', 'Archived At',
    'Confirmation 1', 'Confirmation 2', 'Confirmation 3'
  ];

  if (archiveSheet.getMaxColumns() < archiveHeaders.length) {
    archiveSheet.insertColumnsAfter(archiveSheet.getMaxColumns(), archiveHeaders.length - archiveSheet.getMaxColumns());
  }

  const currentArchiveHeaders = archiveSheet.getRange(1, 1, 1, archiveSheet.getLastColumn()).getValues()[0];
  if (currentArchiveHeaders.indexOf('Business Name') === -1) {
    archiveSheet.insertColumnAfter(2);
  }

  // Migration: If Category column exists in wrong position, move it to the end (before Archived At)
  const archiveCategoryIndex = currentArchiveHeaders.indexOf('Category');
  if (archiveCategoryIndex !== -1 && archiveCategoryIndex !== 15) {
    // Category exists but in wrong position - need to migrate data
    const lastRow = archiveSheet.getLastRow();
    if (lastRow > 1) {
      // Get all data rows
      const dataRange = archiveSheet.getRange(2, 1, lastRow - 1, archiveSheet.getLastColumn());
      const allData = dataRange.getValues();
      
      // Delete the Category column from its current position
      archiveSheet.deleteColumn(archiveCategoryIndex + 1);
      
      // Re-read headers after deletion
      const newHeaders = archiveSheet.getRange(1, 1, 1, archiveSheet.getLastColumn()).getValues()[0];
      
      // If Category column doesn't exist at position 15 (before Archived At), add it
      if (newHeaders.indexOf('Category') === -1) {
        // Insert before Archived At (which should be at the end)
        const archivedAtIndex = newHeaders.indexOf('Archived At');
        if (archivedAtIndex !== -1) {
          archiveSheet.insertColumnBefore(archivedAtIndex + 1);
        } else {
          archiveSheet.insertColumnAfter(archiveSheet.getLastColumn());
        }
      }
      
      // Update headers
      archiveSheet.getRange(1, 1, 1, archiveHeaders.length).setValues([archiveHeaders]);
      
      // Restore data with correct column alignment
      const currentLastCol = archiveSheet.getLastColumn();
      if (currentLastCol >= archiveHeaders.length) {
        // Clear old data
        if (lastRow > 1) {
          archiveSheet.getRange(2, 1, lastRow - 1, currentLastCol).clearContent();
        }
        
        // Write data back with correct alignment
        for (let i = 0; i < allData.length; i++) {
          const row = allData[i];
          const newRow = [
            row[0],  // ID
            row[1],  // Client Name
            row[2],  // Business Name
            row[3],  // Client Phone
            row[4],  // Client Email
            row[5],  // Description
            row[6] || row[7] || '',  // Importance
            row[7] || row[8] || '',  // Assigned To
            row[8] || row[9] || '',  // Status
            row[9] || row[10] || '', // Deadline
            row[10] || row[11] || '', // Notes
            row[11] || row[12] || '', // Created By
            row[12] || row[13] || '', // Created By Email
            row[13] || row[14] || '', // Created At
            row[14] || row[15] || '', // Updated At
            row[archiveCategoryIndex] || '', // Category (from old position)
            row[16] || row[17] || ''  // Archived At
          ];
          archiveSheet.getRange(i + 2, 1, 1, newRow.length).setValues([newRow]);
        }
      }
    } else {
      // No data rows, just fix headers
      archiveSheet.deleteColumn(archiveCategoryIndex + 1);
      const archivedAtIndex = archiveSheet.getRange(1, 1, 1, archiveSheet.getLastColumn()).getValues()[0].indexOf('Archived At');
      if (archivedAtIndex !== -1) {
        archiveSheet.insertColumnBefore(archivedAtIndex + 1);
      } else {
        archiveSheet.insertColumnAfter(archiveSheet.getLastColumn());
      }
    }
  }

        archiveSheet.getRange(1, 1, 1, archiveHeaders.length).setValues([archiveHeaders]);
        archiveSheet.getRange(1, 1, 1, archiveHeaders.length).setFontWeight('bold');
        archiveSheet.setFrozenRows(1);
        
        // Set phone number column (column 4) to text format to preserve leading zeros
        const archivePhoneColumn = 4;
        archiveSheet.getRange(2, archivePhoneColumn, archiveSheet.getMaxRows() - 1, 1).setNumberFormat('@');
  
  // Create Categories sheet if it doesn't exist
  let categoriesSheet = ss.getSheetByName(SHEET_CATEGORIES);
  if (!categoriesSheet) {
    categoriesSheet = ss.insertSheet(SHEET_CATEGORIES);
    const headers = ['Category'];
    categoriesSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    categoriesSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    categoriesSheet.setFrozenRows(1);
  }
  
  return ss;
  } catch (error) {
    Logger.log('Error in getSpreadsheet: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    throw new Error('Cannot access spreadsheet: ' + error.toString() + '. Check SPREADSHEET_ID and permissions.');
  }
}

/**
 * Create a new triage entry
 */
function createTriage(data) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_TRIAGE);
    
    const row = [
      data.id,
      data.clientName,
      data.businessName || '',
      data.clientPhone || '',
      data.clientEmail || '',
      data.description,
      data.importance,
      data.assignedTo || '',
      data.status,
      data.deadline || '',
      data.notes || '',
      data.createdBy,
      data.createdByEmail,
      data.createdAt,
      data.updatedAt,
      data.category || '',
      data.confirmation1 ? 'Yes' : 'No',
      data.confirmation2 ? 'Yes' : 'No',
      data.confirmation3 ? 'Yes' : 'No'
    ];
    
    const lastRow = sheet.getLastRow() + 1;
    sheet.appendRow(row);
    
    // Set phone number column (column 4) to text format to preserve leading zeros
    if (data.clientPhone) {
      sheet.getRange(lastRow, 4).setNumberFormat('@');
      // Force it as text by setting the value again with text format
      sheet.getRange(lastRow, 4).setValue(data.clientPhone);
    }
    
    // Auto-add team member if they don't exist
    addTeamMemberIfNotExists(data.createdBy, data.createdByEmail);
    
    return createResponse(true, 'Triage entry created successfully', { id: data.id });
  } catch (error) {
    return createResponse(false, 'Error creating triage: ' + error.toString());
  }
}

/**
 * Update an existing triage entry
 */
function updateTriage(data) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_TRIAGE);
    
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Find the row with matching ID (skip header row)
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === data.id) {
        const row = i + 1; // Sheets are 1-indexed
        
        sheet.getRange(row, 1, 1, 19).setValues([[
          data.id,
          data.clientName,
          data.businessName || '',
          data.clientPhone || '',
          data.clientEmail || '',
          data.description,
          data.importance,
          data.assignedTo || '',
          data.status,
          data.deadline || '',
          data.notes || '',
          values[i][11] || data.createdBy,
          values[i][12] || data.createdByEmail,
          values[i][13] || data.createdAt,
          data.updatedAt,
          data.category || '',
          data.confirmation1 ? 'Yes' : 'No',
          data.confirmation2 ? 'Yes' : 'No',
          data.confirmation3 ? 'Yes' : 'No'
        ]]);
        
        // Set phone number column (column 4) to text format to preserve leading zeros
        if (data.clientPhone) {
          sheet.getRange(row, 4).setNumberFormat('@');
          // Force it as text by setting the value again with text format
          sheet.getRange(row, 4).setValue(data.clientPhone);
        }
        
        return createResponse(true, 'Triage entry updated successfully');
      }
    }
    
    return createResponse(false, 'Triage entry not found');
  } catch (error) {
    return createResponse(false, 'Error updating triage: ' + error.toString());
  }
}

/**
 * Delete a triage entry
 */
function deleteTriage(data) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_TRIAGE);
    
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Find the row with matching ID (skip header row)
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === data.id) {
        const row = i + 1; // Sheets are 1-indexed
        sheet.deleteRow(row);
        return createResponse(true, 'Triage entry deleted successfully');
      }
    }
    
    return createResponse(false, 'Triage entry not found');
  } catch (error) {
    return createResponse(false, 'Error deleting triage: ' + error.toString());
  }
}

/**
 * Archive a triage entry
 */
function archiveTriage(data) {
  try {
    const ss = getSpreadsheet();
    const triageSheet = ss.getSheetByName(SHEET_TRIAGE);
    const archiveSheet = ss.getSheetByName(SHEET_ARCHIVE);

    const dataRange = triageSheet.getDataRange();
    const values = dataRange.getValues();
    const nowIso = new Date().toISOString();

    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === data.id) {
        const rowIndex = i + 1;
        const row = values[i];

        const importance = row[6];
        const assignedTo = row[7];
        const status = row[8];
        const deadline = row[9];
        const notes = row[10];
        const createdBy = row[11];
        const createdByEmail = row[12];
        const createdAt = row[13];
        const updatedAt = row[14] || nowIso;
        const category = row[15] || '';
        const confirmation1 = row[16] || 'No';
        const confirmation2 = row[17] || 'No';
        const confirmation3 = row[18] || 'No';

        const archiveRow = [
          row[0],
          row[1],
          row[2],
          row[3],
          row[4],
          row[5],
          importance,
          assignedTo,
          'archived',
          deadline,
          notes,
          createdBy,
          createdByEmail,
          createdAt,
          updatedAt,
          category,
          nowIso,
          confirmation1,
          confirmation2,
          confirmation3
        ];

        const archiveLastRow = archiveSheet.getLastRow() + 1;
        archiveSheet.appendRow(archiveRow);
        
        // Set phone number column (column 4) to text format to preserve leading zeros
        if (row[3]) {
          archiveSheet.getRange(archiveLastRow, 4).setNumberFormat('@');
          // Force it as text by setting the value again with text format
          archiveSheet.getRange(archiveLastRow, 4).setValue(row[3]);
        }
        
        triageSheet.deleteRow(rowIndex);

        return createResponse(true, 'Triage entry archived successfully', { id: data.id });
      }
    }

    return createResponse(false, 'Triage entry not found');
  } catch (error) {
    return createResponse(false, 'Error archiving triage: ' + error.toString());
  }
}

/**
 * Get all triage entries
 */
function getTriageEntries() {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_TRIAGE);
    
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    if (values.length <= 1) {
      return createResponse(true, 'No entries found', { entries: [] });
    }
    
    // Convert rows to objects (skip header row)
    const entries = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      entries.push({
        id: row[0],
        clientName: row[1],
        businessName: row[2] || '',
        clientPhone: String(row[3] || ''), // Ensure phone is always a string
        clientEmail: row[4] || '',
        description: row[5],
        importance: row[6],
        assignedTo: row[7] || '',
        status: row[8],
        deadline: row[9] || '',
        notes: row[10] || '',
        createdBy: row[11],
        createdByEmail: row[12],
        createdAt: row[13],
        updatedAt: row[14],
        category: row[15] || '',
        confirmation1: row[16] === 'Yes',
        confirmation2: row[17] === 'Yes',
        confirmation3: row[18] === 'Yes'
      });
    }
    
    return createResponse(true, 'Entries retrieved successfully', { entries });
  } catch (error) {
    return createResponse(false, 'Error retrieving entries: ' + error.toString());
  }
}

/**
 * Get all team members
 */
function getTeamMembers() {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_TEAM);
    
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    if (values.length <= 1) {
      return createResponse(true, 'No team members found', { teamMembers: [] });
    }
    
    // Convert rows to objects (skip header row)
    const teamMembers = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      teamMembers.push({
        name: row[0],
        email: row[1] || '',
        addedAt: row[2] || ''
      });
    }
    
    return createResponse(true, 'Team members retrieved successfully', { teamMembers });
  } catch (error) {
    return createResponse(false, 'Error retrieving team members: ' + error.toString());
  }
}

/**
 * Get archived triage entries
 */
function getArchivedTriageEntries() {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_ARCHIVE);

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    if (values.length <= 1) {
      return createResponse(true, 'No archived entries found', { entries: [] });
    }

    const entries = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      entries.push({
        id: row[0],
        clientName: row[1],
        businessName: row[2] || '',
        clientPhone: String(row[3] || ''), // Ensure phone is always a string
        clientEmail: row[4] || '',
        description: row[5],
        importance: row[6],
        assignedTo: row[7] || '',
        status: row[8],
        deadline: row[9] || '',
        notes: row[10] || '',
        createdBy: row[11],
        createdByEmail: row[12],
        createdAt: row[13],
        updatedAt: row[14],
        category: row[15] || '',
        archivedAt: row[16],
        confirmation1: row[17] === 'Yes',
        confirmation2: row[18] === 'Yes',
        confirmation3: row[19] === 'Yes'
      });
    }

    return createResponse(true, 'Archived entries retrieved successfully', { entries });
  } catch (error) {
    return createResponse(false, 'Error retrieving archived entries: ' + error.toString());
  }
}

/**
 * Get all categories
 */
function getCategories() {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_CATEGORIES);
    
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    if (values.length <= 1) {
      return createResponse(true, 'No categories found', { categories: [] });
    }
    
    // Convert rows to array of category names (skip header row)
    const categories = [];
    const seen = new Set();
    for (let i = 1; i < values.length; i++) {
      const category = (values[i][0] || '').trim();
      if (category && !seen.has(category.toLowerCase())) {
        seen.add(category.toLowerCase());
        categories.push(category);
      }
    }
    
    // Sort alphabetically
    categories.sort();
    
    return createResponse(true, 'Categories retrieved successfully', { categories });
  } catch (error) {
    return createResponse(false, 'Error retrieving categories: ' + error.toString());
  }
}

/**
 * Add a new category
 */
function addCategory(data) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_CATEGORIES);
    
    const categoryName = (data.category || '').trim();
    if (!categoryName) {
      return createResponse(false, 'Category name is required');
    }
    
    // Check if category already exists
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    for (let i = 1; i < values.length; i++) {
      if ((values[i][0] || '').trim().toLowerCase() === categoryName.toLowerCase()) {
        return createResponse(false, 'Category already exists');
      }
    }
    
    // Add new category
    sheet.appendRow([categoryName]);
    
    return createResponse(true, 'Category added successfully');
  } catch (error) {
    return createResponse(false, 'Error adding category: ' + error.toString());
  }
}

/**
 * Add a team member
 */
function addTeamMember(data) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_TEAM);
    
    // Check if member already exists
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === data.name || values[i][1] === data.email) {
        return createResponse(false, 'Team member already exists');
      }
    }
    
    // Add new team member
    const row = [
      data.name,
      data.email || '',
      new Date().toISOString()
    ];
    
    sheet.appendRow(row);
    
    return createResponse(true, 'Team member added successfully');
  } catch (error) {
    return createResponse(false, 'Error adding team member: ' + error.toString());
  }
}

/**
 * Helper function to add team member if they don't exist
 */
function addTeamMemberIfNotExists(name, email) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_TEAM);
    
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Check if member already exists
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === name || (email && values[i][1] === email)) {
        return; // Already exists
      }
    }
    
    // Add new team member
    const row = [
      name,
      email || '',
      new Date().toISOString()
    ];
    
    sheet.appendRow(row);
  } catch (error) {
    // Silently fail - don't break triage creation if team member addition fails
    console.error('Error auto-adding team member:', error);
  }
}

/**
 * Create a standardized JSON response with CORS headers
 */
function createResponse(success, message, data = {}) {
  const response = {
    success: success,
    message: message,
    ...data
  };
  return response;
}

function createJsonOutput(response, callback) {
  let text;
  if (callback) {
    // Ensure callback name is safe (alphanumeric and underscores only)
    const safeCallback = callback.replace(/[^a-zA-Z0-9_$]/g, '');
    text = `${safeCallback}(${JSON.stringify(response)});`;
    const output = ContentService.createTextOutput(text);
    output.setMimeType(ContentService.MimeType.JAVASCRIPT);
    // Add CORS headers for script tag access
    return output;
  } else {
    text = JSON.stringify(response);
    const output = ContentService.createTextOutput(text);
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}

/**
 * Test function - Run this to set up the sheets initially
 */
function setupSheets() {
  try {
    const ss = getSpreadsheet();
    
    // This will create the sheets if they don't exist
    const triageSheet = ss.getSheetByName(SHEET_TRIAGE);
    const teamSheet = ss.getSheetByName(SHEET_TEAM);
    
    Logger.log('Setup complete!');
    Logger.log('TriageEntries sheet: ' + (triageSheet ? 'Created' : 'Failed'));
    Logger.log('TeamMembers sheet: ' + (teamSheet ? 'Created' : 'Failed'));
    
    return 'Setup complete! Check the logs for details.';
  } catch (error) {
    Logger.log('Setup error: ' + error.toString());
    return 'Setup failed: ' + error.toString();
  }
}