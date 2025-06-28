# AI-Powered Log Analyzer Ultimate

An advanced, browser-based log analysis tool that uses the power of Large Language Models (LLMs) like Google Gemini and OpenAI to automatically detect, classify, and provide solutions for errors found in log files. Created for system administrators, developers, and IT support professionals to dramatically speed up troubleshooting.

**Author:** [Blindsinner](https://github.com/Blindsinner)

---

![Log Analyzer Screenshot](https://github.com/Blindsinner/AI-Powered-Log-Analyzer-Ultimate/blob/main/apphome.png)

---

## A live version of this project is hosted on GitHub Pages:

## **Web Deployment:** [➡️AI-Powered-Log-Analyzer-Ultimate](https://blindsinner.github.io/AI-Powered-Log-Analyzer-Ultimate/)

---

## ⚠️ Important: Personal Use Only

This tool is designed and intended **strictly for personal, non-commercial use**.

* **Privacy First:** All file processing and analysis happen directly in your web browser on your local machine. Your log files and API keys are **never** uploaded to any server.
* **No Business Use:** This application is not licensed for and should not be used for any business, commercial, or enterprise purposes.

The primary goal is to provide a powerful, private tool for individual developers and IT enthusiasts.

---

## 🚀 Purpose

The primary goal of this tool is to simplify and accelerate the often tedious process of sifting through log files. In complex systems, identifying the root cause of an issue can mean searching through thousands of lines across multiple files. This application automates that discovery process. It intelligently parses logs, groups similar errors together, and leverages modern AI to provide clear explanations, impact analysis, and actionable solutions. It effectively turns hours of diagnostic work into minutes, all while maintaining the strict privacy of a local-first application.

---

## ✨ Features

* **Multi-File & ZIP Upload:** Drag and drop multiple log files (`.log`, `.txt`, etc.) or a single `.zip` archive, which the tool will decompress and process in-browser.
* **Input File Types**
  - **Explicit Extensions**: 29
    - `.log`, `.txt`, `.text`, `.out`, `.zip`, `.gz`, `.tar`, `.iis`, `.access`, `.nginx`, `.apache`, `.evtx`, `.etl`, `.csv`, `.xml`, `.json`, `.ini`, `.inf`, `.syslog`, `.auth`, `.dmesg`, `.messages`, `.md`, `.config`, `.yml`, `.yaml`, `.sql`, `.py`, `.js`, `.java`, `.cpp`, `.cs`, `.cap`
    - **Comment**: Added `.cap` to the list of explicit extensions, as it is implied by the `NETMON` parser, which is intended for network capture files (e.g., Microsoft Network Monitor logs). The total count is updated to 29 to reflect this addition.
  - **Parsing Formats**: 22
    - `AUTO`, `TEXTLINE`, `TEXTWORD`, `CSV`, `TSV`, `XML`, `W3C`, `IIS`, `NCSA`, `IISW3C`, `IISODBC`, `IISMSID`, `HTTPERR`, `URLSCAN`, `BIN`, `EVT`, `ETW`, `NETMON`, `REG`, `ADS`, `FS`, `COM`
    - **Note**: 10 parsers (`IISODBC`, `IISMSID`, `URLSCAN`, `BIN`, `EVT`, `ETW`, `NETMON`, `ADS`, `FS`, `COM`) are unimplemented placeholders.
    - **Comment on Unimplemented Parsers**: These 10 parsers remain unimplemented due to the complexity of their formats, which often involve specialized or binary structures (e.g., `.evtx` for Windows Event Logs, `.etl` for ETW traces). Proper parsing would require external libraries (e.g., `libevtx` for `.evtx`, `TraceEvent` for `.etl`) or custom decoding logic, which is not currently included. The application falls back to `TEXTLINE` parsing, treating these files as plain text, which may not capture their structured data accurately. Implementing these parsers is likely deferred due to development priorities or resource constraints.
  - **Total Unique Extensions**: Approximately 29, including explicitly listed extensions and `.cap` implied by the `NETMON` parser.
  - **Notes**:
    - `.zip` files are extracted using JSZip, with contents parsed based on their extensions.
    - Binary formats like `.evtx`, `.etl`, and `.cap` are read as text due to unimplemented parsers, potentially leading to data loss or misinterpretation.
    - `.gz` and `.tar` are listed as supported but lack extraction logic, making their support incomplete.
* **Export Formats**
  - **Total**: 6
    - `HTML`, `CSV`, `TSV`, `XML`, `DATAGRID`, `CHART`
  - **File Extensions**:
    - `.html` (for `HTML`)
    - `.csv` (for `CSV`, `DATAGRID`, and `CHART`)
    - `.tsv` (for `TSV`)
    - `.xml` (for `XML`)
  - **Notes**:
    - `CSV` serves multiple export types:
      - `CSV`: Summarizes error keys, types, counts, and AI analysis.
      - `DATAGRID`: Exports detailed log entries for each error.
      - `CHART`: Provides timeline data for error occurrences by severity.
    - All export formats are fully implemented, generating downloadable files with appropriate content types.
* **Intelligent Error Parsing:** Automatically scans files for a wide range of common error keywords, status codes (like HRESULTs), and failure patterns.
* **Advanced AI Analysis:**
  - **Multi-Provider Support:** Seamlessly switch between Google Gemini and OpenAI, allowing you to use your preferred or most accessible models.
  - **Model Selection:** Choose from popular models like `gemini-2.0-flash`, `gemini-2.5-pro`, `gpt-4o`, etc., to balance speed, cost, and analytical depth.
  - **Custom Endpoint:** Configure a custom API endpoint URL for users running models through a proxy server or using a private, self-hosted LLM instance.
* **Rich Visualization Dashboard:**
  - **At-a-Glance Stats:** Key metrics on unique errors, total occurrences, and files analyzed provide an instant overview of your log data's health.
  - **Interactive Timeline:** A professional chart plots total errors over time, with severity-colored dots (Critical, High, Medium, Low) for instant visual correlation.
  - **Detailed Tooltips:** Hover over the chart to see a full breakdown of error severities at any point in time, helping you understand the error composition at a glance.
* **Detailed Results View:**
  - Errors are intelligently grouped and sorted by frequency, bringing the most common issues to the top.
  - Expand each error group to view detailed, AI-generated descriptions, potential impact analysis, severity ratings, and step-by-step recommended solutions.
  - Includes the original log line context for every error occurrence, allowing you to trace the issue back to its source.
* **Data Explorer:** An experimental SQL-like query interface (`SELECT...WHERE...`) to perform custom, targeted searches on your log data for advanced investigation.
* **Comprehensive Exporting:** Export your full analysis report in beautifully formatted **HTML**, data-rich **CSV**, or machine-readable **JSON** formats. Filenames are automatically timestamped for easy tracking.
* **Secure & Private:** All file processing and API calls happen directly in your browser. Your data and API keys are never transmitted to or stored on any server. API keys are saved securely in your browser's local storage for your convenience only.

---

## ⚙️ How It Works

This application is a modern single-page application (SPA) built with:

* **React:** For building a fast and interactive user interface.
* **Tailwind CSS:** For professional and responsive styling.
* **Lucide Icons:** For clean and modern iconography.
* **Recharts:** For creating the rich, interactive timeline chart.
* **JSZip:** For handling ZIP file decompression entirely within the browser.

All logic runs on the client-side (your browser), ensuring that your sensitive log data remains private.

### 🔍 How Errors Are Detected

The application identifies errors in log files through a structured process involving file parsing and error detection, primarily handled by the `analyzeLogEntries` function. Here's how it works:

1. **File Parsing**:
   - Users upload log files via the `FileUploader` component, which supports multiple files (e.g., `.log`, `.txt`, `.zip`) and formats selected via a dropdown (`AUTO`, `CSV`, `XML`, etc.).
   - The `handleAnalyze` function processes each file:
     - **ZIP Files**: Extracted using `JSZip`, with each contained file processed individually.
     - **Other Files**: Read as text using the `File.text()` API.
   - A parser (e.g., `parseTextLine`, `parseCsv`, `parseHttpErr`) converts file content into log entries, each with:
     - `timestamp`: A `Date` object (parsed using `parseTimestamp` or defaulting to the current date).
     - `message`: The log line or extracted content (e.g., CSV column, HTTPERR reason).
     - `lineNumber`: The line number in the file.
     - `sourceFile`: The file name.
   - Unimplemented parsers (e.g., `IISODBC`, `EVT`, `ETW`) fall back to `parseTextLine`, treating files as plain text.

2. **Error Detection with `analyzeLogEntries`**:
   - The function scans each log entry's `message` for errors using:
     - **Keywords**: A predefined list (`error`, `failed`, `denied`, `timeout`, `exception`, `critical`, `fatal`, `unhandled`, `refused`, `access denied`, `connection_dropped`) matched via a case-insensitive regex.
     - **Patterns**: Regular expressions for:
       - Hex error codes (e.g., `0x80070005`).
       - HRESULT codes (e.g., `HRESULT: 0x80070005`).
       - Numeric error codes (e.g., `Error Code: 500`).
       - Failure keywords (e.g., `fail`, `failure`).
   - For each entry:
     - If a pattern matches, the matched string (e.g., `0x80070005`) becomes the error key, with a type like `Hex Error Code`.
     - If no pattern matches, it checks for keywords, using the matched keyword (e.g., `error`) as the key with type `Keyword Match`.
     - Non-matching entries are skipped.
   - Errors are grouped in a `Map` by key, with each entry containing:
     - `key`: The error identifier (e.g., `error`, `0x80070005`).
     - `type`: The match type (e.g., `Keyword Match`, `Hex Error Code`).
     - `contexts`: An array of occurrences with `line`, `lineNumber`, `timestamp`, and `sourceFile`.
     - `aiAnalysis`: AI-generated details (added later).
     - `isAnalyzing`: Tracks AI analysis status.

3. **Integration and Display**:
   - Results are stored in the `results` state and displayed in the `ResultsView` as expandable cards, showing error keys, types, counts, and contexts.
   - The `DashboardView` shows stats (unique errors, total occurrences) and a timeline chart using `Recharts`, plotting errors by severity over time.
   - Users can trigger AI analysis (`handleAiAnalyze` or `handleAnalyzeAll`) to enrich errors with descriptions, impacts, severities, and solutions via an external API (e.g., Gemini, OpenAI).
   - The `DataExplorerView` allows custom queries (e.g., `SELECT * FROM logs WHERE message contains 'denied'`) to filter log entries.
   - Results can be exported in formats like `HTML`, `CSV`, `TSV`, `XML`, `DATAGRID`, and `CHART`, including error details and AI analysis.

4. **Limitations**:
   - Unimplemented parsers may misinterpret binary files (e.g., `.evtx`, `.etl`).
   - Error detection is limited to predefined keywords and patterns, potentially missing custom errors.
   - Timestamp parsing may default to the current date if formats are unrecognized.

---

## 🛠️ Setup & Usage

The repository has been modified for GitHub Pages deployment. Below are two scenarios:

### 1. Web Deployment (GitHub Pages)

For quick access without cloning the repo:

1. Navigate to: `https://blindsinner.github.io/AI-Powered-Log-Analyzer-Ultimate/`
2. Open **Settings** within the app and configure your API key.
3. Drag-and-drop log files or `.zip` archives to start analysis.

*No local installation required; runs entirely in your browser.*

### 2. Local Desktop Setup

To run the app on your machine (e.g., offline or within a secure network), follow these steps:

#### Prerequisites

1. **Node.js (LTS):** Download and install from [https://nodejs.org/](https://nodejs.org/)
2. **(Optional) Code Editor:** Visual Studio Code recommended.

#### Installation & Running

```bash
# Clone this repository
git clone https://github.com/Blindsinner/AI-Powered-Log-Analyzer-Ultimate.git
cd AI-Powered-Log-Analyzer-Ultimate

# Install dependencies
npm install

# Start development server
npm start
```

The app will open in your browser at `http://localhost:3000`.

*To build a production bundle for custom hosting:*

```bash
npm run build
```

You can then serve the contents of the `build/` directory using any static file server (e.g., `serve`, Nginx).

### 3. Custom Server Deployment

To host on your own web server or custom domain, you’ll need to adjust a few settings:

1. **Update the `homepage` field** in your `package.json` to point to your domain or subdirectory. For example:

   ```json
   {
     // …
     "homepage": "https://example.com/log-analyzer/"
     // …
   }
   ```
2. **Rebuild** the app:

   ```bash
   npm run build
   ```
3. **Deploy** the contents of the `build/` folder to your server’s public directory. For example, copy them to `/var/www/html/log-analyzer/` or your hosting provider’s designated folder.
4. **Configure routing** (if using client-side navigation): ensure your server redirects all requests to `index.html`. For Nginx, you might add:

   ```nginx
   location /log-analyzer/ {
     try_files $uri $uri/ /log-analyzer/index.html;
   }
   ```

> **Note:** This repository is preconfigured for GitHub Pages (the `homepage` field points to `https://blindsinner.github.io/AI-Powered-Log-Analyzer-Ultimate`). If deploying elsewhere, update or remove the `homepage` setting accordingly.

---

## 🤝 Contributing

Contributions are welcome and greatly appreciated! Follow these steps:

1. **Fork** the repository.
2. **Create a branch:** `git checkout -b feature/my-feature`
3. **Implement your changes.**
4. **Commit:** `git commit -m "Add my feature"`
5. **Push:** `git push origin feature/my-feature`
6. **Open a Pull Request** with a clear description.

For bug reports or feature requests, please visit the [Issues tab](https://github.com/Blindsinner/AI-Powered-Log-Analyzer-Ultimate/issues).

---

## 📜 License

This project is licensed under the **GNU Affero General Public License v3.0**.

If you modify this code and provide it over a network, you must release your modifications under the same license.
```
