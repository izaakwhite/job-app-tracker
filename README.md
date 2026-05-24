# 📊 Job Application Tracker

Local dashboard that reads your job applications spreadsheet. No OAuth, no API keys.

## Quick Start

```bash
npm install
npm start
```

Open **http://localhost:3000** — then either:

### Option A — Google Sheets link
1. In your sheet: **Share → Change → Anyone with the link → Viewer**
2. Paste the URL on the setup page → done

### Option B — Upload a file
1. In Google Sheets: **File → Download → Microsoft Excel (.xlsx)**
2. Upload the file on the setup page → done
3. Re-upload anytime to refresh the data

## Stats shown
Submitted · Ghosted · Rejected · Interviews · No Interview · 2nd Round · Offers · Withdrawn
+ response rate, interview rate, offer/interview rate, funnel chart, donut, recent apps

## Spreadsheet columns (auto-detected)
Name one column **Status** (or Stage/Phase). Optional: Company, Role/Position, Date.
