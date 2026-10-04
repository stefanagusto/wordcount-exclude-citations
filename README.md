# Academic Word Counter (with Citation Exclusion)

> **Live Demo:** [https://wordcount.stefan-agusto.workers.dev/](https://wordcount.stefan-agusto.workers.dev/)

A lightweight, zero-dependency web utility designed for academic writers, researchers, and students to accurately count words while automatically excluding in-text academic citations (APA-style citations such as `(Hutapea, 2025)` or `(Cappelli & Cini, 2021; de et al., 2024)`).

---

## Story & Background

This project was built with love to support my girlfriend, **Ivena**, during her Master's degree studies. 

Many university essays, journal submissions, and graduate-level assignments enforce strict maximum word count limits where academic in-text citations should not be counted toward the final tally. Manually deleting or calculating words around citations was tedious and error-prone, so this tool was created to automate the process, highlight what gets excluded, and give confidence before submitting assignments.

---

## Features

- **Live Counter**: Calculates words, total characters, characters excluding spaces, and sentence count in real time as you paste or type.
- **Academic Citation Exclusion**: Toggle on/off to strip citations from word and character counts without modifying your original text.
- **Interactive Visual Highlight**: Automatically bolds and highlights detected citations directly in the editor so you can visually verify what was excluded.
- **Detailed Citation Breakdown**: Expandable summary panel listing every detected citation found across the text.
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
  - Safe parsing: Regular parenthetical text such as `(for example)` or `(3 items)` remains untouched.

---

## Live Demo & Deployment

- **Live URL:** [https://wordcount.stefan-agusto.workers.dev/](https://wordcount.stefan-agusto.workers.dev/)
- Hosted on **Cloudflare Workers / Pages**.

### Running Locally
No installation or build steps are required.
1. Clone this repository.
2. Open [`index.html`](file:///C:/Users/stefa/.gemini/antigravity/scratch/wordcount/index.html) in any modern web browser.

---

## File Structure

```text
├── index.html        # Complete application (HTML, CSS, and JavaScript)
└── README.md         # Documentation and project background
```

---

## License

MIT License. Feel free to use, share, and customize for your own academic work!
