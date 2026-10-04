/**
 * Academic Word Counter Application Controller
 * Connects UI interactions with the Academic Citation Parser
 */

(function () {
  'use strict';

  // DOM Elements
  const textInput = document.getElementById('text-input');
  const editorBackdrop = document.getElementById('editor-backdrop');
  const excludeToggle = document.getElementById('exclude-citations');
  const styleSelect = document.getElementById('style-filter');
  const goalInput = document.getElementById('goal-limit');
  const goalBadge = document.getElementById('goal-badge');

  // Stats Elements
  const statNetWords = document.getElementById('stat-net-words');
  const statGrossWords = document.getElementById('stat-gross-words');
  const statExcludedWords = document.getElementById('stat-excluded-words');
  const statCitationsCount = document.getElementById('stat-citations-count');
  const statCharsWithSpace = document.getElementById('stat-chars-space');
  const statCharsNoSpace = document.getElementById('stat-chars-nospace');
  const statSentences = document.getElementById('stat-sentences');
  const statReadingTime = document.getElementById('stat-reading-time');

  // Panel & Action Elements
  const citationPanel = document.getElementById('citation-panel');
  const citationBadge = document.getElementById('citation-badge');
  const citationListBody = document.getElementById('citation-list-body');
  const btnCopyClean = document.getElementById('btn-copy-clean');
  const btnLoadSample = document.getElementById('btn-load-sample');
  const btnClear = document.getElementById('btn-clear');
  const toastEl = document.getElementById('toast');

  // Sample academic text with various citation formats (Dough rheology study)
  const SAMPLE_TEXT = `Flour selection and the hydration level alter physical behavior and mixing parameters. At a 70% hydration level, grain composition directly influences kneading time and structural integrity. Plain flour achieves a smooth, elastic consistency after 11 minutes 49 seconds of handling, spelt flour required only 9 minutes 47 seconds. Spelt flour contains a higher proportion of monomeric gliadins relative to polymeric glutenins than common wheat flour (Takač et al., 2021). Because monomeric gliadin hydrates rapidly, spelt is characterized by higher extensibility and lower elasticity, facilitating rapid dough development in under 10 minutes. However, this lower proportion of polymeric glutenin reduces dough strength and results in a weaker, stickier network, directly accounting for the final texture, which is softer and rubbery. (Frakolaki et al., 2018).

In contrast, whole wheat flour requires an extended duration exceeding 42 minutes 21 seconds. Insoluble dietary fiber, such as whole wheat flour, is defined by core functions derived from its strong water holding capacity and resistance to fermentation (J. Li et al., 2025). These insoluble dietary fibers compete strongly for available water, hydrating much slower than endosperm starch and gluten. Initially, the dough feels granular, dry, and stiff because the endosperm proteins lack water, until prolonged mechanical action forces moisture to disperse throughout the bran matrix. Dehydrated gluten results in a stiff, crumbly dough that fails to develop properly. Furthermore, coarse fiber particles disrupt the dough's viscoelastic properties and physically break the forming matrix, yielding a dense texture with a rustic character (Rosell et al., 2010).

On the other hand, oat flour fails to form a cohesive dough because it lacks the necessary proteins for a continuous network (Chauhan et al., 2018). Gluten retains fermentation gases to adjust loaf volume and crumb softness (Monteiro et al., 2021). Without this protein matrix, dough loses cohesion and elasticity, resulting in dense or crumbly structures (Cappelli & Cini, 2021; de et al., 2024). The overall process depends on multiple parameters including temperature, speed, aeration, and hydration (Cappelli, Bettaccini, et al., 2020).

Water content strictly dictates dough development and rheological stability. At 40% hydration, moisture was severely limited, meaning water molecules could not adequately replace protein-protein hydrogen bonds with water-protein bonds. The kneading took 17 minutes 42 seconds because mechanical shear had to force unhydrated flour particles to consolidate without adequate water and protein hydrogen bonding (Schopf & Scherf, 2021). Low hydration results in a dry, friable state. Optimal viscoelasticity is achieved at a 60% hydration level, as water plasticizes the glutenin and gliadin chains into a stretchable matrix without excessive dilution. This facilitates rapid disulfide cross linking, achieving standard development in the shortest recorded time of 8 minutes and 14 seconds. At 80% hydration level, the kneading time nearly doubled to 15 minutes and 37 seconds. Excess free water accumulated in the inter particle spaces, acting as a lubricant rather than a structural component and diluting local protein concentrations. This condition required prolonged mechanical energy to enable the hydrated chains to come into contact and form a cohesive network (Liu et al., 2023; Wu et al., 2025). At a hydration level of 100%, the water volume exceeds the dough's maximum water absorption capacity. This excess liquid separates the proteins to such an extent that an elastic network cannot form, resulting in an amorphous fluid paste (de Pablo et al., 2025). Additional studies in electrical engineering confirm parallel findings [1, 2] as well as literary comparisons (Smith 45).`;

  /**
   * Shows a brief non-intrusive toast notification
   */
  let toastTimer = null;
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 2400);
  }

  /**
   * Synchronizes scrolling between textarea and the visual highlight backdrop
   */
  function syncScroll() {
    if (!editorBackdrop) return;
    editorBackdrop.scrollTop = textInput.scrollTop;
    editorBackdrop.scrollLeft = textInput.scrollLeft;
  }

  /**
   * Escape HTML entities
   */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Updates goal tracking status
   */
  function updateGoalTracker(netWords) {
    const goalVal = parseInt(goalInput.value, 10);
    if (isNaN(goalVal) || goalVal <= 0) {
      goalBadge.textContent = 'No limit set';
      goalBadge.className = 'goal-badge';
      return;
    }

    const diff = goalVal - netWords;
    if (diff > 0) {
      goalBadge.textContent = diff.toLocaleString() + ' words remaining';
      goalBadge.className = 'goal-badge';
    } else if (diff === 0) {
      goalBadge.textContent = 'Goal reached exactly!';
      goalBadge.className = 'goal-badge';
    } else {
      goalBadge.textContent = Math.abs(diff).toLocaleString() + ' words over limit';
      goalBadge.className = 'goal-badge exceeded';
    }
  }

  /**
   * Main recalculation and render cycle
   */
  function update() {
    const raw = textInput.value;
    const isExcluding = excludeToggle.checked;
    const styleFilter = styleSelect.value;

    const options = {
      styleFilter: styleFilter
    };

    const result = window.AcademicCitationParser.processText(raw, options);

    // If excluding is active, net words is stripped words; otherwise gross words
    const displayWords = isExcluding ? result.netWords : result.grossWords;
    const displayCitations = isExcluding ? result.citations : [];
    const excludedCount = isExcluding ? result.citations.length : 0;
    const excludedWords = isExcluding ? result.excludedCitationWords : 0;

    // Update Primary Dashboard Stats
    statNetWords.textContent = displayWords.toLocaleString();
    statGrossWords.textContent = result.grossWords.toLocaleString();
    statExcludedWords.textContent = '-' + excludedWords.toLocaleString();
    statCitationsCount.textContent = excludedCount + ' detected';

    // Update Secondary Stats
    statCharsWithSpace.textContent = (isExcluding ? result.netChars : result.grossChars).toLocaleString();
    statCharsNoSpace.textContent = result.netCharsNoSpaces.toLocaleString();
    statSentences.textContent = result.sentences.toLocaleString();

    // Reading time (academic average: ~200 words per minute)
    const minutes = Math.ceil(displayWords / 200);
    statReadingTime.textContent = displayWords === 0 ? '0 min' : minutes + ' min';

    // Goal tracker
    updateGoalTracker(displayWords);

    // Highlight Overlay & Backdrop Sync
    if (isExcluding && result.citations.length > 0) {
      editorBackdrop.innerHTML = window.AcademicCitationParser.buildHighlightedHtml(raw, options, escapeHtml);
      editorBackdrop.style.display = 'block';
      textInput.classList.add('highlight-active');
      syncScroll();
    } else {
      editorBackdrop.style.display = 'none';
      editorBackdrop.innerHTML = '';
      textInput.classList.remove('highlight-active');
    }

    // Citation Inspector Panel
    citationBadge.textContent = result.citations.length;

    if (result.citations.length > 0) {
      citationPanel.style.display = 'block';
      citationListBody.innerHTML = result.citations.map(function (c) {
        let tagClass = 'authordate';
        if (c.style.includes('IEEE') || c.style.includes('Numeric')) tagClass = 'numeric';
        if (c.style.includes('MLA')) tagClass = 'mla';

        return '<div class="citation-item">' +
          '<span class="citation-item-text">' + escapeHtml(c.text) + '</span>' +
          '<div class="citation-meta">' +
          '<span class="citation-style-tag ' + tagClass + '">' + escapeHtml(c.style) + '</span>' +
          '<span class="citation-deduction">-' + c.wordsCount + ' w</span>' +
          '</div>' +
          '</div>';
      }).join('');
    } else {
      if (raw.trim().length === 0) {
        citationPanel.style.display = 'none';
      } else {
        citationPanel.style.display = 'block';
        citationListBody.innerHTML = '<p style="font-size: 0.8125rem; color: #64748b;">No academic citations detected in this text.</p>';
      }
    }
  }

  // Event Listeners
  textInput.addEventListener('input', update);
  textInput.addEventListener('scroll', syncScroll);
  excludeToggle.addEventListener('change', function () {
    update();
    showToast(excludeToggle.checked ? 'Citation exclusion active' : 'Counting all words including citations');
  });
  styleSelect.addEventListener('change', update);
  goalInput.addEventListener('input', function () {
    const raw = textInput.value;
    const isExcluding = excludeToggle.checked;
    const result = window.AcademicCitationParser.processText(raw, { styleFilter: styleSelect.value });
    updateGoalTracker(isExcluding ? result.netWords : result.grossWords);
  });

  // Action: Copy Clean Text (with citations stripped)
  btnCopyClean.addEventListener('click', function () {
    const raw = textInput.value;
    if (!raw.trim()) {
      showToast('Nothing to copy');
      return;
    }

    const result = window.AcademicCitationParser.processText(raw, { styleFilter: styleSelect.value });
    const textToCopy = excludeToggle.checked ? result.cleanText : raw;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(function () {
        showToast(excludeToggle.checked ? 'Copied clean text (without citations)!' : 'Copied text to clipboard!');
      }).catch(function () {
        showToast('Unable to copy to clipboard');
      });
    } else {
      // Fallback
      const tempArea = document.createElement('textarea');
      tempArea.value = textToCopy;
      document.body.appendChild(tempArea);
      tempArea.select();
      document.execCommand('copy');
      document.body.removeChild(tempArea);
      showToast('Copied to clipboard!');
    }
  });

  // Action: Load Academic Sample
  btnLoadSample.addEventListener('click', function () {
    textInput.value = SAMPLE_TEXT;
    excludeToggle.checked = true;
    update();
    textInput.focus();
    showToast('Loaded sample academic text');
  });

  // Action: Clear
  btnClear.addEventListener('click', function () {
    if (!textInput.value) return;
    textInput.value = '';
    update();
    textInput.focus();
    showToast('Cleared editor');
  });

  // Initialize on page load
  update();

  // Expose update for debugging/testing
  window.AcademicWordCounter = {
    update: update
  };
})();
