// ✅ All imports at the very top
import JSZip from 'jszip';
import React, { useState, useCallback, useEffect, useMemo } from 'react';

import {
  FileText, LayoutDashboard, BrainCircuit, Search, AlertCircle, X,
  ChevronDown, ChevronUp, Database, FileDown, TestTubeDiagonal, KeyRound,
  Zap, Menu
} from 'lucide-react';

import {
  ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Scatter, Legend
} from 'recharts';

// ✅ Executable code AFTER imports
window.JSZip = JSZip; // Expose to global scope for utils


// --- Helper & Parsing Functions ---

const parseTimestamp = (line) => {
  const timestampRegex = /(\d{4}[-/]\d{2}[-/]\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?(?:\.\d{1,3})?Z?)?)/;
  const match = line.match(timestampRegex);
  if (match) {
    const date = new Date(match[1]);
    if (!isNaN(date.getTime())) return date;
  }
  return null;
};

// Supported input formats with their corresponding parsers
const inputFormats = [
  { name: 'AUTO', parser: autoDetectParser },
  { name: 'TEXTLINE', parser: parseTextLine },
  { name: 'TEXTWORD', parser: parseTextWord },
  { name: 'CSV', parser: parseCsv },
  { name: 'TSV', parser: parseTsv },
  { name: 'XML', parser: parseXml },
  { name: 'W3C', parser: parseW3c },
  { name: 'IIS', parser: parseIis },
  { name: 'NCSA', parser: parseNcsa },
  { name: 'IISW3C', parser: parseIisW3c },
  { name: 'IISODBC', parser: parseIisOdbc },
  { name: 'IISMSID', parser: parseIisMsid },
  { name: 'HTTPERR', parser: parseHttpErr },
  { name: 'URLSCAN', parser: parseUrlScan },
  { name: 'BIN', parser: parseBin },
  { name: 'EVT', parser: parseEvt },
  { name: 'ETW', parser: parseEtw },
  { name: 'NETMON', parser: parseNetmon },
  { name: 'REG', parser: parseReg },
  { name: 'ADS', parser: parseAds },
  { name: 'FS', parser: parseFs },
  { name: 'COM', parser: parseCom },
];

// Parsing functions for input formats
function parseTextLine(content, fileName) {
  const lines = content.split('\n');
  return lines.map((line, index) => ({
    timestamp: parseTimestamp(line) || new Date(),
    message: line.trim(),
    lineNumber: index + 1,
    sourceFile: fileName
  }));
}

function parseTextWord(content, fileName) {
  // Parse by words instead of lines (simplified for demo)
  const words = content.split(/\s+/);
  return words.map((word, index) => ({
    timestamp: new Date(), // No timestamp assumed
    message: word,
    lineNumber: index + 1,
    sourceFile: fileName
  })).filter(entry => entry.message);
}

function parseCsv(content, fileName) {
  const lines = content.split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const timestampIndex = headers.indexOf('timestamp') !== -1 ? headers.indexOf('timestamp') : headers.indexOf('date');
  const messageIndex = headers.indexOf('message') !== -1 ? headers.indexOf('message') : headers.indexOf('log');
  if (timestampIndex === -1 || messageIndex === -1) {
    console.warn(`CSV file ${fileName} lacks required columns (timestamp/date, message/log).`);
    return [];
  }
  return lines.slice(1).filter(line => line.trim()).map((line, index) => {
    const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Handle commas within quotes
    const timestamp = parseTimestamp(columns[timestampIndex]) || new Date();
    const message = columns[messageIndex]?.replace(/^"|"$/g, '') || '';
    return { timestamp, message, lineNumber: index + 1, sourceFile: fileName };
  });
}

function parseTsv(content, fileName) {
  const lines = content.split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split('\t').map(h => h.trim().toLowerCase());
  const timestampIndex = headers.indexOf('timestamp') !== -1 ? headers.indexOf('timestamp') : headers.indexOf('date');
  const messageIndex = headers.indexOf('message') !== -1 ? headers.indexOf('message') : headers.indexOf('log');
  if (timestampIndex === -1 || messageIndex === -1) {
    console.warn(`TSV file ${fileName} lacks required columns (timestamp/date, message/log).`);
    return [];
  }
  return lines.slice(1).filter(line => line.trim()).map((line, index) => {
    const columns = line.split('\t');
    const timestamp = parseTimestamp(columns[timestampIndex]) || new Date();
    const message = columns[messageIndex] || '';
    return { timestamp, message, lineNumber: index + 1, sourceFile: fileName };
  });
}

function parseXml(content, fileName) {
  // Simple XML parsing; use a library like xml2js for production
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(content, 'application/xml');
  const entries = xmlDoc.getElementsByTagName('entry') || xmlDoc.getElementsByTagName('log');
  return Array.from(entries).map((entry, index) => {
    const timestampNode = entry.getElementsByTagName('timestamp')[0] || entry.getElementsByTagName('date')[0];
    const messageNode = entry.getElementsByTagName('message')[0] || entry.getElementsByTagName('description')[0];
    const timestamp = parseTimestamp(timestampNode?.textContent || '') || new Date();
    const message = messageNode?.textContent || 'No message';
    return { timestamp, message, lineNumber: index + 1, sourceFile: fileName };
  });
}

function parseW3c(content, fileName) {
  const lines = content.split('\n');
  const fieldsLine = lines.find(line => line.startsWith('#Fields:'));
  if (!fieldsLine) return [];
  const fields = fieldsLine.substring(9).split(' ').map(f => f.trim().toLowerCase());
  const timestampIndex = fields.indexOf('date') !== -1 ? fields.indexOf('date') : fields.indexOf('time');
  const messageIndex = fields.indexOf('cs-uri-stem') !== -1 ? fields.indexOf('cs-uri-stem') : fields.indexOf('sc-status');
  if (timestampIndex === -1 || messageIndex === -1) return [];
  return lines.filter(line => !line.startsWith('#')).map((line, index) => {
    const columns = line.split(' ');
    const timestamp = parseTimestamp(columns[timestampIndex]) || new Date();
    const message = columns[messageIndex] || '';
    return { timestamp, message, lineNumber: index + 1, sourceFile: fileName };
  });
}

function parseIis(content, fileName) {
  const lines = content.split('\n').filter(line => !line.startsWith('#') && line.trim());
  return lines.map((line, index) => {
    const parts = line.split(' ');
    const timestamp = parseTimestamp(`${parts[0]} ${parts[1]}`) || new Date();
    const message = parts.slice(2).join(' ') || 'No message';
    return { timestamp, message, lineNumber: index + 1, sourceFile: fileName };
  });
}

function parseNcsa(content, fileName) {
  const lines = content.split('\n');
  return lines.map((line, index) => {
    const match = line.match(/^(\S+).*?\[([^\]]+)\].*?"([^"]+)"/);
    if (!match) return null;
    const timestamp = parseTimestamp(match[2]) || new Date();
    const message = match[3] || 'No message';
    return { timestamp, message, lineNumber: index + 1, sourceFile: fileName };
  }).filter(entry => entry);
}

function parseIisW3c(content, fileName) {
  return parseW3c(content, fileName);
}

