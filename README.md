# Academic Word Counter (with Citation Exclusion)

A lightweight web utility designed for academic writers, students, and researchers to accurately count words while excluding in-text academic citations (e.g., APA style citations like `(Hutapea, 2025)` or `(Cappelli & Cini, 2021; de et al., 2024)`).

Built as a single, zero-dependency HTML file ready for local use or static hosting (e.g., Cloudflare Pages, GitHub Pages).

---

## Features

- **Live Counter**: Calculates words, total characters, characters excluding spaces, and sentence count in real time.
- **Academic Citation Exclusion**: Toggle on/off to remove citations from word and character counts without modifying your original text.
- **Interactive Visual Highlight**: Automatically bolds and highlights detected citations in the text box so you can visually verify what was excluded.
- **Detailed Citation Breakdown**: Expandable summary listing every detected citation found in the text.
- **Comprehensive Citation Support**:
  - Single author: `(Hutapea, 2025)`
  - Multiple authors: `(Hutapea & Doe, 2025)`, `(Schopf & Scherf, 2021)`
  - Three or more authors: `(Hutapea et al., 2025)`
  - Initials: `(J. Li et al., 2025)`
  - Lowercase particles & surnames: `(de et al., 2024)`, `(de Pablo et al., 2025)`
  - Complex author lists: `(Cappelli, Bettaccini, et al., 2020)`
  - Semicolon-separated multi-citations: `(Liu et al., 2023; Wu et al., 2025)`
  - Citations with page numbers: `(Hutapea, 2025, p. 12)`, `(Hutapea, 2025, pp. 12-15)`
  - Prefix expressions: `(see Hutapea, 2025)`, `(e.g. Hutapea, 2025; cf. Doe, 2020)`
  - Safe parsing: Regular parenthetical expressions like `(for example)` or `(3 items)` remain untouched.

---

## Quick Start

### Running Locally
No installation or build steps are required.
1. Clone this repository or download [index.html](file:///C:/Users/stefa/.gemini/antigravity/scratch/wordcount/index.html).
2. Open `index.html` in any modern web browser.

### Deploying for Free

#### Option 1: GitHub Pages
1. Go to your repository settings on GitHub.
2. Navigate to **Pages** in the left sidebar.
3. Under **Branch**, select `main` (root) and click **Save**.
4. Your website will be live at `https://<your-username>.github.io/<repo-name>/`.

#### Option 2: Cloudflare Pages
1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com).
2. Go to **Workers & Pages** > **Create application** > **Pages**.
3. Choose **Connect to Git** to link your repository, or **Upload assets** and drop `index.html`.
4. Deploy with default settings.

---

## File Structure

```text
├── index.html        # Complete application (HTML, CSS, and JavaScript)
└── README.md         # Documentation
```

---

## License

MIT License. Feel free to use and customize.
