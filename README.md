# AI-Powered Log Analyzer Ultimate

An advanced, browser-based log analysis tool that leverages Large Language Models (LLMs) like Google Gemini and OpenAI to automatically detect, classify, and provide actionable solutions for errors in log files. Designed for system administrators, developers, and IT support professionals to streamline troubleshooting and reduce diagnostic time.

**Author:** [Blindsinner](https://github.com/Blindsinner)

---

![Log Analyzer Screenshot](https://github.com/Blindsinner/AI-Powered-Log-Analyzer-Ultimate/blob/main/apphome.png)

---

## Live Demo

A live version of this project is hosted on GitHub Pages:

**Web Deployment:** [➡️ AI-Powered Log Analyzer Ultimate](https://blindsinner.github.io/AI-Powered-Log-Analyzer-Ultimate/)

---

## ⚠️ Important: Personal Use Only

This tool is designed and intended **strictly for personal, non-commercial use**.

- **Privacy First:** All file processing and analysis occur in your web browser on your local machine. Log files and API keys are **never** uploaded to any server.
- **No Business Use:** This application is not licensed for business, commercial, or enterprise purposes.

The goal is to provide a powerful, privacy-focused tool for individual developers and IT enthusiasts.

---

## 🚀 Purpose

The AI-Powered Log Analyzer Ultimate simplifies and accelerates the process of analyzing log files, which can be time-consuming in complex systems. It automates error detection, groups similar issues, and uses AI to deliver clear explanations, impact analysis, and step-by-step solutions. By running entirely in the browser, it ensures data privacy while transforming hours of diagnostic work into minutes.

---

## ✨ Features

- **Multi-File & ZIP Upload**:
  - Drag and drop multiple log files (e.g., `.log`, `.txt`) or a single `.zip` archive, which is decompressed in-browser using `JSZip`.
- **Input File Types**:
  - **Explicit Extensions**: 29
    - `.log`, `.txt`, `.text`, `.out`, `.zip`, `.gz`, `.tar`, `.iis`, `.access`, `.nginx`, `.apache`, `.evtx`, `.etl`, `.csv`, `.xml`, `.json`, `.ini`, `.inf`, `.syslog`, `.auth`, `.dmesg`, `.messages`, `.md`, `.config`, `.yml`, `.yaml`, `.sql`, `.py`, `.js`, `.java`, `.cpp`, `.cs`, `.cap`
    - **Comment**: The `.cap` extension is included for network capture files (e.g., Microsoft Network Monitor logs), supported by the `NETMON` parser.
  - **Parsing Formats**: 22
    - `AUTO`, `TEXTLINE`, `TEXTWORD`, `CSV`, `TSV`, `XML`, `W3C`, `IIS`, `NCSA`, `IISW3C`, `IISODBC`, `IISMSID`, `HTTPERR`, `URLSCAN`, `BIN`, `EVT`, `ETW`, `NETMON`, `REG`, `ADS`, `FS`, `COM`
    - **Note**: 10 parsers (`IISODBC`, `IISMSID`, `URLSCAN`, `BIN`, `EVT`, `ETW`, `NETMON`, `ADS`, `FS`, `COM`) are placeholders and unimplemented. These fall back to `TEXTLINE` parsing, treating files as plain text.
    - **Comment on Unimplemented Parsers**: These parsers are unimplemented due to the complexity of their formats, often involving binary or specialized structures (e.g., `.evtx` for Windows Event Logs, `.etl` for ETW traces, `.cap` for network captures). Proper parsing requires external libraries (e.g., `libevtx`, `TraceEvent`) or custom logic, which is not currently included. This may lead to data loss or misinterpretation for binary formats.
  - **Notes**:
    - `.zip` files are extracted using `JSZip`, with contents parsed based on their extensions.
    - `.gz` and `.tar` are listed as supported but lack extraction logic, limiting their usability.
    - Binary formats (`.evtx`, `.etl`, `.cap`) are read as text, which may not capture structured data accurately.
- **Export Formats**:
  - **Total**: 6
    - `HTML`, `CSV`, `TSV`, `XML`, `DATAGRID`, `CHART`
  - **File Extensions**:
    - `.html` (for `HTML`)
    - `.csv` (for `CSV`, `DATAGRID`, `CHART`)
    - `.tsv` (for `TSV`)
    - `.xml` (for `XML`)
  - **Notes**:
    - `CSV` serves multiple purposes:
      - `CSV`: Summarizes error keys, types, counts, and AI analysis.
      - `DATAGRID`: Exports detailed log entries for each error.
      - `CHART`: Provides timeline data for error occurrences by severity.
    - All export formats are fully implemented with timestamped filenames.
- **Intelligent Error Parsing**:
  - Scans logs for keywords (e.g., `error`, `failed`, `timeout`) and patterns (e.g., hex codes, HRESULTs, HTTP status codes) using prioritized regex-based matching.
  - Groups errors by key with context (line, timestamp, source file, line number).
- **Advanced AI Analysis**:
  - Supports multiple providers: Google Gemini, OpenAI, or custom (e.g., local Ollama).
  - Model selection (e.g., `gemini-2.0-flash`, `gpt-4o`) for flexibility.
  - Custom endpoint support for private or self-hosted LLMs.
  - Generates the following for each error:
    - **Description**: Detailed explanation of the error's root cause.
    - **Impact**: Likely impact on the system or application.
    - **Severity**: Classified as Critical, High, Medium, or Low.
    - **Solutions**: Actionable, step-by-step recommendations.
- **Rich Visualization Dashboard**:
  - Displays stats: unique errors, total occurrences, and files analyzed.
  - Interactive timeline chart (via `Recharts`) showing error counts over time, with severity-colored scatter points.
  - Tooltips provide detailed severity breakdowns.
- **Detailed Results View**:
  - Groups errors by key, sorted by frequency.
  - Expandable cards show AI-generated analysis and log contexts.
  - Filterable via a search bar for quick error lookup.
- **Data Explorer**:
  - Experimental SQL-like query interface (e.g., `SELECT * FROM logs WHERE message contains 'denied'`) for custom log searches.
- **Secure & Private**:
  - All processing occurs in-browser; no data is sent to servers.
  - API keys are stored in `localStorage` for convenience, never transmitted.
- **Export Capabilities**:
  - Generate reports in `HTML`, `CSV`, `TSV`, `XML`, `DATAGRID`, or `CHART` formats, with automatic timestamped filenames.

---

## ⚙️ How It Works

This is a single-page application (SPA) built with:

- **React**: For a fast, interactive UI.
- **Tailwind CSS**: For responsive, professional styling.
- **Lucide Icons**: For clean, modern icons.
- **Recharts**: For interactive timeline charts.
- **JSZip**: For in-browser ZIP decompression.

All logic runs client-side, ensuring data privacy.

### 🔍 How Errors Are Detected

The error detection process involves file parsing and analysis, primarily through the `analyzeLogEntries` function:

1. **File Parsing**:
   - Users upload files via the `FileUploader` component, selecting a format (`AUTO`, `CSV`, `XML`, etc.) from a dropdown.
   - The `handleAnalyze` function processes files:
     - **ZIP Files**: Extracted using `JSZip`, with each file parsed based on its extension.
     - **Other Files**: Read as text using `File.text()`.
   - Parsers (e.g., `parseTextLine`, `parseCsv`, `parseHttpErr`, `parseReg`) convert content into log entries with:
     - `timestamp`: Parsed via `parseTimestamp` or defaulting to the current date.
     - `message`: Log line or extracted content (e.g., CSV column, HTTPERR reason).
     - `lineNumber`: Line number in the file.
     - `sourceFile`: File name.
   - Unimplemented parsers (`IISODBC`, `IISMSID`, `URLSCAN`, `BIN`, `EVT`, `ETW`, `NETMON`, `ADS`, `FS`, `COM`) fall back to `TEXTLINE`, treating files as plain text.

2. **Error Detection with `analyzeLogEntries`**:
   - Scans each log entry’s `message` using a prioritized list of patterns:
     - **High-Priority Patterns**: Java/.NET exceptions, Oracle DB errors, hex codes, HRESULTs, HTTP status codes (400s, 500s), kernel errors.
     - **Low-Priority Keywords**: `fatal`, `critical`, `error`, `exception`, `failed`, `denied`, `refused`, `timeout`, `unhandled`.
   - Matches the highest-priority pattern first, using the captured string as the error key (e.g., `ORA-00942`, `error`).
   - Groups errors in a `Map` by key, storing:
     - `key`: Error identifier.
     - `type`: Pattern name (e.g., `Java Exception`, `Keyword: error`).
     - `category`: Error category (e.g., `Application Exception`, `General Error`).
     - `contexts`: Array of occurrences (`line`, `lineNumber`, `timestamp`, `sourceFile`).
     - `aiAnalysis`: AI-generated details (added later).
     - `isAnalyzing`: Tracks AI analysis status.
   - Non-matching entries are skipped.

3. **Integration and Display**:
   - Results are stored in the `results` state and displayed in `ResultsView` as expandable cards with error details and AI analysis.
   - `DashboardView` shows stats and a timeline chart, plotting errors by severity over time.
   - `handleAiAnalyze` and `handleAnalyzeAll` fetch AI analysis from configured providers (Gemini, OpenAI, or custom), adding descriptions, impacts, severities, and solutions.
   - `DataExplorerView` supports SQL-like queries for custom filtering.
   - Exports are generated in multiple formats, including detailed `DATAGRID` (all log entries) and `CHART` (timeline data).

4. **Limitations**:
   - Unimplemented parsers may misinterpret binary files (e.g., `.evtx`, `.etl`, `.cap`), leading to data loss.
   - Error detection relies on predefined patterns and keywords, potentially missing custom or context-specific errors.
   - Timestamp parsing may fail for unrecognized formats, defaulting to the current date.
   - `.gz` and `.tar` files are not properly extracted due to missing decompression logic.

---

## 🛠️ Setup & Usage

### 1. Web Deployment (GitHub Pages)

Access the app without local setup:

1. Visit: [https://blindsinner.github.io/AI-Powered-Log-Analyzer-Ultimate/](https://blindsinner.github.io/AI-Powered-Log-Analyzer-Ultimate/)
2. Configure your API key in **Settings** (required for AI analysis).
3. Drag and drop log files or `.zip` archives to start analysis.

*No installation required; runs in-browser.*

### 2. Local Desktop Setup

To run locally (e.g., offline or in a secure network):

#### Prerequisites

- **Node.js (LTS)**: Install from [https://nodejs.org/](https://nodejs.org/)
- **(Optional) Code Editor**: Visual Studio Code recommended.

#### Installation & Running

```bash
# Clone the repository
git clone https://github.com/Blindsinner/AI-Powered-Log-Analyzer-Ultimate.git
cd AI-Powered-Log-Analyzer-Ultimate

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`.

*To build for production:*

```bash
npm run build
```

Serve the `build/` directory using a static file server (e.g., `serve`, Nginx).

### 3. Custom Server Deployment

To host on your own server or domain:

1. **Update `package.json`**:
   Set the `homepage` field to your domain or subdirectory:

   ```json
   {
     "homepage": "https://example.com/log-analyzer/"
   }
   ```

2. **Rebuild**:

   ```bash
   npm run build
   ```

3. **Deploy**:
   Copy the `build/` folder to your server’s public directory (e.g., `/var/www/html/log-analyzer/`).

4. **Configure Routing**:
   Ensure all requests redirect to `index.html` for client-side routing. For Nginx:

   ```nginx
   location /log-analyzer/ {
     try_files $uri $uri/ /log-analyzer/index.html;
   }
   ```

> **Note**: The repository is preconfigured for GitHub Pages (`homepage` set to `https://blindsinner.github.io/AI-Powered-Log-Analyzer-Ultimate`). Update or remove this field for custom deployments.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. **Fork** the repository.
2. **Create a branch**: `git checkout -b feature/my-feature`
3. **Implement changes**.
4. **Commit**: `git commit -m "Add my feature"`
5. **Push**: `git push origin feature/my-feature`
6. **Open a Pull Request** with a clear description.

Report bugs or request features via the [Issues tab](https://github.com/Blindsinner/AI-Powered-Log-Analyzer-Ultimate/issues).

---

## 📜 License

Licensed under the **GNU Affero General Public License v3.0**.

If you modify this code and provide it over a network, you must release your modifications under the same license.
