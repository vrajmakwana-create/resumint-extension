# Resumint Chrome Extension (Manifest V3)

AI-powered Chrome extension companion for **Resumint**. Tailor your verified baseline resume directly from any job posting (LinkedIn, Indeed, Greenhouse, Lever, etc.) without leaving the tab.

---

## 🚀 Key Features

1. **Authentication & Session Gatekeeping**:
   - Secure login via `POST /api/v1/users/login`.
   - Token persisted securely in `chrome.storage.local`.
   - Automatic onboarding status check via `GET /api/v1/users/me`.
   - **Gatekeeper**: If `onboarding_completed: false`, prompts the user to complete their baseline resume setup on the web app before unlocking tailoring.

2. **Smart Job Description Form**:
   - **Auto-Extract JD**: 1-click button to extract Job Title, Company Name, and Job Description directly from the active webpage (LinkedIn, Indeed, Greenhouse, Lever, or generic job postings) using the extension's content script.
   - Manual input fields and 1-click clipboard paste.

3. **AI Tailored Resume Output**:
   - Real-time compatibility score badge (e.g., `88% Match`).
   - Seniority level comparison (Target JD Seniority vs Candidate Seniority).
   - ATS-tailored professional summary with 1-click copy for quick job applications.
   - Matching skills (green tags) and missing skill gaps (amber tags).

4. **3 Core Action Controls**:
   - 👁️ **Preview**: Embedded PDF viewer modal right in the popup.
   - ⬇️ **Download**: 1-click download of the tailored resume PDF (`${Company}_${JobTitle}_Tailored_Resume.pdf`).
   - 🔗 **Share Link**: Copies shareable Cloudinary link or web results URL with animated clipboard feedback.

5. **History & Quick Access**:
   - Browse previous tailored scans and re-open breakdowns or previews on demand.

---

## 🛠️ How to Load into Google Chrome

1. **Build the extension**:
   ```bash
   cd d:\AvinyaaEdtech\Projects\resumint\extension
   npm run build
   ```
   *(This generates the production bundle in the `dist/` directory).*

2. **Open Chrome Extensions**:
   - In Google Chrome, navigate to `chrome://extensions/`
   - Enable **"Developer mode"** toggle in the top-right corner.

3. **Load Unpacked**:
   - Click **"Load unpacked"** in the top-left corner.
   - Select the `dist/` directory inside `d:\AvinyaaEdtech\Projects\resumint\extension\dist` (or the `extension/` root directory).

4. **Pin and Use**:
   - Click the puzzle icon in Chrome's toolbar and pin **Resumint**.
   - Click the Resumint icon on any job board to start tailoring!

