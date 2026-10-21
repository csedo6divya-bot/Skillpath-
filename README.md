# SkillPath

**Your Skills. Your Goals. Your Personalized Path.**

Designed and built by **Rachabattuni Divya**.

SkillPath is a personalized placement-roadmap website for students. You enter your profile (including your level and daily study hours), pick a target software role, and get a step-by-step roadmap with practice tasks, projects, free resources and interview topics. A progress dashboard saves your progress in the browser.

It is built with plain **HTML, CSS and vanilla JavaScript**. There is no framework, no backend, no paid API and no build step.

> **Honest note on "personalization":** SkillPath is **rule-based, not AI**. The roadmap page lists the exact rules applied to each student (see [How the roadmap is generated](#how-the-roadmap-is-generated)).

---

## Features

| Area | What it does |
|---|---|
| Home | Navigation, hero ("Your Personalized Path to a Software Career."), Features, How It Works, Career Paths, demo students, About |
| Student profile | Name, degree, year, preferred language, current level, daily study hours, all validated |
| Career selection | Frontend, Backend, Full-Stack, Python, Java, AI/ML, each with a description, skills, project ideas |
| Personalized roadmap | Ordered modules with beginner-friendly explanations, practice tasks, projects, estimated duration, free resources, interview topics, adapted to your level, language and daily hours |
| Progress dashboard | Tick tasks, completed/remaining/percentage, phase progress, filters, saved in LocalStorage (restored on refresh when start-fresh mode is off, see below) |
| Manage | Edit details, change target role, regenerate roadmap, reset progress, erase all data (each with confirmation) |
| UX | Responsive mobile menu, form validation, success/error toasts, keyboard-accessible, print/save-as-PDF for the roadmap |

## How the roadmap is generated

The roadmap depends on three things you enter in your profile, plus the career you pick:

1. **Level** (Beginner / Intermediate / Advanced):
   - **Beginner**: every module at its standard length, beginner projects.
   - **Intermediate**: the Phase 1 foundation modules become *quick reviews* (half the hours and the first 2 tasks of each), core modules stay standard, beginner and intermediate projects.
   - **Advanced**: foundations are quick reviews (40% of the hours), core modules are 20% shorter, all projects.
2. **Preferred language**: used for the programming-basics module (Python, Java and AI/ML paths use their own language).
3. **Daily study hours**: duration = total hours / daily hours, using 6 study days a week.

The roadmap page lists the exact rules that were applied. Changing the career or editing your details keeps your completed tasks wherever the same task still exists in the new roadmap.

## Recording a demo (start-fresh mode)

By default SkillPath **starts from the Home page with no saved data every time the page is opened or refreshed**, so you can record a video from the very first step. Your answers and progress are still kept while the page stays open.

If you want the website to remember a student after a refresh (normal use), open `script.js` and change

```js
const START_FRESH = window.SKILLPATH_FRESH_START !== false;
```
to
```js
const START_FRESH = false;
```

## Project structure

```
skillpath/
├── index.html            Page structure (all views)
├── style.css             Design system and responsive layout
├── script.js             App logic: state, validation, scoring, roadmap engine, dashboard
├── data.js               All content: careers, modules, resources, demo students
├── tests/
│   └── journey.test.js   Automated end-to-end test (Playwright + Chromium)
├── package.json          Only used for the optional test
├── .gitignore
└── README.md
```

To change content (questions, modules, resources, careers), edit `data.js` only.

## Run it

**Easiest:** double-click `index.html`. It opens in your browser. No install is needed.

**With a local server (recommended for demos):**

```bash
cd skillpath
python3 -m http.server 8000      # or: npx serve .
# open http://localhost:8000
```

## Test it

### Quick manual test (about 3 minutes)
1. Open the site and click **Build My Roadmap**.
2. Submit the empty profile form. You should see error messages. Then fill it in properly.
3. Pick a career, then confirm. Your roadmap opens.
4. Open the dashboard and tick a few tasks. (To keep progress after a refresh, switch off start-fresh mode as described above.)
5. Try **Change target role**, **Edit student details** (change the level and hours and watch the roadmap change) and **Reset progress**.
6. Load each of the three **demo students** on the home page and compare their roadmaps.

### Automated test
```bash
npm install
npx playwright install chromium
npm test
```
The test runs the whole journey in a real browser (Home, Profile, Career, Roadmap, Dashboard), plus validation, persistence after refresh, level and hours changes, role change, resets, start-fresh mode, corrupt-storage recovery and mobile layout. Screenshots are saved to `tests/screenshots/`.

## Upload to GitHub

1. Create a free account at <https://github.com> and click **New repository**. Name it `skillpath` and leave it empty (no README).
2. In a terminal inside the `skillpath` folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: SkillPath placement roadmap"
   git branch -M main
   git remote add origin https://github.com/<your-username>/skillpath.git
   git push -u origin main
   ```
3. No terminal? On the repository page choose **Add file, Upload files**, drag in everything inside the `skillpath` folder (not the folder itself) and commit.

## Deploy online for free

### Option A: GitHub Pages
1. In your repository open **Settings, Pages**.
2. Under *Build and deployment* choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
3. After about a minute your site is live at `https://<your-username>.github.io/skillpath/`.

### Option B: Netlify
1. Sign in at <https://app.netlify.com> with GitHub.
2. **Add new site, Import an existing project**, choose the repo. Leave the build command empty and set the publish directory to `.`
3. Click **Deploy**.

(Vercel and Cloudflare Pages work the same way for static sites.)

## Add it to LinkedIn
Post screenshots (the dashboard and roadmap pages look best), the live link and the GitHub link. Describe what you built (a rule-based personalization engine, LocalStorage persistence, responsive UI, automated tests) without claiming AI.

## Limitations
- Personalization is rule-based and uses the level you choose. SkillPath does not test your knowledge.
- Data is stored only in your browser's LocalStorage: it does not sync across devices, and clearing site data removes it.
- Durations are estimates for a beginner studying consistently.
- Resource links point to well-known free sites. Pages can move, so a link may occasionally need updating in `data.js`.
- The page loads the Inter font from Google Fonts. Offline, it falls back to the system font.

## License
MIT. Free to use and adapt for learning and portfolios.
