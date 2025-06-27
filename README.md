# AI-Powered Log Analyzer Ultimate

![Log Analyzer Screenshot](https://placehold.co/800x400/1f2937/7dd3fc?text=Log+Analyzer+Ultimate)

An advanced, browser-based log analysis tool that uses the power of Large Language Models (LLMs) like Google Gemini and OpenAI to automatically detect, classify, and provide solutions for errors found in log files. Created for system administrators, developers, and IT support professionals to dramatically speed up troubleshooting.

**Author:** [Blindsinner](https://github.com/Blindsinner)

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
* **Intelligent Error Parsing:** Automatically scans files for a wide range of common error keywords, status codes (like HRESULTs), and failure patterns.
* **Advanced AI Analysis:**
    * **Multi-Provider Support:** Seamlessly switch between Google Gemini and OpenAI, allowing you to use your preferred or most accessible models.
    * **Model Selection:** Choose from popular models like `gemini-2.0-flash`, `gemini-2.5-pro`, `gpt-4o`, etc., to balance speed, cost, and analytical depth.
    * **Custom Endpoint:** Configure a custom API endpoint URL. This is an advanced feature for users who may be running models through a proxy server or using a private, self-hosted LLM instance.
* **Rich Visualization Dashboard:**
    * **At-a-Glance Stats:** Key metrics on unique errors, total occurrences, and files analyzed provide an instant overview of your log data's health.
    * **Interactive Timeline:** A professional chart plots total errors over time, with severity-colored dots (Critical, High, Medium, Low) for instant visual correlation. This helps you immediately spot spikes in critical errors.
    * **Detailed Tooltips:** Hover over the chart to see a full breakdown of error severities at any point in time, helping you understand the error composition at a glance.
* **Detailed Results View:**
    * Errors are intelligently grouped and sorted by frequency, bringing the most common issues to the top.
    * Expand each error group to view detailed, AI-generated descriptions, potential impact analysis, severity ratings, and step-by-step recommended solutions.
    * Includes the original log line context for every error occurrence, allowing you to trace the issue back to its source.
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

---

## 🛠️ How to Set It Up for Personal Use

This guide will help you run the Log Analyzer on your own computer. No complex coding is required!

### Prerequisites

1.  **Node.js:** This is the JavaScript runtime environment that will run the application. Think of it as the "engine" for the app.
    * Go to the [official Node.js website](https://nodejs.org/).
    * Download the version labeled **LTS** (Long Term Support), which is the most stable version for general users.
    * Run the installer you downloaded and follow the on-screen instructions, accepting the default options.

2.  **A Code Editor (Optional but Recommended):**
    * While not strictly necessary to run the app, a code editor makes it easier to view the project files. [Visual Studio Code](https://code.visualstudio.com/download) is a fantastic, free, and popular option.

### Step-by-Step Instructions

#### 1. Download the Project Files

* Go to the main page of this GitHub repository: `https://github.com/Blindsinner/log-analyzer-pro` (replace with your actual repo link if different).
* Click the green **`< > Code`** button.
* In the dropdown menu, click **`Download ZIP`**.
* Find the downloaded ZIP file on your computer (usually in your "Downloads" folder) and **unzip it**. This will create a folder named something like `log-analyzer-pro-main`.

#### 2. Install Dependencies

* **Open the terminal (or command prompt):** This is a text-based interface for your computer.
    * **On Windows:** Press the `Win` key, type `cmd`, and press `Enter`.
    * **On macOS:** Press `Cmd + Space`, type `Terminal`, and press `Enter`.
* **Navigate to the project folder:** In the terminal, you need to tell it to go inside the folder you just unzipped. Use the `cd` (change directory) command.
    * *Example:* If the folder is on your Desktop, you might type `cd Desktop/log-analyzer-pro-main` and press `Enter`.
* **Install the necessary packages:** Once you are inside the project's directory in your terminal, type the following command and press `Enter`:
    ```bash
    npm install
    ```
    This command reads the `package.json` file and automatically downloads all the open-source libraries (like React and Recharts) the project depends on. This might take a minute or two.

#### 3. Run the Application

* After the `npm install` command is finished, type the following command in the same terminal window and press `Enter`:
    ```bash
    npm start
    ```
* This will start a local development server. It should automatically open a new tab in your web browser with the application running, usually at `http://localhost:3000`.

**That's it!** The Log Analyzer is now running securely on your computer. You can now configure your API key in the app's settings and start analyzing logs privately. To stop the application, go back to your terminal and press `Ctrl + C`.

---

## 🤝 Contributing

Contributions are welcome and greatly appreciated! This project is built by the community for the community. Here's how you can help:

### Reporting Bugs

If you find a bug, please open an issue on GitHub.
* Go to the [**Issues Tab**](https://github.com/Blindsinner/log-analyzer-pro/issues) (replace with your repo link).
* Click **New Issue**.
* Please include a clear title, a detailed description of the bug, steps to reproduce it, and any relevant console errors or screenshots.

### Suggesting Enhancements

Have an idea for a new feature or an improvement to an existing one?
* Open an issue and describe your idea in detail. Explain the problem your enhancement would solve and why it would be valuable.

### Submitting Pull Requests

If you'd like to contribute code:
1.  **Fork the repository:** Create your own copy of the project.
2.  **Create a new branch:** `git checkout -b feature/AmazingNewFeature`
3.  **Make your changes:** Add your feature or fix the bug.
4.  **Commit your changes:** `git commit -m 'Add some AmazingNewFeature'`
5.  **Push to your branch:** `git push origin feature/AmazingNewFeature`
6.  **Open a Pull Request:** Go to the [**Pull Requests Tab**](https://github.com/Blindsinner/log-analyzer-pro/pulls) and open a new pull request with a clear description of your changes.

---

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
