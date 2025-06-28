# AI-Powered Log Analyzer Ultimate

An advanced, browser-based log analysis tool that leverages Large Language Models (LLMs) such as Google Gemini, OpenAI, and custom local models to automatically detect, classify, and provide actionable solutions for errors in log files. Designed for system administrators, developers, and IT support professionals to streamline troubleshooting and reduce diagnostic time.

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

-   **Privacy First**: All file processing and analysis occur in your web browser on your local machine. Log files and API keys are **never** uploaded to any server.
-   **No Business Use**: This application is not licensed for business, commercial, or enterprise purposes.

The goal is to provide a powerful, privacy-focused tool for individual developers, IT enthusiasts, and hobbyists.

---

## 🚀 Purpose

The **AI-Powered Log Analyzer Ultimate** simplifies and accelerates the process of analyzing log files. In complex systems, manual log analysis can be incredibly time-consuming. This tool automates error detection, groups similar issues, and uses AI to deliver clear explanations, impact analyses, and step-by-step solutions. By running entirely in the browser, it ensures your data remains private while transforming hours of diagnostic work into minutes.

---

## 📋 Table of Contents
- [Features](#features)
- [How It Works](#how-it-works)
- [User Manual: A Step-by-Step Guide](#user-manual)
  - [Step 1: Access the Application](#step-1-access)
  - [Step 2: Configure an AI Provider](#step-2-ai-config)
  - [Step 3: Upload and Analyze Logs](#step-3-upload)
  - [Step 4: Review the Results](#step-4-review)
  - [Step 5: Export Your Findings](#step-5-export)
- [Supported Formats](#supported-formats)
- [Troubleshooting & Limitations](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

<a id="features"></a>
## ✨ Features

-   **Multi-File & ZIP Upload**: Drag and drop multiple log files (e.g., `.log`, `.txt`) or a single `.zip` archive, which is decompressed in-browser.
-   **Intelligent Error Parsing**: Scans logs for keywords (e.g., `error`, `failed`), error codes (e.g., `0x80070005`, `ORA-00942`), and patterns (HTTP status codes, Java exceptions) using prioritized regex matching.
-   **Advanced AI Analysis**:
    -   Supports multiple providers: **Google Gemini**, **OpenAI**, and **Custom/Local LLMs** (e.g., Ollama).
    -   Generates a detailed **Description**, potential **Impact**, a **Severity** level (Critical, High, Medium, Low), and actionable **Solutions** for each error group.
    -   Includes a "Analyze All" feature for batch processing.
-   **Rich Visualization Dashboard**:
    -   Displays key stats: unique errors, total occurrences, and files analyzed.
    -   Features an interactive timeline chart (via `Recharts`) to visualize error frequency and severity over time.
-   **Detailed & Filterable Results**:
    -   Groups errors by key, sorted by frequency.
    -   Presents results in expandable cards showing AI analysis and the original log contexts.
    -   Includes a search bar for quickly filtering results.
-   **Data Explorer**: An experimental SQL-like query interface (e.g., `SELECT * FROM logs WHERE message contains 'denied'`) for custom log searches.
-   **Secure & Private**: All processing is client-side. No data ever leaves your browser. API keys are stored in `localStorage` and are not transmitted to any server.
-   **Versatile Exporting**: Generate and download reports in `HTML`, `CSV`, `TSV`, `XML`, `DATAGRID` (detailed log entries), or `CHART` (timeline data) formats.
-   **Responsive Design**: A clean, mobile-friendly interface built with Tailwind CSS that works on any device.

---

<a id="how-it-works"></a>
## ⚙️ How It Works

This is a single-page application (SPA) built with **React**, **Tailwind CSS**, and **Recharts**. All logic runs client-side in your browser.

1.  **File Handling**: When you upload files, they are read directly into the browser's memory. `.zip` archives are decompressed on-the-fly using `JSZip`.
2.  **Parsing**: Based on the selected format (`AUTO` is recommended), a specific parser processes the file content. For example, `.csv` files are parsed for columns like `timestamp` and `message`, while `.log` files are typically read line-by-line (`TEXTLINE`).
3.  **Error Detection**: The `analyzeLogEntries` function scans each log entry against a prioritized list of regular expressions. It looks for high-priority patterns like Java exceptions (`java.lang.NullPointerException`), database errors (`ORA-00942`), and hex codes (`0x...`) first, followed by lower-priority keywords like `error`, `failed`, or `timeout`.
4.  **Grouping**: The first pattern that matches determines the error "key." All log entries matching that key are grouped together, along with their context (timestamp, file name, line number).
5.  **AI Augmentation**: When you request AI analysis, the tool sends the error key and a sample log line to your chosen LLM provider (Gemini, OpenAI, or a local model). The response, containing the description, impact, severity, and solution, is then displayed.

---

<a id="user-manual"></a>
## 🛠️ User Manual: A Step-by-Step Guide

<a id="step-1-access"></a>
### Step 1: Access the Application

You have three options for using the tool. The easiest is the web deployment.

| Method                | Best For                                           | Instructions                                                                                                                                                             |
| --------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **🌐 Web Deployment** | Quick access, no setup required.                   | Visit: **[https://blindsinner.github.io/AI-Powered-Log-Analyzer-Ultimate/](https://blindsinner.github.io/AI-Powered-Log-Analyzer-Ultimate/)** |
| **💻 Local Desktop** | Offline use, sensitive data, development.          | 1. Install [Node.js](https://nodejs.org/).<br>2. `git clone https://github.com/Blindsinner/AI-Powered-Log-Analyzer-Ultimate.git`<br>3. `cd AI-Powered-Log-Analyzer-Ultimate`<br>4. `npm install`<br>5. `npm start` (opens at `http://localhost:3000`) |
| **🚀 Custom Server** | Hosting for a team or on a private domain.       | 1. Follow local setup to `build` the app (`npm run build`).<br>2. Update the `homepage` field in `package.json` to your URL.<br>3. Deploy the `build/` folder to your web server and configure routing to direct all traffic to `index.html`. |

<a id="step-2-ai-config"></a>
### Step 2: Configure an AI Provider

AI analysis is optional but highly recommended. To enable it, you need to configure an API key.

1.  In the sidebar, click the **Key icon (🔑)** to open the **Advanced API Configuration** modal.
2.  Choose your provider and enter your credentials. Your settings are saved securely in your browser's `localStorage`.

| Provider                 | Model Examples                     | Endpoint (if Custom)                                | API Key                                        | Best For                                                                  |
| ------------------------ | ---------------------------------- | --------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------- |
| **Google Gemini** | `gemini-1.5-flash`, `gemini-1.5-pro` | (default)                                           | [Get from Google Cloud Console](https://console.cloud.google.com/) | Fast, with a generous free tier for personal use.                         |
| **OpenAI** | `gpt-4o`, `gpt-3.5-turbo`            | (default)                                           | [Get from OpenAI Platform](https://platform.openai.com/) | High-quality analysis, pay-as-you-go.                                     |
| **Custom (e.g., Ollama)** | `llama3`, `mistral`                  | `http://127.0.0.1:11434/v1/chat/completions`      | (usually blank)                                | **Maximum Privacy**. Runs completely offline. Requires [Ollama](https://ollama.com/) setup. |

**To set up a local LLM with Ollama (Recommended for Privacy):**
1.  Download and install [Ollama](https://ollama.com/) for your OS.
2.  Open your terminal and pull a model: `ollama pull llama3`.
3.  In the app's API settings, select `Custom`, enter the model name (`llama3`), and the endpoint: `http://127.0.0.1:11434/v1/chat/completions`. Leave the API Key blank.

<a id="step-3-upload"></a>
### Step 3: Upload and Analyze Logs

1.  **Select Input Format**: In the sidebar, choose an input format. **`AUTO` is recommended** as it correctly selects a parser based on file extensions.
2.  **Upload Files**: Drag and drop your log files or a single `.zip` archive onto the upload area in the sidebar.
3.  **Run Analysis**: Click the **Run Analysis** button. The tool will parse the files, detect errors, and group them.

<a id="step-4-review"></a>
### Step 4: Review the Results

-   **Dashboard View (📊)**: Get a high-level overview. See stats like *Unique Errors* and *Total Occurrences*. The timeline chart visualizes error trends by severity (requires AI analysis to be run).
-   **Analysis Results View (📄)**: This is the main view for troubleshooting.
    -   Errors are grouped into expandable cards, sorted by frequency.
    -   Click a card to see the full AI analysis (Description, Impact, Severity, Solutions).
    -   To get AI insights, click **Get Detailed AI Analysis** on a single card or **Analyze All Errors** (⚡ icon) in the sidebar for batch processing.
    -   You can also review the exact log lines (`contexts`) that triggered the error.
-   **Data Explorer View (🗄️)**: Perform custom searches on your log data using simple queries like `SELECT * FROM logs WHERE message contains 'denied'`.

<a id="step-5-export"></a>
### Step 5: Export Your Findings

1.  Navigate to the **Dashboard** view.
2.  Click the **Export (📥)** button.
3.  Select your desired format:
    -   **HTML**: A self-contained, shareable report.
    -   **CSV/TSV/XML**: Structured data for spreadsheets or other tools.
    -   **DATAGRID**: A detailed CSV of every single log entry associated with an error.
    -   **CHART**: The data powering the timeline chart, perfect for external analysis.

---

<a id="supported-formats"></a>
### 🗂️ Unparalleled Format Support

One of the standout features of the AI-Powered Log Analyzer Ultimate is its exceptionally broad support for a wide array of file formats. Unlike many specialized tools that lock you into specific log types, this analyzer is designed to be a universal workbench for virtually any text-based data you throw at it.

#### Input File Extensions (29 Total)
The tool recognizes a vast range of file extensions, categorized below for clarity:

-   **General & Text-Based**: `.log`, `.txt`, `.text`, `.out`, `.md`
-   **Structured Data**: `.csv`, `.xml`, `.json`, `.yml`, `.yaml`
-   **Web Server Logs**: `.iis`, `.access`, `.nginx`, `.apache`
-   **System & OS Logs**: `.syslog`, `.auth`, `.dmesg`, `.messages`, `.evtx`, `.etl`
-   **Configuration Files**: `.ini`, `.inf`, `.config`
-   **Source Code (for debugging)**: `.sql`, `.py`, `.js`, `.java`, `.cpp`, `.cs`
-   **Archive Formats**: `.zip` (fully supported), `.gz`, `.tar` (read as text)
-   **Specialized Formats**: `.cap` (for network captures, parser pending)

**Note on Binary/Archive Files**: True `.zip` extraction is fully implemented. However, binary formats like `.evtx`, `.etl`, and `.cap`, along with compressed `.gz` and `.tar` files, are currently read as plain text. For best results with these types, we recommend converting them to a text-based format (like CSV or TXT) before analysis.

#### Parsing Formats (22 Total)
Beyond just recognizing file types, the analyzer provides a suite of parsers to correctly interpret their content.

-   **`AUTO` (Default & Recommended)**: Intelligently selects the best parser based on the file's extension and content, doing the heavy lifting for you.
-   **Common Parsers**: Includes `TEXTLINE` (for generic line-by-line logs), `CSV`, `TSV`, `XML`, and `JSON`.
-   **Web Server Parsers**: `W3C`, `IIS`, `NCSA`, `IISW3C`, and `HTTPERR` for standardized web log formats.
-   **Specialized Parsers**: `REG` for Windows Registry files.
-   **Note on Unimplemented Parsers**: To ensure maximum compatibility, 10 advanced parsers (including `EVT`, `ETW`, `NETMON`) are listed as placeholders. If selected, they gracefully fall back to the robust `TEXTLINE` parser, ensuring that no file is rejected.

This comprehensive support ensures that no matter where your logs come from—a web server, a database, a custom application, or a system daemon—this tool can handle it, making it one of the most versatile log analyzers available.

---

<a id="troubleshooting"></a>
### ⚠️ Troubleshooting & Limitations

#### Common Issues
-   **"No potential errors found"**: Your log files may not contain keywords or patterns the analyzer recognizes. Verify the files contain terms like `error`, `exception`, `failed`, or known error codes.
-   **AI Analysis Fails**:
    1.  Check that your API Key and Endpoint are correct in the settings.
    2.  Ensure your local Ollama server is running if you're using a custom provider.
    3.  You may have hit the rate limits of your API provider's free tier.
-   **Timeline Chart is Empty**: The chart requires **severity** data. Run AI analysis on your errors to populate it. Also, ensure your logs have recognizable timestamps.
-   **Browser is Slow or Unresponsive**: Analyzing very large files (>500MB) can consume significant memory. Try splitting large files or using a machine with more RAM.

#### Current Limitations
-   **Parser Implementation**: Several specialized parsers (`.evtx`, `.etl`, `.netmon`) are not yet implemented and treat files as plain text. This is ineffective for binary formats.
-   **Archive Support**: Only `.zip` archives are decompressed. `.gz` and `.tar` are not.
-   **Error Detection**: The detection logic is based on a predefined set of patterns. It may miss novel or context-specific errors.
-   **Data Explorer**: The query engine is experimental and only supports `...WHERE message contains 'value'`.

---

<a id="contributing"></a>
### 🧑‍💻 Contributing

Contributions are highly welcome! Feel free to fork the repository, create a feature branch, and submit a pull request.

**Ideas for contributions:**
-   Implement the missing parsers for formats like `.evtx`, `.etl`, or `.cap`.
-   Add decompression support for `.gz` and `.tar` files.
-   Improve the error detection regex for higher accuracy.
-   Enhance the Data Explorer with more advanced query capabilities.

Please report bugs or request features using the [Issues tab](https://github.com/Blindsinner/AI-Powered-Log-Analyzer-Ultimate/issues) on GitHub.

---

<a id="license"></a>
### 📜 License

This project is licensed under the **GNU Affero General Public License v3.0**. Please see the [LICENSE](https://github.com/Blindsinner/AI-Powered-Log-Analyzer-Ultimate/blob/main/LICENSE) file for full details.
