/**
 * Academic Citation Parser and Tokenizer
 * 
 * Accurately detects and classifies academic citations without relying on
 * a single brittle monolithic regular expression.
 * 
 * Supports:
 * - Author-Date: APA 7th, Harvard, Chicago (Author-Date), ASA
 * - Numeric / Bracketed: IEEE, Vancouver, Nature, ACM, Science
 * - Author-Page: MLA 8th/9th Edition
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.AcademicCitationParser = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Recognized scholarly prefix terms that can introduce a citation
  const SCHOLARLY_PREFIXES = new Set([
    'see', 'see also', 'e.g.', 'e.g', 'eg', 'cf.', 'cf', 'i.e.', 'i.e',
    'compare', 'cited in', 'quoted in', 'as cited in', 'review in', 'adapted from',
    'in', 'from', 'for example'
  ]);

  // Name particles common in Dutch, German, French, Spanish, Italian, Portuguese
  const NAME_PARTICLES = new Set([
    'de', 'van', 'von', 'del', 'di', 'da', 'du', 'la', 'le', 'lo',
    'den', 'der', 'dos', 'das', 'dalla', 'della', 'degli', 'van der', 'von der'
  ]);

  // Excluded labels that indicate tables, figures, notes, or measurements (NOT citations)
  const EXCLUDED_TAGS = [
    /^(fig|figure|table|eq|equation|chart|box|plate|supplementary|appendix|note|algorithm)\b/i,
    /^(emphasis|italic|bold|translation|author's|authors')\s+(added|ours|mine)/i,
    /^(sic|ibid|op\.\s*cit\.|loc\.\s*cit\.)\.?$/i,
    /^\d+(\.\d+)?\s*(%|percent|kg|g|mg|µg|ml|l|m|cm|mm|nm|s|sec|min|h|hr|hours|days|years|°c|°f|k|hz|khz|mhz|ghz|v|w|j|n|pa|kpa|mpa|bar|rpm)\b/i
  ];

  /**
   * Helper to count words in a string according to standard academic rules
   */
  function countWords(str) {
    if (!str) return 0;
    const trimmed = str.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }

  /**
   * Evaluates if a clause matches IEEE / Vancouver Numeric style
   * Examples:
   *   "1"
   *   "1, 2"
   *   "1-4"
   *   "1, 3, 5-8"
   *   "1, p. 25"
   *   "12, pp. 45-48"
   */
  function parseNumericCitation(innerContent, isSquareBracket) {
    let text = innerContent.trim();

    // Check optional scholarly prefix (e.g. "see [1, 2]")
    for (const prefix of SCHOLARLY_PREFIXES) {
      if (text.toLowerCase().startsWith(prefix.toLowerCase() + ' ')) {
        text = text.substring(prefix.length).trim();
        break;
      }
    }

    // Strip leading punctuation or reference labels (e.g. "Ref. 1", "Reference [1]")
    text = text.replace(/^(ref\.|reference|refs\.|references)\s*/i, '');

    // Numeric citations primarily appear in square brackets [1], though occasionally (1)
    if (!isSquareBracket && !text.match(/^[\d\s,\-\u2013\u2014]+$/)) {
      return null;
    }

    // Check against negative tags
    for (const rx of EXCLUDED_TAGS) {
      if (rx.test(text)) return null;
    }

    // Match numeric sequence with optional page/section suffix
    // e.g., "1, 2, 5-8" or "14, p. 12" or "3-5" or "1]-[4"
    const numericCoreRegex = /^(\d+(\s*[\-\u2013\u2014]\s*\d+)?(\s*,\s*\d+(\s*[\-\u2013\u2014]\s*\d+)?)*)(\s*,\s*(p+|pp|page|pages|ch|sec|section)\.?\s*\d+(\s*[\-\u2013\u2014]\s*\d+)?)?$/i;
    
    // Also support multi-bracket notation inside merged content like "1]-[4"
    const multiBracketRegex = /^\d+(\s*\]\s*[\-\u2013\u2014,]\s*\[\s*\d+)+$/;

    if (numericCoreRegex.test(text) || multiBracketRegex.test(text)) {
      return {
        style: 'IEEE / Numeric',
        confidence: isSquareBracket ? 0.98 : 0.85,
        details: 'Numeric reference (' + text + ')'
      };
    }

    return null;
  }

  /**
   * Evaluates if an author string is valid for academic author-date / author-page citations
   */
  function isValidAuthorString(authorStr) {
    if (!authorStr) return false;
    let s = authorStr.trim();

    // Strip prefix if any
    for (const prefix of SCHOLARLY_PREFIXES) {
      if (s.toLowerCase().startsWith(prefix.toLowerCase() + ' ')) {
        s = s.substring(prefix.length).trim();
        break;
      }
    }

    // Check for negative tags
    for (const rx of EXCLUDED_TAGS) {
      if (rx.test(s)) return false;
    }

    // Words that frequently appear in ordinary parentheticals but are not authors
    const forbiddenWords = [
      'for', 'example', 'such', 'as', 'including', 'which', 'that', 'this', 'these',
      'furthermore', 'however', 'moreover', 'although', 'whereas', 'because', 'therefore',
      'shown', 'above', 'below', 'left', 'right', 'average', 'total', 'data', 'source',
      'step', 'case', 'type', 'method', 'sample', 'result', 'results', 'model'
    ];

    const tokens = s.split(/[\s,]+/);
    for (const tok of tokens) {
      if (forbiddenWords.includes(tok.toLowerCase())) {
        return false;
      }
    }

    // Must contain at least one valid surname or particle or corporate author
    // Examples: "Smith", "J. Li", "de Pablo", "Cappelli & Cini", "World Health Organization", "Takač et al."
    const authorPattern = /^(?:[A-Z\u00C0-\u024F][\w\u00C0-\u024F'\u2019\-]*|[a-z]{2,4}\b|[A-Z]\.)/i;
    if (!authorPattern.test(s)) return false;

    // Check for "et al." or connectors
    const hasEtAl = /\bet\s+al\.?/i.test(s);
    const hasAmpersand = /(&|\band\b)/i.test(s);

    return true;
  }

  /**
   * Evaluates if a clause matches Author-Date style (APA 7th, Harvard, Chicago)
   * Examples:
   *   "Hutapea, 2025"
   *   "Hutapea & Doe, 2025"
   *   "J. Li et al., 2025"
   *   "de Pablo et al., 2025"
   *   "de et al., 2024"
   *   "Cappelli, Bettaccini, et al., 2020"
   *   "Smith, 2020, p. 14"
   *   "Smith 2020: 45"
   *   "WHO, 2023"
   */
  function parseAuthorDateCitation(clause) {
    let text = clause.trim();

    // Strip scholarly prefixes
    for (const prefix of SCHOLARLY_PREFIXES) {
      if (text.toLowerCase().startsWith(prefix.toLowerCase() + ' ')) {
        text = text.substring(prefix.length).trim();
        break;
      }
    }

    for (const rx of EXCLUDED_TAGS) {
      if (rx.test(text)) return null;
    }

    // Pattern for Year with optional letters (e.g. 2021a) or "n.d." / "in press"
    // Also optional pages: ", p. 12" or ": 12-15"
    // Regex splits author part from year part
    // Case 1: Standard comma or colon: "Author(s), YYYY" or "Author(s) YYYY"
    const authorDateRegex = /^(.*?)(?:,\s*|\s+)(\b(?:18|19|20)\d{2}[a-z]?\b|\bn\.d\.?\b|\bin\s+press\b)(?:\s*(?:,\s*|\s*:\s*)(?:pp?\.?\s*)?(\d+(?:\s*[\-\u2013\u2014]\s*\d+)?))?$/i;

    const match = text.match(authorDateRegex);
    if (!match) return null;

    const authorPart = match[1].trim();
    const yearPart = match[2].trim();
    const pagePart = match[3] ? match[3].trim() : null;

    if (!authorPart) return null;

    // Validate author part
    if (!isValidAuthorString(authorPart)) return null;

    // Ensure author does not contain full conversational sentences
    if (authorPart.split(/\s+/).length > 8) return null;

    return {
      style: 'APA / Harvard (Author-Date)',
      confidence: 0.95,
      author: authorPart,
      year: yearPart,
      page: pagePart,
      details: authorPart + ' (' + yearPart + (pagePart ? ', p. ' + pagePart : '') + ')'
    };
  }

  /**
   * Evaluates if a clause matches MLA Author-Page style
   * Examples:
   *   "Smith 45"
   *   "Smith 45-48"
   *   "Johnson and Smith 120"
   *   "Alvarez et al. 89"
   */
  function parseAuthorPageCitation(clause) {
    let text = clause.trim();

    for (const prefix of SCHOLARLY_PREFIXES) {
      if (text.toLowerCase().startsWith(prefix.toLowerCase() + ' ')) {
        text = text.substring(prefix.length).trim();
        break;
      }
    }

    for (const rx of EXCLUDED_TAGS) {
      if (rx.test(text)) return null;
    }

    // MLA is strictly: [Author Names] [Page Number/Range] without a 4-digit year
    const mlaRegex = /^(.*?)\s+(\d{1,4}(?:\s*[\-\u2013\u2014]\s*\d{1,4})?)$/;
    const match = text.match(mlaRegex);
    if (!match) return null;

    const authorPart = match[1].trim();
    const pageNum = match[2].trim();

    // If author ends with a year or looks like author-date, it's not pure MLA author-page
    if (/\b(?:18|19|20)\d{2}\b/.test(authorPart)) return null;

    // Check if the number looks like a standalone year (e.g. 2020) rather than a page
    const numVal = parseInt(pageNum, 10);
    if (numVal >= 1800 && numVal <= 2099 && !pageNum.includes('-') && !pageNum.includes('–')) {
      // Standalone 4-digit number between 1800 and 2099 is Harvard author-year without comma (e.g. "Smith 2024")
      if (isValidAuthorString(authorPart)) {
        return {
          style: 'Harvard (Author-Date)',
          confidence: 0.92,
          author: authorPart,
          year: pageNum,
          details: authorPart + ' (' + pageNum + ')'
        };
      }
      return null;
    }

    if (!isValidAuthorString(authorPart)) return null;

    return {
      style: 'MLA (Author-Page)',
      confidence: 0.88,
      author: authorPart,
      page: pageNum,
      details: authorPart + ' (p. ' + pageNum + ')'
    };
  }

  /**
   * Main Citation Analysis Function for an enclosed string candidate
   * e.g. "(Hutapea, 2025; Doe, 2020)" or "[1, 3-5]"
   */
  function analyzeEnclosure(content, isSquareBracket, styleFilter) {
    if (!content || !content.trim()) return null;

    const trimmed = content.trim();

    // 1. Try Numeric (IEEE / Vancouver) on the full content
    if (!styleFilter || styleFilter === 'all' || styleFilter === 'numeric') {
      const numRes = parseNumericCitation(trimmed, isSquareBracket);
      if (numRes) return numRes;
    }

    // 2. Try Author-Date / MLA on clauses separated by semicolons
    const clauses = trimmed.split(/\s*;\s*/);
    let matchedStyles = [];
    let detectedDetails = [];

    for (const clause of clauses) {
      if (!clause.trim()) continue;

      let clauseResult = null;

      // Try Author-Date
      if (!styleFilter || styleFilter === 'all' || styleFilter === 'author-date') {
        clauseResult = parseAuthorDateCitation(clause);
      }

      // Try MLA Author-Page if Author-Date didn't match
      if (!clauseResult && (!styleFilter || styleFilter === 'all' || styleFilter === 'author-page')) {
        clauseResult = parseAuthorPageCitation(clause);
      }

      // Try Numeric inside semicolon group
      if (!clauseResult && (!styleFilter || styleFilter === 'all' || styleFilter === 'numeric')) {
        clauseResult = parseNumericCitation(clause, isSquareBracket);
      }

      if (clauseResult) {
        matchedStyles.push(clauseResult.style);
        detectedDetails.push(clauseResult.details || clause.trim());
      } else {
        // If one of multiple clauses fails completely, this enclosure might just be normal text
        return null;
      }
    }

    if (matchedStyles.length > 0) {
      // Determine predominant style name
      const primaryStyle = matchedStyles[0];
      return {
        style: matchedStyles.length > 1 ? primaryStyle + ' (Multi-citation)' : primaryStyle,
        confidence: 0.95,
        details: detectedDetails.join('; ')
      };
    }

    return null;
  }

  /**
   * Tokenizes text and extracts all citation candidate boundaries:
   * Parenthetical (...) and Bracketed [...]
   */
  function findCitations(text, options) {
    const opts = options || {};
    const styleFilter = opts.styleFilter || 'all'; // 'all', 'author-date', 'numeric', 'author-page'
    const citations = [];

    if (!text || typeof text !== 'string') return citations;

    const len = text.length;
    let i = 0;

    while (i < len) {
      const char = text[i];

      // Handle Parentheses '(' or Brackets '['
      if (char === '(' || char === '[') {
        const isBracket = char === '[';
        const closingChar = isBracket ? ']' : ')';
        const start = i;
        let depth = 1;
        let j = i + 1;

        // Find matching closing bracket/parenthesis while allowing nested brackets
        while (j < len && depth > 0) {
          if (text[j] === char) {
            depth++;
          } else if (text[j] === closingChar) {
            depth--;
          }
          j++;
        }

        if (depth === 0) {
          // Found an enclosed candidate
          const end = j; // exclusive
          const rawEnclosed = text.substring(start, end);
          const innerContent = text.substring(start + 1, end - 1);

          // Only analyze if reasonable length for citations (under 250 chars)
          if (innerContent.length > 0 && innerContent.length < 250) {
            const analysis = analyzeEnclosure(innerContent, isBracket, styleFilter);

            if (analysis) {
              citations.push({
                text: rawEnclosed,
                inner: innerContent,
                index: start,
                end: end,
                length: end - start,
                style: analysis.style,
                confidence: analysis.confidence,
                details: analysis.details,
                wordsCount: countWords(rawEnclosed)
              });
              i = end;
              continue;
            }
          }
        }
      }

      i++;
    }

    return citations;
  }

  /**
   * Strips all detected citations and returns net text, stats, and citation metadata
   */
  function processText(text, options) {
    if (!text) {
      return {
        originalText: '',
        cleanText: '',
        citations: [],
        grossWords: 0,
        netWords: 0,
        excludedCitationWords: 0,
        grossChars: 0,
        netChars: 0,
        netCharsNoSpaces: 0,
        sentences: 0
      };
    }

    const citations = findCitations(text, options);

    // Build clean text by slicing around citation boundaries
    let cleanText = '';
    let lastIdx = 0;
    let totalExcludedCitationWords = 0;

    for (const cite of citations) {
      cleanText += text.substring(lastIdx, cite.index);
      totalExcludedCitationWords += cite.wordsCount;
      lastIdx = cite.end;
    }
    cleanText += text.substring(lastIdx);

    // Clean up double spaces created by removed citations
    const normalizedCleanText = cleanText.replace(/[ \t]{2,}/g, ' ');

    const grossWords = countWords(text);
    const netWords = countWords(normalizedCleanText);

    // Count sentences accurately
    const trimmedClean = normalizedCleanText.trim();
    let sentences = 0;
    if (trimmedClean.length > 0) {
      const sentenceMatches = trimmedClean.match(/[^.!?]+[.!?]+(?:\s|$)/g);
      sentences = sentenceMatches ? sentenceMatches.length : 1;
    }

    return {
      originalText: text,
      cleanText: normalizedCleanText,
      citations: citations,
      grossWords: grossWords,
      netWords: netWords,
      excludedCitationWords: totalExcludedCitationWords,
      grossChars: text.length,
      netChars: normalizedCleanText.length,
      netCharsNoSpaces: normalizedCleanText.replace(/\s/g, '').length,
      sentences: sentences
    };
  }

  /**
   * Generates HTML with detected citations wrapped in <mark> tags
   * for the visual overlay editor
   */
  function buildHighlightedHtml(text, options, escapeFn) {
    const esc = escapeFn || function (s) {
      return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    const citations = findCitations(text, options);
    if (citations.length === 0) {
      return esc(text) + '\n';
    }

    let html = '';
    let lastIdx = 0;

    for (const cite of citations) {
      if (cite.index > lastIdx) {
        html += esc(text.substring(lastIdx, cite.index));
      }

      // Add data-style attribute and title for rich tooltip / visual indication
      const styleClass = cite.style.includes('IEEE') || cite.style.includes('Numeric')
        ? 'mark-numeric'
        : cite.style.includes('MLA')
          ? 'mark-mla'
          : 'mark-authordate';

      html += '<mark class="citation-mark ' + styleClass + '" title="' + esc(cite.style + ': ' + cite.details) + '">' +
        esc(cite.text) +
        '</mark>';

      lastIdx = cite.end;
    }

    if (lastIdx < text.length) {
      html += esc(text.substring(lastIdx));
    }

    return html + '\n';
  }

  return {
    countWords: countWords,
    findCitations: findCitations,
    processText: processText,
    buildHighlightedHtml: buildHighlightedHtml
  };
});
