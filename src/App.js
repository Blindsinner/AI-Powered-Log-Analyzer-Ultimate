import JSZip from 'jszip';
window.JSZip = JSZip; // Expose to global scope for utils
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { FileText, Settings, LayoutDashboard, BrainCircuit, Search, AlertCircle, X, ChevronDown, ChevronUp, Database, FileDown, TestTubeDiagonal, KeyRound, CheckCircle, BarChartHorizontal, Zap, Server } from 'lucide-react';
import { ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Scatter, Legend } from 'recharts';

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

const parseLogFile = (logContent, originalFileName, keywords) => {
    const lines = logContent.split('\n');
    if (lines.length === 0) return {};

    const errorMap = new Map();
    const allKeywords = [...(keywords || []), "error", "failed", "denied", "timeout", "exception", "critical", "fatal", "unhandled", "refused", "access denied"];
    const regexPatterns = {
        '0x[a-fA-F0-9]{8}\\b': "Hex Error Code",
        '\\bHRESULT\\s*[:=]?\\s*(0x[0-9A-Fa-f]+)\\b': "HRESULT",
        '\\b[eE][rR]{2}[oO][rR]\\s*([cC][oO][dD][eE])?\\s*[:=]?\\s*([0-9]+)\\b': "Error Code",
        '\\b[fF][aA][iI][lL]([eE][dD]|[uU][rR][eE])?\\b': "Failure Keyword",
    };
    const keywordRegex = new RegExp(`\\b(${allKeywords.join('|')})\\b`, 'i');

    lines.forEach((line, index) => {
        let foundKey = null, matchType = null;
        for (const [pattern, type] of Object.entries(regexPatterns)) {
            const match = line.match(new RegExp(pattern, 'i'));
            if (match) {
                foundKey = match[0].trim();
                matchType = type;
                break;
            }
        }
        if (!foundKey) {
            const keywordMatch = line.match(keywordRegex);
            if (keywordMatch) {
                foundKey = keywordMatch[0].toLowerCase();
                matchType = 'Keyword Match';
            }
        }

        if (foundKey) {
            const timestamp = parseTimestamp(line) || new Date();
            const entry = { line, lineNumber: index + 1, timestamp, sourceFile: originalFileName };
            if (errorMap.has(foundKey)) {
                errorMap.get(foundKey).contexts.push(entry);
            } else {
                errorMap.set(foundKey, {
                    key: foundKey,
                    type: matchType,
                    contexts: [entry],
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
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}`;
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
    `}).join('');

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
            .solutions li {
                background: #111827;
                color: #d1d5db;
                font-weight: bold;
                margin-bottom: 8px;
                padding: 10px;
                border-left: 4px solid #06b6d4;
                border-radius: 4px;
            }
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

const Header = () => (
    <header className="bg-slate-900 text-white p-4 shadow-lg flex items-center justify-between z-20">
        <div className="flex items-center">
            <TestTubeDiagonal className="w-8 h-8 mr-3 text-cyan-400" />
            <h1 className="text-xl font-bold">Log Analyzer Ultimate</h1>
        </div>
        <span className="text-sm font-mono text-cyan-400">Enterprise Edition</span>
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

    useEffect(() => {
        setTempConfig(apiConfig);
    }, [isOpen, apiConfig]);

    const providers = {
        gemini: {
            name: "Google Gemini",
            models: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'],
            defaultEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent'
        },
        openai: {
            name: "OpenAI",
            models: ['gpt-4o', 'gpt-3.5-turbo'],
            defaultEndpoint: 'https://api.openai.com/v1/chat/completions'
        }
    };

    const handleSave = () => {
        setApiConfig(tempConfig);
        localStorage.setItem('log-analyzer-apiconfig', JSON.stringify(tempConfig));
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">Advanced API Configuration</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">AI Provider</label>
                        <select
                            value={tempConfig.provider}
                            onChange={e => setTempConfig({ ...tempConfig, provider: e.target.value, model: providers[e.target.value].models[0] })}
                            className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2"
                        >
                            {Object.keys(providers).map(p => <option key={p} value={p}>{providers[p].name}</option>)}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Model</label>
                         <select
                            value={tempConfig.model}
                            onChange={e => setTempConfig({ ...tempConfig, model: e.target.value })}
                            className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2"
                        >
                            {providers[tempConfig.provider].models.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">API Key</label>
                        <input 
                            type="password" 
                            value={tempConfig.apiKey} 
                            onChange={e => setTempConfig({ ...tempConfig, apiKey: e.target.value })}
                            className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2"
                            placeholder="Enter your API Key" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Custom Endpoint (Optional)</label>
                         <input 
                            type="text" 
                            value={tempConfig.customEndpoint} 
                            onChange={e => setTempConfig({ ...tempConfig, customEndpoint: e.target.value })}
                            className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 font-mono"
                            placeholder={providers[tempConfig.provider].defaultEndpoint} />
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
        <Icon className="w-8 h-8 mr-4 text-cyan-400"/>
        <div><p className="text-slate-400 text-sm">{title}</p><p className="text-2xl font-bold">{value}</p></div>
    </div>
);

const executeQuery = (query, allContexts) => {
    if (!query.toLowerCase().startsWith('select')) throw new Error("Only SELECT queries are supported.");
    const whereMatch = query.match(/where\s+(.+?)(group by|order by|$)/i);
    if (!whereMatch) return allContexts.map(i => ({...i, timestamp: i.timestamp.toLocaleString()}));
    
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
            <header className="bg-slate-900/70 p-3 flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-4">
                    <span className={`font-mono text-red-400 text-lg`}>{item.key}</span>
                    <span className="text-xs bg-slate-700 px-2 py-1 rounded-full">{item.type}</span>
                    {item.aiAnalysis?.severity && <span className={`px-2 py-0.5 text-xs rounded-full font-semibold text-white ${severityColor}`}>{item.aiAnalysis.severity}</span>}
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-bold text-xl">{item.contexts.length}</span>
                    <button className="p-1 hover:bg-slate-700 rounded-full">{isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}</button>
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
                        <BrainCircuit size={16}/> Get Detailed AI Analysis
                    </button>
                )}
                <div><h5 className="font-semibold text-cyan-400 mb-1">Log Contexts ({item.contexts.length})</h5><pre className="bg-slate-900 text-slate-300 p-3 rounded-md text-xs whitespace-pre-wrap break-all max-h-48 overflow-y-auto">{item.contexts.map(c => `[${c.timestamp.toLocaleTimeString()}] ${c.sourceFile} line ${c.lineNumber}: ${c.line}`).join('\n')}</pre></div>
            </div>}
        </div>
    );
};


const ResultsView = ({ results, onAnalyze, filter, setFilter }) => {
    const filteredResults = useMemo(() => Object.values(results).filter(item => item.key.toLowerCase().includes(filter.toLowerCase())).sort((a,b) => b.contexts.length - a.contexts.length), [results, filter]);
    return (<div className="p-4"><div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20}/><input type="text" placeholder="Filter errors..." value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 pl-10 focus:ring-cyan-500"/></div><div className="space-y-4">{filteredResults.length > 0 ? filteredResults.map(item => <ResultCard key={item.key} item={item} onAnalyze={onAnalyze}/>) : <div className="text-center p-10 text-slate-400">No results match.</div>}</div></div>);
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
    const [logFiles, setLogFiles] = useState([]);
    const [results, setResults] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('');
    const [libsLoaded, setLibsLoaded] = useState({ jszip: false });

    useEffect(() => {
        const loadScript = (src, onLoad) => {
            const script = document.createElement('script');
            script.src = src; script.async = true; script.onload = onLoad;
            document.body.appendChild(script);
            return () => document.body.removeChild(script);
        };
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js', () => setLibsLoaded(p => ({...p, jszip: true})));
        
        const savedConfig = localStorage.getItem('log-analyzer-apiconfig');
        if (savedConfig) {
            setApiConfig(JSON.parse(savedConfig));
        }
    }, []);

    const allContexts = useMemo(() => Object.values(results).flatMap(error => error.contexts), [results]);

    const handleFileSelect = (files) => { setLogFiles(files); setResults({}); setError(''); };
    
    const handleAnalyze = async () => {
        if (logFiles.length === 0) { setError('Please upload one or more log files first.'); return; }
        if (!libsLoaded.jszip) { setError('Core library is still loading, please wait a moment.'); return; }
        setError(''); setIsLoading(true); setResults({});
        let allResultsMap = new Map();
        for (const file of logFiles) {
            let filesToProcess = [];
            if (file.name.endsWith('.zip')) {
                try {
                    const zip = await window.JSZip.loadAsync(file);
                    for (const fileName in zip.files) { if (!zip.files[fileName].dir) filesToProcess.push({ name: fileName, text: () => zip.files[fileName].async('string') }); }
                } catch (e) { setError(`Failed to read ZIP: ${e.message}`); setIsLoading(false); return; }
            } else { filesToProcess.push(file); }
            for (const f of filesToProcess) {
                try {
                    const parsed = parseLogFile(await f.text(), f.name, []);
                    for (const [key, value] of Object.entries(parsed)) {
                        if (allResultsMap.has(key)) allResultsMap.get(key).contexts.push(...value.contexts);
                        else allResultsMap.set(key, value);
                    }
                } catch (e) { setError(`Error processing ${f.name}: ${e.message}`); }
            }
        }
        setResults(Object.fromEntries(allResultsMap)); setIsLoading(false); setActiveTab('results');
        if (allResultsMap.size === 0) { setError("No potential errors found in the selected files."); setActiveTab('dashboard'); }
    };
    
    const handleAiAnalyze = useCallback(async (errorKey) => {
        const errorItem = results[errorKey];
        if (!errorItem || !apiConfig.apiKey) {
            setError("API Key not set.");
            return Promise.reject("API Key not set.");
        }
        
        setResults(prev => ({...prev, [errorKey]: {...prev[errorKey], isAnalyzing: true}}));
        
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
        
        let endpoint = apiConfig.customEndpoint;
        let body;
        let headers = { 'Content-Type': 'application/json' };

        if (apiConfig.provider === 'gemini') {
            if (!endpoint) {
                endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${apiConfig.model}:generateContent?key=${apiConfig.apiKey}`;
            }
            body = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] });
        } else { // openai
             if (!endpoint) {
                endpoint = 'https://api.openai.com/v1/chat/completions';
            }
            headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
            body = JSON.stringify({ 
                model: apiConfig.model,
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: "json_object" }
            });
        }

        try {
            const response = await fetch(endpoint, { method: 'POST', headers, body });
            if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
            
            const data = await response.json();
            let aiAnalysis;

            if (apiConfig.provider === 'gemini') {
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text) throw new Error("Invalid Gemini response structure.");
                const cleanJsonText = text.replace(/```json\n|```/g, '').trim();
                aiAnalysis = JSON.parse(cleanJsonText);
            } else { // openai
                const text = data?.choices?.[0]?.message?.content;
                if (!text) throw new Error("Invalid OpenAI response structure.");
                aiAnalysis = JSON.parse(text);
            }
            
            setResults(prev => ({...prev, [errorKey]: {...prev[errorKey], aiAnalysis, isAnalyzing: false}}));
            return Promise.resolve();
        } catch (err) { 
            const failAnalysis = { description: `Analysis failed: ${err.message}`, impact: "N/A", severity: "Unknown", solutions: [] };
            setResults(prev => ({...prev, [errorKey]: {...prev[errorKey], aiAnalysis: failAnalysis, isAnalyzing: false}})); 
            return Promise.reject(err.message);
        }
    }, [results, apiConfig]);

    const handleAnalyzeAll = async () => {
        if (!apiConfig.apiKey) { setError('Set API key before running batch analysis.'); return; }
        setIsBatchAnalyzing(true);
        setError('');

        const promises = Object.values(results)
            .filter(item => !item.aiAnalysis)
            .map(item => handleAiAnalyze(item.key));

        await Promise.allSettled(promises);
        setIsBatchAnalyzing(false);
    };


    const DashboardView = ({results, allContexts}) => {
        const [isExportOpen, setIsExportOpen] = useState(false);
        const timelineData = useMemo(() => {
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
                    ...{ time: time, critical: 0, high: 0, medium: 0, low: 0 },
                    ...(totalCountsByHour[time] || {}),
                    ...(severityCountsByHour[time] || {}),
                };
            });

            return Object.values(mergedData).sort((a,b)=> new Date(a.time) - new Date(b.time));

        }, [results, allContexts]);

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
                 return <div className="bg-slate-800 p-4 rounded-lg h-80 flex items-center justify-center text-slate-400">Not enough data to display timeline. Analyze logs and run AI analysis to see the chart.</div>
            }
            
            return (
                <div className="bg-slate-800 p-4 rounded-lg h-80">
                    <h4 className="font-bold mb-4">Error Timeline by Severity</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={timelineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                            <XAxis dataKey="time" tickFormatter={(t) => new Date(t).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} stroke="#94a3b8" tick={{fontSize: 12}}/>
                            <YAxis stroke="#94a3b8" allowDecimals={false} tick={{fontSize: 12}}/>
                            <Tooltip content={<CustomTooltip />}/>
                            <Legend wrapperStyle={{fontSize: "12px", paddingTop: "20px"}}/>
                            <Line dataKey="total" name="Total" stroke="#a78bfa" strokeWidth={2} dot={false}/>
                            <Scatter name="Critical" dataKey="critical" fill="#ef4444" />
                            <Scatter name="High" dataKey="high" fill="#f97316" />
                            <Scatter name="Medium" dataKey="medium" fill="#f59e0b" />
                            <Scatter name="Low" dataKey="low" fill="#22c55e" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            );
        }

        return (<div className="p-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <StatCard title="Unique Errors" value={Object.keys(results).length} icon={AlertCircle} />
                 <StatCard title="Total Occurrences" value={allContexts.length} icon={Search}/>
                 <StatCard title="Files Analyzed" value={logFiles.length} icon={FileText} />
                 <div className="relative bg-slate-800 p-4 rounded-lg flex items-center justify-center">
                    <button onClick={() => setIsExportOpen(!isExportOpen)} className="bg-cyan-600 font-semibold px-4 py-2 rounded-md hover:bg-cyan-700 flex items-center gap-2"><FileDown/>Export</button>
                    {isExportOpen && <div className="absolute top-full mt-2 right-0 bg-slate-700 rounded-md shadow-lg z-10 w-48">
                        <button onClick={() => { const ts = getFormattedTimestamp(); triggerDownload(generateHtmlReport(results), `report_${ts}.html`, 'text/html'); setIsExportOpen(false);}} className="w-full text-left px-4 py-2 hover:bg-slate-600">as HTML Report</button>
                        <button onClick={() => { const ts = getFormattedTimestamp(); triggerDownload(generateCsv(results), `report_${ts}.csv`, 'text/csv'); setIsExportOpen(false);}} className="w-full text-left px-4 py-2 hover:bg-slate-600">as CSV</button>
                        <button onClick={() => { const ts = getFormattedTimestamp(); triggerDownload(JSON.stringify(results, null, 2), `report_${ts}.json`, 'application/json'); setIsExportOpen(false);}} className="w-full text-left px-4 py-2 hover:bg-slate-600">as JSON</button>
                    </div>}
                 </div>
            </div>
            {renderChart()}
        </div>);
    };

    return (<div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col">
        <ApiConfigModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} apiConfig={apiConfig} setApiConfig={setApiConfig} />
        <Header />
        <div className="flex flex-grow" style={{height: 'calc(100vh - 72px)'}}>
            <aside className="w-80 bg-slate-800/50 p-4 flex flex-col gap-6 border-r border-slate-700">
                <div className="p-4 bg-slate-800 rounded-lg">
                    <h3 className="text-lg font-bold mb-4">Analysis Controls</h3>
                    <button onClick={() => setIsApiModalOpen(true)} className="w-full text-left mb-4 flex items-center gap-2 bg-slate-700 p-2 rounded-md hover:bg-slate-600">
                        <KeyRound className={apiConfig.apiKey ? 'text-green-400' : 'text-yellow-400'}/> 
                        <div>
                            <span className='block text-sm'>{apiConfig.apiKey ? 'API Key is Set' : 'Set API Key'}</span>
                            <span className='block text-xs text-slate-400 capitalize'>{apiConfig.provider}: {apiConfig.model}</span>
                        </div>
                    </button>
                    <FileUploader onFileSelect={handleFileSelect} disabled={isLoading || isBatchAnalyzing} fileNames={logFiles} />
                    <button onClick={handleAnalyze} disabled={isLoading || isBatchAnalyzing || logFiles.length === 0 || !libsLoaded.jszip} className="w-full bg-cyan-600 font-bold py-3 px-4 rounded-md disabled:bg-slate-600/50 disabled:cursor-not-allowed">
                        {isLoading ? 'Parsing Logs...' : (!libsLoaded.jszip ? 'Loading Libs...' : 'Run Analysis')}
                    </button>
                    <button 
                        onClick={handleAnalyzeAll} 
                        disabled={isLoading || isBatchAnalyzing || Object.keys(results).length === 0 || !apiConfig.apiKey} 
                        className="w-full mt-2 bg-purple-600 font-bold py-3 px-4 rounded-md disabled:bg-slate-600/50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors">
                        {isBatchAnalyzing ? <><BrainCircuit className="animate-spin" size={20}/>Analyzing All...</> : <><Zap size={20}/>Analyze All Errors</>}
                    </button>
                </div>
                <div className="flex flex-col gap-2">
                    <TabButton label="Dashboard" icon={LayoutDashboard} isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <TabButton label="Analysis Results" icon={FileText} isActive={activeTab === 'results'} onClick={() => setActiveTab('results')} />
                    <TabButton label="Data Explorer" icon={Database} isActive={activeTab === 'explorer'} onClick={() => setActiveTab('explorer')} />
                </div>
                 {error && <div className="mt-auto bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md text-sm flex items-center gap-2"><AlertCircle size={20}/> {error} <X size={20} className="ml-auto cursor-pointer" onClick={() => setError('')}/></div>}
            </aside>
            <main className="flex-grow bg-slate-900 overflow-y-auto">
                {activeTab === 'dashboard' && <DashboardView results={results} allContexts={allContexts} />}
                {activeTab === 'results' && <ResultsView results={results} onAnalyze={handleAiAnalyze} filter={filter} setFilter={setFilter} />}
                {activeTab === 'explorer' && <DataExplorerView allContexts={allContexts} />}
            </main>
        </div>
    </div>);
}
