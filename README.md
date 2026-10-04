# Academic Word Counter (with Citation Exclusion)

> **Live Deployment:** [https://wordcount.stefan-agusto.workers.dev/](https://wordcount.stefan-agusto.workers.dev/)

An academic writing utility designed to count words in essays, research papers, and dissertations while accurately excluding in-text academic citations from the final tally.

Supports **APA 7th, Harvard, Chicago, IEEE, Vancouver, and MLA** citation formats.

---

## Story and Purpose

This project was built with love to support my girlfriend, **Ivena**, during her Master's degree studies.

Many university assignments, thesis guidelines, and journal submissions enforce strict maximum word count limits. In many academic rubrics, in-text citations do not count toward the allowable word count. Manually calculating words around citations is tedious and prone to accidental over-counting or under-counting.

This web tool solves that problem: it counts your net submittable words, highlights detected citations in the editor so you can verify them, and gives you total confidence before submitting.

---

## Supported Citation Formats

The app uses a dedicated tokenizer and structural parser (not a single brittle regex) to handle multiple academic referencing conventions:

### 1. Author-Date Styles (APA 7th, Harvard, Chicago Author-Date)
- **Single author:** `(Hutapea, 2025)`
- **Two authors:** `(Hutapea & Doe, 2025)` or `(Hutapea and Doe, 2025)`
- **Three or more authors:** `(Hutapea et al., 2025)` or `(Takač et al., 2021)`
- **Initials with surname:** `(J. Li et al., 2025)`
- **Name particles:** `(de Pablo et al., 2025)`, `(de et al., 2024)`
- **Multi-author lists:** `(Cappelli, Bettaccini, et al., 2020)`
- **Semicolon groups:** `(Liu et al., 2023; Wu et al., 2025)`
- **With page numbers:** `(Hutapea, 2025, p. 12)`, `(Hutapea, 2025, pp. 12-15)`
- **Harvard colon notation:** `(Smith 2020: 45)`
- **Scholarly prefixes:** `(see Hutapea, 2025)`, `(e.g., Hutapea, 2025; cf. Doe, 2020)`

### 2. Numeric / Bracketed Styles (IEEE, Vancouver, ACM, Nature)
- **Single reference:** `[1]`
- **Multiple references:** `[1, 2]`, `[1-4]`, `[1, 3, 5-8]`
- **With section or page reference:** `[1, p. 25]`, `[12, pp. 45-48]`
- **With prefix:** `[see 1, 2]`

### 3. Author-Page Styles (MLA 8th and 9th Edition)
- **Author and page without comma:** `(Smith 45)`
- **Multiple authors:** `(Smith and Jones 12-14)`
- **Et al. format:** `(Alvarez et al. 89)`

### 4. False-Positive Protection
Ordinary parenthetical notes are preserved and counted normally:
- `(for example)`, `(3 items)`, `(such as wheat and rye)`
- `(Table 1)`, `(Figure 2)`, `(Equation 3)`
- `(100%)`, `(10 mg/mL)`, `[Table 3]`, `[Figure 1]`

---

## Key Features

- **Net vs. Gross Word Counter:** Displays submittable words prominently, alongside total words in the editor and words deducted from citations.
- **Visual Highlight Overlay:** Automatically bolds and colors citations directly inside the writing canvas so you can review what is excluded.
- **Citation Inspector Panel:** An expandable breakdown showing every detected citation, its identified style, and its word deduction.
- **Style Mode Selector:** Filter by Auto-detect, Author-Date, IEEE/Numeric, or MLA.
- **Assignment Word Limit Goal:** Input your required target (e.g. 2,000 words) to see live progress and warnings if exceeded.
- **Copy Clean Text:** One click copies your text with all citations cleanly stripped out.
- **Sample Text:** Instant sample loader to test the tool on real academic text.
- **Full Offline and Client-Side:** No text is sent to any server. All processing runs privately in the browser.

---

## File Structure

```text
├── index.html          # Clean HTML5 markup
├── css/
│   └── style.css       # Accessible, responsive styles (WCAG AA compliant)
├── js/
│   ├── parser.js       # Academic citation parser and tokenizer module
│   └── app.js          # UI controller, stats calculator, and event handlers
├── wrangler.jsonc      # Cloudflare Workers static asset configuration
├── test-parser.js      # Automated Node.js test suite for citation parsing
└── README.md           # Documentation
```

---

## Deployment and CI/CD

### Automated Deployment via Cloudflare Workers
This repository is configured for automatic continuous deployment using Cloudflare Workers and Git integration:
- Configuration is declared in `wrangler.jsonc`.
- Every push to the `main` branch automatically triggers a deployment on Cloudflare.
- Live website: [https://wordcount.stefan-agusto.workers.dev/](https://wordcount.stefan-agusto.workers.dev/)

### Running Locally
No build step or node package installation is required:
1. Clone the repository.
2. Open `index.html` directly in any web browser.

To run the automated citation parser tests:
```bash
node test-parser.js
```

---

## License

MIT License. Free for students, researchers, and educators everywhere.