// Newly implemented parsers
function parseHttpErr(content, fileName) {
  const lines = content.split('\n');
  const fieldsLine = lines.find(line => line.startsWith('#Fields:'));
  if (!fieldsLine) {
    // Fallback for files without a #Fields header, treat as plain text
    return lines.filter(line => !line.startsWith('#') && line.trim()).map((line, index) => ({
        timestamp: parseTimestamp(line) || new Date(),
        message: line.trim(),
        lineNumber: index + 1,
        sourceFile: fileName,
    }));
  }

  const fields = fieldsLine.substring(9).trim().split(' ');
  const dateIndex = fields.indexOf('date');
  const timeIndex = fields.indexOf('time');
  const reasonIndex = fields.indexOf('s-reason');

  return lines.filter(line => !line.startsWith('#') && line.trim()).map((line, index) => {
    const columns = line.split(' ');
    const timestamp = (dateIndex !== -1 && timeIndex !== -1) ? parseTimestamp(`${columns[dateIndex]} ${columns[timeIndex]}`) : new Date();
    const message = reasonIndex !== -1 ? `Reason: ${columns[reasonIndex]}`.replace(/_/g, ' ') : line.trim();
    
    return {
      timestamp: timestamp || new Date(),
      message: message,
      lineNumber: index + 1,
      sourceFile: fileName,
    };
  });
}

function parseReg(content, fileName) {
  const lines = content.split('\n');
  let currentKey = "Default";
  const entries = [];

  const keyRegex = /\[(.*)\]/;
  const valueRegex = /"(.*)"="(.*)"/;
  const dwordRegex = /"(.*)"=dword:(.*)/;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    const keyMatch = trimmedLine.match(keyRegex);
    if (keyMatch) {
      currentKey = keyMatch[1];
      return; 
    }
    
    let message = '';
    const valueMatch = trimmedLine.match(valueRegex);
    if (valueMatch) {
      message = `Key: ${currentKey}, Value: "${valueMatch[1]}" = "${valueMatch[2]}"`;
    }

    const dwordMatch = trimmedLine.match(dwordRegex);
    if (dwordMatch) {
      message = `Key: ${currentKey}, DWORD: "${dwordMatch[1]}" = ${dwordMatch[2]}`;
    }

    if (message) {
      entries.push({
        timestamp: new Date(), // REG files don't have timestamps
        message: message,
        lineNumber: index + 1,
        sourceFile: fileName,
      });
    }
  });

  return entries;
}

// Placeholder parsers with improved feedback
function parseIisOdbc(c, f) { console.warn(`Parsing for IISODBC is not implemented. Treating as TEXTLINE.`); return parseTextLine(c,f); }
function parseIisMsid(c, f) { console.warn(`Parsing for IISMSID is not implemented. Treating as TEXTLINE.`); return parseTextLine(c,f); }
function parseUrlScan(c, f) { console.warn(`Parsing for URLSCAN is not implemented. Treating as TEXTLINE.`); return parseTextLine(c,f); }
function parseBin(c, f) { console.warn(`Parsing for binary format BIN is not supported. File content will be read as text.`); return parseTextLine(c,f); }
function parseEvt(c, f) { console.warn(`Parsing for binary format EVT/EVTX is not supported. File content will be read as text.`); return parseTextLine(c,f); }
function parseEtw(c, f) { console.warn(`Parsing for binary format ETW is not supported. File content will be read as text.`); return parseTextLine(c,f); }
function parseNetmon(c, f) { console.warn(`Parsing for binary format NETMON is not supported. File content will be read as text.`); return parseTextLine(c,f); }
function parseAds(c, f) { console.warn(`Parsing for ADS (Alternate Data Streams) is not implemented. Treating as TEXTLINE.`); return parseTextLine(c,f); }
function parseFs(c, f) { console.warn(`Parsing for FS (File System) data is not implemented. Treating as TEXTLINE.`); return parseTextLine(c,f); }
function parseCom(c, f) { console.warn(`Parsing for COM source is not implemented. Treating as TEXTLINE.`); return parseTextLine(c,f); }


function autoDetectParser(content, fileName) {
  const extension = fileName.split('.').pop().toLowerCase();
  switch (extension) {
    case 'csv': return parseCsv(content, fileName);
    case 'tsv': return parseTsv(content, fileName);
    case 'xml': return parseXml(content, fileName);
    case 'log':
        if(content.includes('#Software: Microsoft HTTP API')) return parseHttpErr(content, fileName);
        return parseTextLine(content, fileName);
    case 'reg': return parseReg(content, fileName);
    case 'txt': return parseTextLine(content, fileName);
    case 'w3c': return parseW3c(content, fileName);
    case 'iis': return parseIis(content, fileName);
    default: return parseTextLine(content, fileName); // Fallback to TEXTLINE
  }
}

/**
 * Enhanced enterprise-grade log analysis function.
 * Identifies errors based on a prioritized list of patterns and keywords.
 * @param {Array<Object>} logEntries - Array of log entry objects.
 * @returns {Object} - An object containing grouped errors.
 */
const analyzeLogEntries = (logEntries) => {
    const errorMap = new Map();

    // Define a structured set of patterns with priority and categorization.
    // Higher priority numbers are matched first.
    const patterns = [
        // ✅ NEW: High-priority for specific installation failures with App ID
        {
            name: 'Installation Failure with AppID',
            regex: /(?:installation|install|configuration) (?:failed|failure).*?product code '(\{[\w-]{36,38}\})'.*?(?:error code|ExitCode) (\d+|0x[0-9a-fA-F]+)/i,
            keyGenerator: (match) => `Install Error ${match[2]} for AppID: ${match[1]}`,
            category: 'Installation Error',
            priority: 110
        },
        {
            name: 'Exit Code with AppID',
            regex: /(?:Exit Code|ExitCode) (\d+|0x[0-9a-fA-F]+).*?product code (\{[\w-]{36,38}\})/i,
            keyGenerator: (match) => `Exit Code ${match[1]} for AppID: ${match[2]}`,
            category: 'Installation Error',
            priority: 105
        },
        // High-priority: Specific application exceptions
        { name: 'Java Exception', regex: /(java\.[a-zA-Z.]*Exception):?/, category: 'Application Exception', priority: 100 },
        { name: '.NET Exception', regex: /System\.[a-zA-Z.]*Exception:/, category: 'Application Exception', priority: 100 },
        { name: 'Oracle DB Error', regex: /(ORA-\d{5})/, category: 'Database Error', priority: 95 },
        
        // High-priority: Specific error codes
        { name: 'Hex Error Code', regex: /(0x[a-fA-F0-9]{8}\b)/, category: 'System Error', priority: 90 },
        { name: 'HRESULT', regex: /(\bHRESULT\s*[:=]?\s*(0x[0-9A-Fa-f]+)\b)/, category: 'System Error', priority: 90 },
        
        // Medium-priority: Common service errors
        { name: 'HTTP Client Error', regex: /" (4\d{2}) \d+/, category: 'HTTP Client Error', priority: 80 },
        { name: 'HTTP Server Error', regex: /" (5\d{2}) \d+/, category: 'HTTP Server Error', priority: 85 },
        { name: 'Kernel Error', regex: /kernel: \[.*?\] (.*)/, category: 'Kernel Error', priority: 70 },
        
        // Low-priority: General keywords
        { name: 'Keyword: fatal', regex: /\b(fatal)\b/i, category: 'General Error', priority: 50 },
        { name: 'Keyword: critical', regex: /\b(critical)\b/i, category: 'General Error', priority: 49 },
        { name: 'Keyword: error', regex: /\b(error)\b/i, category: 'General Error', priority: 40 },
        { name: 'Keyword: exception', regex: /\b(exception)\b/i, category: 'General Error', priority: 39 },
        { name: 'Keyword: failed', regex: /\b(failed)\b/i, category: 'General Error', priority: 30 },
        { name: 'Keyword: denied', regex: /\b(denied)\b/i, category: 'Security Warning', priority: 25 },
        { name: 'Keyword: refused', regex: /\b(refused)\b/i, category: 'Connection Error', priority: 25 },
        { name: 'Keyword: timeout', regex: /\b(timeout)\b/i, category: 'Connection Error', priority: 20 },
        { name: 'Keyword: unhandled', regex: /\b(unhandled)\b/i, category: 'General Error', priority: 15 },
    ];

    logEntries.forEach((entry) => {
        let bestMatch = { priority: -1 };

        // Find the highest-priority pattern that matches the log line.
        for (const pattern of patterns) {
            const match = entry.message.match(pattern.regex);
            if (match && pattern.priority > bestMatch.priority) {
                bestMatch = {
                    // ✅ Use the keyGenerator if it exists for more descriptive error keys
                    key: pattern.keyGenerator ? pattern.keyGenerator(match) : (match[1] || match[0]),
                    type: pattern.name,
                    category: pattern.category,
                    priority: pattern.priority,
                };
            }
        }
        
        // If a match was found, add it to the error map.
        if (bestMatch.priority > -1) {
            const foundKey = bestMatch.key.trim();
            const context = { line: entry.message, lineNumber: entry.lineNumber, timestamp: entry.timestamp, sourceFile: entry.sourceFile };

            if (errorMap.has(foundKey)) {
                errorMap.get(foundKey).contexts.push(context);
            } else {
                errorMap.set(foundKey, {
                    key: foundKey,
                    type: bestMatch.type,
                    category: bestMatch.category, // Store category for potential future use in UI
                    contexts: [context],
                    aiAnalysis: null,
                    isAnalyzing: false,
                });
            }
        }
    });

    return Object.fromEntries(errorMap);
};


// --- Export Functions ---

const getFormattedTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-');
};

const escapeXml = (unsafe) => {
    if (typeof unsafe !== 'string') {
        unsafe = String(unsafe);
    }
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
};

const generateHtmlReport = (results) => {
  const resultsHtml = Object.values(results).map(item => {
    const firstContext = item.contexts[0];
    const highlightedLine = firstContext.line.replace(new RegExp(`(${item.key})`, 'i'), `<span class="highlight">$1</span>`);
    const solutionsHtml = (item.aiAnalysis?.solutions || []).map(s => `<li>${s}</li>`).join('');
    return `
      <div class="error-card">
        <div class="error-header">
          <span class="error-key">${item.key}</span>
          <span class="pill ${item.aiAnalysis?.severity?.toLowerCase() || 'gray'}">${item.aiAnalysis?.severity || 'N/A'}</span>
          <span class="error-count">${item.contexts.length} occurrences</span>
        </div>
        <div class="error-body">
          <h4>AI Analysis</h4>
          <p><b>Description:</b> ${item.aiAnalysis?.description || 'Not analyzed'}</p>
          <p><b>Impact:</b> ${item.aiAnalysis?.impact || 'N/A'}</p>
          <h5>Recommended Solutions:</h5>
          <ul class="solutions">${solutionsHtml || '<li>No solutions available.</li>'}</ul>
          <h4>Example Log Snippet</h4>
          <div class="code-snippet">
            <div class="code-header">From: ${firstContext.sourceFile} (Line: ${firstContext.lineNumber})</div>
            <code>${highlightedLine}</code>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8"><title>Log Analysis Report</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #111827; color: #e5e7eb; margin: 0; padding: 20px; }
        .container { max-width: 900px; margin: auto; }
        h1 { color: #ffffff; border-bottom: 2px solid #06b6d4; padding-bottom: 10px; }
        .error-card { background: #1f2937; border: 1px solid #374151; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.2); }
        .error-header { background: #374151; color: #fff; padding: 10px 15px; border-radius: 8px 8px 0 0; display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
        .error-key { font-family: 'Courier New', Courier, monospace; font-size: 1.2em; color: #f87171; }
        .error-body { padding: 20px; }
        h4, h5 { margin-top: 0; color: #06b6d4; }
        p { line-height: 1.6; }
        .solutions { padding-left: 20px; }
        .solutions li { background: #111827; color: #d1d5db; font-weight: bold; margin-bottom: 8px; padding: 10px; border-left: 4px solid #06b6d4; border-radius: 4px; }
        .code-snippet { background: #000; border-radius: 6px; margin-top: 15px; font-family: 'Courier New', Courier, monospace; }
        .code-header { background: #4b5563; padding: 5px 10px; font-size: 0.8em; color: #e5e7eb; border-top-left-radius: 6px; border-top-right-radius: 6px; }
        .code-snippet code { display: block; padding: 15px; font-size: 0.9em; white-space: pre-wrap; word-break: break-all; }
        .highlight { background-color: #ef4444; color: #ffffff; padding: 2px 4px; border-radius: 3px; }
        .pill { font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 9999px; font-weight: 600; text-transform: capitalize; }
        .pill.critical { background-color: #dc2626; color: white; }
        .pill.high { background-color: #f97316; color: white; }
        .pill.medium { background-color: #facc15; color: #422006; }
        .pill.low { background-color: #22c55e; color: white; }
        .pill.gray { background-color: #6b7280; color: white; }
      </style>
    </head>
    <body><div class="container"><h1>Log Analysis Report</h1>${resultsHtml}</div></body>
    </html>`;
};

const generateCsv = (results) => {
  let csv = 'ErrorKey,Type,Count,LastSeen,Severity,Description,Impact,Solutions\n';
  Object.values(results).forEach(item => {
    const lastSeen = item.contexts.reduce((latest, curr) => curr.timestamp > latest ? curr.timestamp : latest, new Date(0));
    const solutions = (item.aiAnalysis?.solutions || []).join('; ');
    csv += `"${item.key}","${item.type}",${item.contexts.length},"${lastSeen.toISOString()}","${item.aiAnalysis?.severity || ''}","${item.aiAnalysis?.description || ''}","${item.aiAnalysis?.impact || ''}","${solutions}"\n`;
  });
  return csv;
};

const generateTsv = (results) => {
  let tsv = 'ErrorKey\tType\tCount\tLastSeen\tSeverity\tDescription\tImpact\tSolutions\n';
  Object.values(results).forEach(item => {
    const lastSeen = item.contexts.reduce((latest, curr) => curr.timestamp > latest ? curr.timestamp : latest, new Date(0));
    const solutions = (item.aiAnalysis?.solutions || []).join('; ');
    tsv += `${item.key}\t${item.type}\t${item.contexts.length}\t${lastSeen.toISOString()}\t${item.aiAnalysis?.severity || ''}\t${item.aiAnalysis?.description || ''}\t${item.aiAnalysis?.impact || ''}\t${solutions}\n`;
  });
  return tsv;
};

const generateXml = (results) => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<analysis>\n';
  Object.values(results).forEach(item => {
    const lastSeen = item.contexts.reduce((latest, curr) => curr.timestamp > latest ? curr.timestamp : latest, new Date(0));
    xml += `  <error>\n`;
    xml += `    <key>${escapeXml(item.key)}</key>\n`;
    xml += `    <type>${escapeXml(item.type)}</type>\n`;
    xml += `    <count>${item.contexts.length}</count>\n`;
    xml += `    <lastSeen>${lastSeen.toISOString()}</lastSeen>\n`;
    xml += `    <severity>${escapeXml(item.aiAnalysis?.severity || '')}</severity>\n`;
    xml += `    <description>${escapeXml(item.aiAnalysis?.description || '')}</description>\n`;
    xml += `    <impact>${escapeXml(item.aiAnalysis?.impact || '')}</impact>\n`;
    xml += `    <solutions>\n`;
    (item.aiAnalysis?.solutions || []).forEach(solution => {
      xml += `      <solution>${escapeXml(solution)}</solution>\n`;
    });
    xml += `    </solutions>\n`;
    xml += `  </error>\n`;
  });
  xml += '</analysis>';
  return xml;
};

const generateDatagrid = (results) => {
    // DATAGRID export will be a detailed CSV of all individual log entries that were part of an error
    let csv = 'ErrorKey,Timestamp,SourceFile,LineNumber,Message\n';
    Object.values(results).forEach(item => {
        item.contexts.forEach(context => {
            const row = [
                item.key,
                context.timestamp.toISOString(),
                context.sourceFile,
                context.lineNumber,
                context.line.replace(/"/g, '""') // Escape double quotes for CSV
            ].map(val => `"${val}"`).join(',');
            csv += row + '\n';
        });
    });
    return csv;
};

const generateChartData = (results, allContexts) => {
    const totalCountsByHour = {};
    allContexts.forEach(context => {
        const hour = new Date(context.timestamp);
        hour.setMinutes(0, 0, 0);
        const hourISO = hour.toISOString();
        if (!totalCountsByHour[hourISO]) {
            totalCountsByHour[hourISO] = { time: hourISO, total: 0 };
        }
        totalCountsByHour[hourISO].total++;
    });

    const severityCountsByHour = {};
    Object.values(results).forEach(item => {
        if (!item.aiAnalysis?.severity) return;
        const severity = item.aiAnalysis.severity.toLowerCase();
        item.contexts.forEach(context => {
            const hour = new Date(context.timestamp);
            hour.setMinutes(0, 0, 0);
            const hourISO = hour.toISOString();
            if (!severityCountsByHour[hourISO]) {
                severityCountsByHour[hourISO] = { time: hourISO, critical: 0, high: 0, medium: 0, low: 0 };
            }
            if (severityCountsByHour[hourISO][severity] !== undefined) {
                severityCountsByHour[hourISO][severity]++;
            }
        });
    });

    const mergedData = {};
    Object.keys(totalCountsByHour).forEach(time => {
        mergedData[time] = {
            ...{ time: time, total: 0, critical: 0, high: 0, medium: 0, low: 0 },
            ...(totalCountsByHour[time] || {}),
            ...(severityCountsByHour[time] || {}),
        };
    });

    return Object.values(mergedData).sort((a, b) => new Date(a.time) - new Date(b.time));
};


const generateChart = (chartData) => {
    if (chartData.length === 0) return 'Timestamp,Total,Critical,High,Medium,Low\n';
    let csv = 'Timestamp,Total,Critical,High,Medium,Low\n';
    chartData.forEach(item => {
        const row = [
            item.time,
            item.total,
            item.critical,
            item.high,
            item.medium,
            item.low
        ].join(',');
        csv += row + '\n';
    });
    return csv;
};


const triggerDownload = (content, fileName, contentType) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// --- UI Components ---

const Header = ({ onMenuClick }) => (
  <header className="bg-slate-900 text-white p-4 shadow-lg flex items-center justify-between z-20">
    <div className="flex items-center">
      <button onClick={onMenuClick} className="mr-2 p-2 rounded-md lg:hidden hover:bg-slate-700">
        <Menu className="w-6 h-6" />
      </button>
      <TestTubeDiagonal className="w-8 h-8 mr-3 text-cyan-400" />
      <h1 className="text-xl font-bold">Log Analyzer Ultimate</h1>
    </div>
    <span className="text-sm font-mono text-cyan-400 hidden sm:block">Enterprise Edition</span>
  </header>
);

const TabButton = ({ icon: Icon, label, isActive, onClick }) => (
  <button onClick={onClick} className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${isActive ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
    <Icon className="w-5 h-5 mr-2" />
    {label}
  </button>
);

const ApiConfigModal = ({ isOpen, onClose, apiConfig, setApiConfig }) => {
  const [tempConfig, setTempConfig] = useState(apiConfig);
  const [customModel, setCustomModel] = useState('');

  const providers = useMemo(() => ({
    gemini: {
      name: "Google Gemini",
      models: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'],
      defaultEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent'
    },
    openai: {
      name: "OpenAI",
      models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      defaultEndpoint: 'https://api.openai.com/v1/chat/completions'
    },
    custom: {
      name: "Custom (Local/Other)",
      models: [],
      defaultEndpoint: 'http://127.0.0.1:11434/v1/chat/completions'
    }
  }), []);

  useEffect(() => {
    if (isOpen) {
      setTempConfig(apiConfig);
      const currentProviderModels = providers[apiConfig.provider]?.models || [];
      if (apiConfig.provider !== 'custom' && !currentProviderModels.includes(apiConfig.model)) {
        setCustomModel(apiConfig.model);
        setTempConfig(prev => ({ ...prev, model: '--custom--' }));
      } else {
        setCustomModel('');
      }
    }
  }, [isOpen, apiConfig, providers]);


  const handleSave = () => {
    let finalConfig = { ...tempConfig };
    if (tempConfig.model === '--custom--') {
        finalConfig.model = customModel || 'custom-model'; // Use custom input or a default
    }
    setApiConfig(finalConfig);
    localStorage.setItem('log-analyzer-apiconfig', JSON.stringify(finalConfig));
    onClose();
  };

  if (!isOpen) return null;
  
  const currentProviderModels = providers[tempConfig.provider]?.models || [];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4">Advanced API Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">AI Provider</label>
            <select
              value={tempConfig.provider}
              onChange={e => setTempConfig({ ...tempConfig, provider: e.target.value, model: providers[e.target.value].models[0] || '', customEndpoint: providers[e.target.value].defaultEndpoint })}
              className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2"
            >
              {Object.keys(providers).map(p => <option key={p} value={p}>{providers[p].name}</option>)}
            </select>
          </div>
          
          {tempConfig.provider !== 'custom' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Model</label>
                <select
                  value={tempConfig.model}
                  onChange={(e) => setTempConfig({...tempConfig, model: e.target.value})}
                  className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2"
                >
                  {currentProviderModels.map(m => <option key={m} value={m}>{m}</option>)}
                  <option value="--custom--">Enter Custom Model...</option>
                </select>
              </div>
              {tempConfig.model === '--custom--' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Custom Model Name</label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 font-mono"
                    placeholder="e.g., gemini-3.5-flash"
                  />
                </div>
              )}
            </>
          ) : (
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Model Name (if applicable)</label>
                <input
                    type="text"
                    value={tempConfig.model}
                    onChange={e => setTempConfig({ ...tempConfig, model: e.target.value })}
                    className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 font-mono"
                    placeholder="Enter model name"
                />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">API Key</label>
            <input
              type="password"
              value={tempConfig.apiKey}
              onChange={e => setTempConfig({ ...tempConfig, apiKey: e.target.value })}
              className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2"
              placeholder="Enter your API Key (if required)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">API Endpoint URL</label>
            <input
              type="text"
              value={tempConfig.customEndpoint}
              onChange={e => setTempConfig({ ...tempConfig, customEndpoint: e.target.value })}
              className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 font-mono"
              placeholder={providers[tempConfig.provider].defaultEndpoint}
            />
            {tempConfig.provider === 'gemini' && 
                <p className="text-xs text-slate-400 mt-1">The `&#123;model&#125;` placeholder will be replaced with the model name.</p>
            }
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="bg-slate-600 px-4 py-2 rounded-md hover:bg-slate-500">Cancel</button>
          <button onClick={handleSave} className="bg-cyan-600 px-4 py-2 rounded-md hover:bg-cyan-500">Save Configuration</button>
        </div>
      </div>
    </div>
  );
};

const FileUploader = ({ onFileSelect, disabled, fileNames }) => (
  <div className="mb-2">
    <label className="block text-sm font-medium text-slate-300 mb-2">Log Files</label>
    <div className="relative">
      <input type="file" id="logFile" multiple onChange={(e) => onFileSelect(Array.from(e.target.files))} disabled={disabled} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      <div className="flex items-center justify-center w-full bg-slate-700 border-2 border-dashed border-slate-500 rounded-md p-4 text-center text-slate-400 hover:border-cyan-500 hover:text-cyan-400 transition min-h-[60px]">
        {fileNames.length > 0 ? (
          <div className="text-xs text-left">
            {fileNames.map(f => <p key={f.name} className="truncate">- {f.name}</p>)}
          </div>
        ) : 'Click or Drag to Upload Files / ZIP'}
      </div>
    </div>
    <div className="text-xs text-slate-500 mt-1 group relative cursor-pointer">
      Supported: .log, .txt, .zip, .evtx, .etl...
      <div className="absolute hidden group-hover:block bg-slate-700 text-slate-300 p-2 rounded-md shadow-lg text-xs w-64 z-10">
        .log, .txt, .text, .out, .zip, .gz, .tar, .iis, .access, .nginx, .apache, .evtx, .etl, .csv, .xml, .json, .ini, .inf, .syslog, .auth, .dmesg, .messages, .md, .config, .yml, .yaml, .sql, .py, .js, .java, .cpp, .cs
        <p className="mt-1 text-cyan-400">*Binary formats are read as text; ZIP is extracted.</p>
      </div>
    </div>
  </div>
);

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-slate-800 p-4 rounded-lg flex items-center">
    <Icon className="w-8 h-8 mr-4 text-cyan-400" />
    <div><p className="text-slate-400 text-sm">{title}</p><p className="text-2xl font-bold">{value}</p></div>
  </div>
);

const executeQuery = (query, allContexts) => {
  if (!query.toLowerCase().startsWith('select')) throw new Error("Only SELECT queries are supported.");
  const whereMatch = query.match(/where\s+(.+?)(group by|order by|$)/i);
  if (!whereMatch) return allContexts.map(i => ({ ...i, timestamp: i.timestamp.toLocaleString() }));

  const [field, operator, value] = whereMatch[1].trim().split(/\s+/, 3);
  const cleanValue = value.replace(/['"]/g, '');

  return allContexts
    .filter(item => {
      const itemValue = (field.toLowerCase() === 'message') ? item.line : item.sourceFile;
      if (!itemValue) return false;
      return operator.toLowerCase() === 'contains' && itemValue.toLowerCase().includes(cleanValue.toLowerCase());
    })
    .map(i => ({ ...i, timestamp: i.timestamp.toLocaleString() }));
};

const DataExplorerView = ({ allContexts }) => {
  const [query, setQuery] = useState("SELECT * FROM logs WHERE message contains 'denied'");
  const [queryResult, setQueryResult] = useState([]);
  const [queryError, setQueryError] = useState('');

  const handleRunQuery = () => {
    try {
      if (allContexts.length === 0) {
        setQueryError('No data loaded. Please run an analysis first.');
        return;
      }
      setQueryError('');
      const result = executeQuery(query, allContexts);
      setQueryResult(result);
    } catch (e) {
      setQueryError(e.message);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-xl font-bold">Data Explorer (Experimental)</h3>
      <div className="bg-slate-800 p-4 rounded-lg space-y-3">
        <textarea value={query} onChange={e => setQuery(e.target.value)} className="w-full h-24 bg-slate-900 border border-slate-600 rounded-md p-2 font-mono" />
        <button onClick={handleRunQuery} className="bg-cyan-600 font-semibold px-4 py-2 rounded-md hover:bg-cyan-700">Run Query</button>
        {queryError && <p className="text-red-400">{queryError}</p>}
      </div>
      <div className="bg-slate-800 p-4 rounded-lg">
        <h4 className="font-bold mb-2">Query Results ({queryResult.length} rows)</h4>
        <div className="overflow-auto max-h-96">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-700 sticky top-0">
              <tr>
                <th className="p-2 w-[25%]">Timestamp</th>
                <th className="p-2 w-[25%]">Source</th>
                <th className="p-2 w-[10%]">Line #</th>
                <th className="p-2 w-[40%]">Message</th>
              </tr>
            </thead>
            <tbody>
              {queryResult.map((row, i) => (
                <tr key={i} className="border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="p-2 whitespace-nowrap">{row.timestamp}</td>
                  <td className="p-2 truncate">{row.sourceFile}</td>
                  <td className="p-2">{row.lineNumber}</td>
                  <td className="p-2 truncate">{row.line}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ResultCard = ({ item, onAnalyze }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const severityColor = {
    critical: 'bg-red-600', high: 'bg-orange-500', medium: 'bg-yellow-500', low: 'bg-green-500'
  }[item.aiAnalysis?.severity?.toLowerCase()] || 'bg-slate-500';

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
      <header className="bg-slate-900/70 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-4 flex-grow min-w-0">
          <span className={`font-mono text-red-400 text-lg truncate`}>{item.key}</span>
          <span className="text-xs bg-slate-700 px-2 py-1 rounded-full whitespace-nowrap">{item.type}</span>
          {item.aiAnalysis?.severity && <span className={`px-2 py-0.5 text-xs rounded-full font-semibold text-white ${severityColor}`}>{item.aiAnalysis.severity}</span>}
        </div>
        <div className="flex items-center gap-4 pl-0 sm:pl-4 flex-shrink-0 mt-2 sm:mt-0">
          <span className="font-bold text-xl">{item.contexts.length}</span>
          <button className="p-1 hover:bg-slate-700 rounded-full">{isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</button>
        </div>
      </header>
      {isExpanded && <div className="p-4 space-y-4">
        {item.isAnalyzing ? (<div className="flex items-center gap-2 text-cyan-400"><BrainCircuit size={16} className="animate-pulse" /> Analyzing...</div>)
          : item.aiAnalysis ? (<>
            <div><h5 className="font-semibold text-cyan-400 mb-1">AI Description</h5><p className="text-slate-300 mb-3">{item.aiAnalysis.description}</p></div>
            <div><h5 className="font-semibold text-cyan-400 mb-1">Potential Impact</h5><p className="text-slate-300 mb-3">{item.aiAnalysis.impact}</p></div>
            <div><h5 className="font-semibold text-cyan-400 mb-1">Recommended Solutions</h5><ol className="list-decimal list-inside text-slate-300 space-y-1">{item.aiAnalysis.solutions.map((s, i) => <li key={i}>{s}</li>)}</ol></div>
          </>) : (
            <button onClick={() => onAnalyze(item.key)} disabled={item.isAnalyzing} className="flex items-center gap-2 bg-cyan-600 px-3 py-2 rounded-md text-sm font-semibold hover:bg-cyan-700 disabled:bg-slate-600">
              <BrainCircuit size={16} /> Get Detailed AI Analysis
            </button>
          )}
        <div><h5 className="font-semibold text-cyan-400 mb-1">Log Contexts ({item.contexts.length})</h5><pre className="bg-slate-900 text-slate-300 p-3 rounded-md text-xs whitespace-pre-wrap break-all max-h-48 overflow-y-auto">{item.contexts.map(c => `[${c.timestamp.toLocaleTimeString()}] ${c.sourceFile} line ${c.lineNumber}: ${c.line}`).join('\n')}</pre></div>
      </div>}
    </div>
  );
};

// ✅ NEW: Component to display the AI-generated summary
const AnalysisSummary = ({ summary, isLoading }) => {
    if (isLoading) {
        return (
            <div className="p-4 mb-4 bg-slate-800 rounded-lg border border-slate-700">
                <h3 className="text-lg font-bold text-cyan-400 mb-2 flex items-center gap-2"><BrainCircuit className="animate-spin" /> Generating AI Summary...</h3>
                <div className="h-16 w-full bg-slate-700 animate-pulse rounded-md"></div>
            </div>
        )
    }

    if (!summary) return null;

    return (
        <div className="p-4 mb-4 bg-slate-800 rounded-lg border border-cyan-500/50">
            <h3 className="text-lg font-bold text-cyan-400 mb-2">AI-Generated Summary</h3>
            <p className="text-slate-300">{summary}</p>
        </div>
    )
}


const ResultsView = ({ results, onAnalyze, filter, setFilter, analysisSummary, isSummaryLoading }) => {
  const filteredResults = useMemo(() => Object.values(results).filter(item => item.key.toLowerCase().includes(filter.toLowerCase())).sort((a, b) => b.contexts.length - a.contexts.length), [results, filter]);
  return (
    <div className="p-4">
      {/* ✅ ADDED: Display the summary component */}
      <AnalysisSummary summary={analysisSummary} isLoading={isSummaryLoading} />
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input type="text" placeholder="Filter errors..." value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 pl-10 focus:ring-cyan-500" />
      </div>
      <div className="space-y-4">
        {filteredResults.length > 0 ? filteredResults.map(item => <ResultCard key={item.key} item={item} onAnalyze={onAnalyze} />) : <div className="text-center p-10 text-slate-400">No results match.</div>}
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiConfig, setApiConfig] = useState({
    provider: 'gemini',
    model: 'gemini-2.0-flash',
    apiKey: '',
    customEndpoint: ''
  });
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [logFiles, setLogFiles] = useState([]);
  const [results, setResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [inputFormat, setInputFormat] = useState('AUTO');
  const [libsLoaded, setLibsLoaded] = useState(!!window.JSZip);
  // ✅ NEW: State for AI summary
  const [analysisSummary, setAnalysisSummary] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  useEffect(() => {
    if (!window.JSZip) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.async = true;
      script.onload = () => {
        setLibsLoaded(true);
        // ✅ FIXED: Removed redundant self-assignment: window.JSZip = window.JSZip;
      };
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);
  
  useEffect(() => {
    const savedConfig = localStorage.getItem('log-analyzer-apiconfig');
    if (savedConfig) {
      setApiConfig(JSON.parse(savedConfig));
    }
  }, []);

  const allContexts = useMemo(() => Object.values(results).flatMap(error => error.contexts), [results]);

  const handleFileSelect = (files) => { setLogFiles(files); setResults({}); setError(''); setAnalysisSummary(null); };

  const handleAnalyze = async () => {
    if (logFiles.length === 0) { setError('Please upload one or more log files first.'); return; }
    if (!libsLoaded) { setError('Core library is still loading, please wait a moment.'); return; }
    setError(''); setIsLoading(true); setResults({}); setAnalysisSummary(null);

    let allLogEntries = [];
    for (const file of logFiles) {
      let filesToProcess = [];
      if (file.name.endsWith('.zip')) {
        try {
          const zip = await window.JSZip.loadAsync(file);
          for (const fileName in zip.files) {
            if (!zip.files[fileName].dir) {
              filesToProcess.push({ name: fileName, text: () => zip.files[fileName].async('string') });
            }
          }
        } catch (e) { setError(`Failed to read ZIP: ${e.message}`); setIsLoading(false); return; }
      } else { filesToProcess.push(file); }
      for (const f of filesToProcess) {
        try {
          const content = await f.text();
          const parser = inputFormats.find(fmt => fmt.name === inputFormat)?.parser || autoDetectParser;
          const entries = parser(content, f.name);
          allLogEntries.push(...entries);
        } catch (e) { setError(`Error processing ${f.name}: ${e.message}`); }
      }
    }
    const analyzedResults = analyzeLogEntries(allLogEntries);
    setResults(analyzedResults);
    setIsLoading(false);
    setActiveTab('results');
    if (Object.keys(analyzedResults).length === 0) {
      setError("No potential errors found in the selected files.");
      setActiveTab('dashboard');
    }
  };
  
  const handleApiCall = useCallback(async (prompt, model, apiKey, provider, customEndpoint) => {
    let endpoint = customEndpoint;
    let body;
    let headers = { 'Content-Type': 'application/json' };

    if (provider === 'gemini') {
        let finalEndpoint = endpoint.replace('{model}', model);
        if (!endpoint.includes('{model}')) {
            finalEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        } else {
            finalEndpoint += `?key=${apiKey}`;
        }
        body = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] });
        endpoint = finalEndpoint;
    } else if (provider === 'openai' || provider === 'custom') {
        if (!endpoint) {
            endpoint = (provider === 'openai') ? 'https://api.openai.com/v1/chat/completions' : 'http://127.0.0.1:11434/v1/chat/completions';
        }
        if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
        
        body = JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" } 
        });
    }

    const response = await fetch(endpoint, { method: 'POST', headers, body });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    let textToParse;

    if (provider === 'gemini') {
        textToParse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textToParse) throw new Error("Invalid Gemini response structure.");
    } else { // openai or custom
        textToParse = data?.choices?.[0]?.message?.content;
        if (!textToParse) throw new Error("Invalid OpenAI/Custom response structure.");
    }

    try {
        return JSON.parse(textToParse);
    } catch (e) {
        const jsonMatch = textToParse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Could not find a valid JSON object in the AI response.");
        return JSON.parse(jsonMatch[0]);
    }
 }, []);

  const handleAiAnalyze = useCallback(async (errorKey) => {
    const errorItem = results[errorKey];
    if (!errorItem) return Promise.reject("Error item not found.");
    if (!apiConfig.apiKey && apiConfig.provider !== 'custom') {
        setError("API Key not set.");
        setIsApiModalOpen(true);
        return Promise.reject("API Key not set.");
    }
    if (apiConfig.provider === 'custom' && !apiConfig.customEndpoint) {
        setError("Custom endpoint not set for custom provider.");
        setIsApiModalOpen(true);
        return Promise.reject("Custom endpoint not set.");
    }

    setResults(prev => ({ ...prev, [errorKey]: { ...prev[errorKey], isAnalyzing: true } }));

    const prompt = `You are an expert IT helpdesk and system administrator. Analyze this log entry.
Error: '${errorItem.key}'
Context line: ${errorItem.contexts[0].line}
From log file: ${errorItem.contexts[0].sourceFile}

Format your response strictly as a JSON object with keys: "description", "impact", "severity", and "solutions".
- "description": (string) A detailed explanation of the error's root cause.
- "impact": (string) Describe the likely impact on the system or application.
- "severity": (string) Classify the severity as one of: "Critical", "High", "Medium", "Low".
- "solutions": (array of strings) Provide a list of actionable, step-by-step solutions.

Example Response:
{
  "description": "The system denied access to a resource because the provided credentials have expired.",
  "impact": "The user or service will be unable to access required resources, potentially halting workflows.",
  "severity": "High",
  "solutions": [
    "Verify the expiration date of the user's password or service account credentials.",
    "Renew or reissue the credentials through the appropriate admin portal.",
    "Check system clock synchronization on both the client and server to rule out time drift."
  ]
}`;

    try {
      const aiAnalysis = await handleApiCall(prompt, apiConfig.model, apiConfig.apiKey, apiConfig.provider, apiConfig.customEndpoint);
      setResults(prev => ({ ...prev, [errorKey]: { ...prev[errorKey], aiAnalysis, isAnalyzing: false } }));
      return Promise.resolve();
    } catch (err) {
      const failAnalysis = { description: `Analysis failed: ${err.message}`, impact: "N/A", severity: "Unknown", solutions: [] };
      setResults(prev => ({ ...prev, [errorKey]: { ...prev[errorKey], aiAnalysis: failAnalysis, isAnalyzing: false } }));
      return Promise.reject(err.message);
    }
  }, [results, apiConfig, handleApiCall]);

 const handleGenerateAiSummary = useCallback(async () => {
    const analyzedItems = Object.values(results).filter(r => r.aiAnalysis && r.aiAnalysis.severity !== 'Unknown');
    if (analyzedItems.length < 2) return;

    setIsSummaryLoading(true);

    const errorSummaries = analyzedItems.map(item => ({
        error: item.key,
        severity: item.aiAnalysis.severity,
        description: item.aiAnalysis.description
    }));

    const prompt = `You are a senior systems analyst. Based on the following list of identified errors, generate a high-level executive summary. The summary should identify the most critical issues, potential systemic problems, and a general assessment of the system's health.

    Identified Errors:
    ${JSON.stringify(errorSummaries.slice(0, 10), null, 2)} 

    Format your response strictly as a JSON object with a single key: "summary".
    - "summary": (string) A concise, well-written paragraph summarizing the overall situation.

    Example Response:
    {
      "summary": "The system is experiencing critical instability, primarily driven by recurrent database connection timeouts (ORA-12170) and multiple application installation failures. These issues suggest a potential network infrastructure problem or misconfiguration of the database listeners. Immediate attention should be given to resolving the network and database connectivity to prevent a full-scale service outage."
    }`;

    try {
        const responseJson = await handleApiCall(prompt, apiConfig.model, apiConfig.apiKey, apiConfig.provider, apiConfig.customEndpoint);
        if (responseJson.summary) {
            setAnalysisSummary(responseJson.summary);
        }
    } catch (err) {
        console.error("Failed to generate AI summary:", err);
        // Do not set an error in the main UI for this, just log it.
    } finally {
        setIsSummaryLoading(false);
    }
}, [results, apiConfig, handleApiCall]);

  const analyzedItemsCount = useMemo(() => {
    return Object.values(results).filter(r => r.aiAnalysis && r.aiAnalysis.severity !== 'Unknown').length;
  }, [results]);

  useEffect(() => {
    const shouldGenerateSummary = analyzedItemsCount > 1 && !analysisSummary && !isSummaryLoading;
    if (shouldGenerateSummary) {
      handleGenerateAiSummary();
    }
  }, [analyzedItemsCount, analysisSummary, isSummaryLoading, handleGenerateAiSummary]);


  const handleAnalyzeAll = async () => {
    if ((!apiConfig.apiKey && apiConfig.provider !== 'custom') || (apiConfig.provider === 'custom' && !apiConfig.customEndpoint)) { 
        setError('Please configure your API Key or Custom Endpoint before running batch analysis.'); 
        setIsApiModalOpen(true);
        return;
    }
    setIsBatchAnalyzing(true);
    setError('');

    const promises = Object.values(results)
      .filter(item => !item.aiAnalysis)
      .map(item => handleAiAnalyze(item.key));

    await Promise.allSettled(promises);
    setIsBatchAnalyzing(false);
    // The useEffect hook will now automatically trigger the summary generation
  };

  const DashboardView = ({ results, allContexts, setError }) => {
    const [isExportOpen, setIsExportOpen] = useState(false);
    const timelineData = useMemo(() => generateChartData(results, allContexts), [results, allContexts]);

    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <div className="p-3 bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-lg shadow-lg text-sm">
            <p className="font-bold text-white mb-2">{new Date(label).toLocaleString()}</p>
            <p className="text-violet-400">Total Errors: <span className="font-bold">{data.total}</span></p>
            {data.critical > 0 && <p className="text-red-500">Critical: <span className="font-bold">{data.critical}</span></p>}
            {data.high > 0 && <p className="text-orange-400">High: <span className="font-bold">{data.high}</span></p>}
            {data.medium > 0 && <p className="text-yellow-400">Medium: <span className="font-bold">{data.medium}</span></p>}
            {data.low > 0 && <p className="text-green-400">Low: <span className="font-bold">{data.low}</span></p>}
          </div>
        );
      }
      return null;
    };

    const renderChart = () => {
      if (timelineData.length === 0) {
        return <div className="bg-slate-800 p-4 rounded-lg h-80 flex items-center justify-center text-slate-400">Not enough data to display timeline. Analyze logs and run AI analysis to see the chart.</div>;
      }

      return (
        <div className="bg-slate-800 p-4 rounded-lg h-80">
          <h4 className="font-bold mb-4">Error Timeline by Severity</h4>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
              <Line dataKey="total" name="Total" stroke="#a78bfa" strokeWidth={2} dot={false} />
              <Scatter name="Critical" dataKey="critical" fill="#ef4444" />
              <Scatter name="High" dataKey="high" fill="#f97316" />
              <Scatter name="Medium" dataKey="medium" fill="#f59e0b" />
              <Scatter name="Low" dataKey="low" fill="#22c55e" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      );
    };
    
    const handleExport = (format) => {
        const ts = getFormattedTimestamp();
        let content, fileName, contentType;
        
        switch (format) {
            case 'html':
                content = generateHtmlReport(results);
                fileName = `report_${ts}.html`;
                contentType = 'text/html';
                break;
            case 'csv':
                content = generateCsv(results);
                fileName = `report_${ts}.csv`;
                contentType = 'text/csv';
                break;
            case 'tsv':
                content = generateTsv(results);
                fileName = `report_${ts}.tsv`;
                contentType = 'text/tab-separated-values';
                break;
            case 'xml':
                content = generateXml(results);
                fileName = `report_${ts}.xml`;
                contentType = 'application/xml';
                break;
            case 'datagrid':
                content = generateDatagrid(results);
                fileName = `datagrid_${ts}.csv`;
                contentType = 'text/csv';
                break;
            case 'chart':
                const chartData = generateChartData(results, allContexts);
                content = generateChart(chartData);
                fileName = `chart-data_${ts}.csv`;
                contentType = 'text/csv';
                break;
            default:
                setError(`Export to ${format.toUpperCase()} is not yet implemented.`);
                return;
        }

        triggerDownload(content, fileName, contentType);
        setIsExportOpen(false);
    };

    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Unique Errors" value={Object.keys(results).length} icon={AlertCircle} />
          <StatCard title="Total Occurrences" value={allContexts.length} icon={Search} />
          <StatCard title="Files Analyzed" value={logFiles.length} icon={FileText} />
          <div className="relative bg-slate-800 p-4 rounded-lg flex items-center justify-center">
            <button onClick={() => setIsExportOpen(!isExportOpen)} className="bg-cyan-600 font-semibold px-4 py-2 rounded-md hover:bg-cyan-700 flex items-center gap-2"><FileDown />Export</button>
            {isExportOpen && (
              <div className="absolute top-full mt-2 right-0 bg-slate-700 rounded-md shadow-lg z-10 w-48">
                <button onClick={() => handleExport('html')} className="w-full text-left px-4 py-2 hover:bg-slate-600">as HTML Report</button>
                <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2 hover:bg-slate-600">as CSV</button>
                <button onClick={() => handleExport('tsv')} className="w-full text-left px-4 py-2 hover:bg-slate-600">as TSV</button>
                <button onClick={() => handleExport('xml')} className="w-full text-left px-4 py-2 hover:bg-slate-600">as XML</button>
                <button onClick={() => handleExport('datagrid')} className="w-full text-left px-4 py-2 hover:bg-slate-600">as DATAGRID</button>
                <button onClick={() => handleExport('chart')} className="w-full text-left px-4 py-2 hover:bg-slate-600">as CHART</button>
              </div>
            )}
          </div>
        </div>
        {renderChart()}
      </div>
    );
  };

  return (
    <div className="h-screen bg-slate-900 text-white font-sans flex flex-col">
      <ApiConfigModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} apiConfig={apiConfig} setApiConfig={setApiConfig} />
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      <div className="flex flex-grow overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        <div className={`fixed inset-0 bg-black/50 z-30 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>
        
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 w-80 bg-slate-800 p-4 flex flex-col gap-6 border-r border-slate-700 overflow-y-auto z-40 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:flex-shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-end lg:hidden">
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-md hover:bg-slate-700">
                  <X className="w-6 h-6" />
              </button>
          </div>
          <div className="p-4 bg-slate-800 rounded-lg">
            <h3 className="text-lg font-bold mb-4">Analysis Controls</h3>
            <button onClick={() => setIsApiModalOpen(true)} className="w-full text-left mb-4 flex items-center gap-2 bg-slate-700 p-2 rounded-md hover:bg-slate-600">
              <KeyRound className={(apiConfig.apiKey || (apiConfig.provider === 'custom' && apiConfig.customEndpoint)) ? 'text-green-400' : 'text-yellow-400'} />
              <div>
                <span className='block text-sm'>{(apiConfig.apiKey || (apiConfig.provider === 'custom' && apiConfig.customEndpoint)) ? 'API Config Set' : 'Set API Config'}</span>
                <span className='block text-xs text-slate-400 capitalize'>{apiConfig.provider}: {apiConfig.model}</span>
              </div>
            </button>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-1">Input Format</label>
              <select value={inputFormat} onChange={(e) => setInputFormat(e.target.value)} className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2">
                {inputFormats.map(format => <option key={format.name} value={format.name}>{format.name}</option>)}
              </select>
            </div>
            <FileUploader onFileSelect={handleFileSelect} disabled={isLoading || isBatchAnalyzing} fileNames={logFiles} />
            <button onClick={handleAnalyze} disabled={isLoading || isBatchAnalyzing || logFiles.length === 0 || !libsLoaded} className="w-full bg-cyan-600 font-bold py-3 px-4 rounded-md disabled:bg-slate-600/50 disabled:cursor-not-allowed">
              {isLoading ? 'Parsing Logs...' : (!libsLoaded ? 'Loading Libs...' : 'Run Analysis')}
            </button>
            <button
              onClick={handleAnalyzeAll}
              disabled={isLoading || isBatchAnalyzing || Object.keys(results).length === 0}
              className="w-full mt-2 bg-purple-600 font-bold py-3 px-4 rounded-md disabled:bg-slate-600/50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors"
            >
              {isBatchAnalyzing ? <><BrainCircuit className="animate-spin" size={20} />Analyzing All...</> : <><Zap size={20} />Analyze All Errors</>}
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <TabButton label="Dashboard" icon={LayoutDashboard} isActive={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />
            <TabButton label="Analysis Results" icon={FileText} isActive={activeTab === 'results'} onClick={() => { setActiveTab('results'); setIsSidebarOpen(false); }} />
            <TabButton label="Data Explorer" icon={Database} isActive={activeTab === 'explorer'} onClick={() => { setActiveTab('explorer'); setIsSidebarOpen(false); }} />
          </div>
          {error && <div className="mt-auto bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md text-sm flex items-center gap-2"><AlertCircle size={20} /> {error} <X size={20} className="ml-auto cursor-pointer" onClick={() => setError('')} /></div>}
        </aside>
        <main className="flex-grow bg-slate-900 overflow-y-auto min-w-0">
          {activeTab === 'dashboard' && <DashboardView results={results} allContexts={allContexts} setError={setError} />}
          {activeTab === 'results' && <ResultsView results={results} onAnalyze={handleAiAnalyze} filter={filter} setFilter={setFilter} analysisSummary={analysisSummary} isSummaryLoading={isSummaryLoading} />}
          {activeTab === 'explorer' && <DataExplorerView allContexts={allContexts} />}
        </main>
      </div>
    </div>
  );
}
