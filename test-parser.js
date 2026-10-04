const parser = require('./js/parser.js');

let passed = 0;
let failed = 0;

function assert(condition, testName, details) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${testName}`);
  } else {
    failed++;
    console.error(`  FAIL: ${testName}`);
    if (details) console.error(`        Details:`, details);
  }
}

console.log('=== Academic Citation Parser Test Suite ===\n');

// 1. APA / Harvard tests
console.log('--- 1. Author-Date Citations (APA / Harvard) ---');
const authorDateTests = [
  '(Hutapea, 2025)',
  '(Hutapea & Doe, 2025)',
  '(Hutapea et al., 2025)',
  '(J. Li et al., 2025)',
  '(de Pablo et al., 2025)',
  '(de et al., 2024)',
  '(Cappelli, Bettaccini, et al., 2020)',
  '(Takač et al., 2021)',
  '(Liu et al., 2023; Wu et al., 2025)',
  '(Schopf & Scherf, 2021)',
  '(Smith, 2020, p. 12)',
  '(Smith, 2020, pp. 12-15)',
  '(Smith 2020: 45)',
  '(see Hutapea, 2025)',
  '(e.g., Hutapea, 2025; cf. Doe, 2020)'
];

for (const sample of authorDateTests) {
  const result = parser.findCitations(sample);
  assert(
    result.length === 1 && result[0].text === sample,
    `Match: ${sample}`,
    result
  );
}

// 2. IEEE / Numeric tests
console.log('\n--- 2. Numeric / Bracket Citations (IEEE / Vancouver) ---');
const numericTests = [
  '[1]',
  '[1, 2]',
  '[1-4]',
  '[1, 3, 5-8]',
  '[1, p. 25]',
  '[12, pp. 45-48]',
  '[see 1, 2]'
];

for (const sample of numericTests) {
  const result = parser.findCitations(sample);
  assert(
    result.length === 1 && result[0].text === sample && result[0].style.includes('IEEE'),
    `Match: ${sample}`,
    result
  );
}

// 3. MLA Author-Page tests
console.log('\n--- 3. Author-Page Citations (MLA) ---');
const mlaTests = [
  '(Smith 45)',
  '(Smith 45-50)',
  '(Smith and Jones 12-14)',
  '(Alvarez et al. 89)'
];

for (const sample of mlaTests) {
  const result = parser.findCitations(sample);
  assert(
    result.length === 1 && result[0].text === sample && result[0].style.includes('MLA'),
    `Match: ${sample}`,
    result
  );
}

// 4. Negative tests (Non-citations)
console.log('\n--- 4. Negative Tests (Must NOT match) ---');
const negativeTests = [
  '(for example)',
  '(3 items)',
  '(Table 1)',
  '(Figure 2)',
  '(100%)',
  '(10 mg/mL)',
  '[Figure 1]',
  '[Table 3]',
  '[emphasis added]',
  '[see details below]'
];

for (const sample of negativeTests) {
  const result = parser.findCitations(sample);
  assert(
    result.length === 0,
    `Reject: ${sample}`,
    result
  );
}

// 5. Full Academic Text verification
console.log('\n--- 5. Full Academic Text (User Sample) ---');
const paragraph1 = `Flour selection and the hydration level alter physical behavior and mixing parameters. At a 70% hydration level, grain composition directly influences kneading time and structural integrity. Plain flour achieves a smooth, elastic consistency after 11 minutes 49 seconds of handling, spelt flour required only 9 minutes 47 seconds. Spelt flour contains a higher proportion of monomeric gliadins relative to polymeric glutenins than common wheat flour (Takač et al., 2021). Because monomeric gliadin hydrates rapidly, spelt is characterized by higher extensibility and lower elasticity, facilitating rapid dough development in under 10 minutes. However, this lower proportion of polymeric glutenin reduces dough strength and results in a weaker, stickier network, directly accounting for the final texture, which is softer and rubbery. (Frakolaki et al., 2018). In contrast, whole wheat flour requires an extended duration exceeding 42 minutes 21 seconds. Insoluble dietary fiber, such as whole wheat flour, is defined by core functions derived from its strong water holding capacity and resistance to fermentation (J. Li et al., 2025). These insoluble dietary fibers compete strongly for available water, hydrating much slower than endosperm starch and gluten. Initially, the dough feels granular, dry, and stiff because the endosperm proteins lack water, until prolonged mechanical action forces moisture to disperse throughout the bran matrix. Dehydrated gluten results in a stiff, crumbly dough that fails to develop properly. Furthermore, coarse fiber particles disrupt the dough's viscoelastic properties and physically break the forming matrix, yielding a dense texture with a rustic character (Rosell et al., 2010). On the other hand, oat flour fails to form a cohesive dough because it lacks the necessary proteins for a continuous network (Chauhan et al., 2018). Gluten retains fermentation gases to adjust loaf volume and crumb softness (Monteiro et al., 2021). Without this protein matrix, dough loses cohesion and elasticity, resulting in dense or crumbly structures (Cappelli & Cini, 2021; de et al., 2024). The overall process depends on multiple parameters including temperature, speed, aeration, and hydration (Cappelli, Bettaccini, et al., 2020).`;

const paragraph2 = `Water content strictly dictates dough development and rheological stability. At 40% hydration, moisture was severely limited, meaning water molecules could not adequately replace protein-protein hydrogen bonds with water-protein bonds. The kneading took 17 minutes 42 seconds because mechanical shear had to force unhydrated flour particles to consolidate without adequate water and protein hydrogen bonding (Schopf & Scherf, 2021). Low hydration results in a dry, friable state. Optimal viscoelasticity is achieved at a 60% hydration level, as water plasticizes the glutenin and gliadin chains into a stretchable matrix without excessive dilution. This facilitates rapid disulfide cross linking, achieving standard development in the shortest recorded time of 8 minutes and 14 seconds. At 80% hydration level, the kneading time nearly doubled to 15 minutes and 37 seconds. Excess free water accumulated in the inter particle spaces, acting as a lubricant rather than a structural component and diluting local protein concentrations. This condition required prolonged mechanical energy to enable the hydrated chains to come into contact and form a cohesive network (Liu et al., 2023; Wu et al., 2025). At a hydration level of 100%, the water volume exceeds the dough's maximum water absorption capacity. This excess liquid separates the proteins to such an extent that an elastic network cannot form, resulting in an amorphous fluid paste (de Pablo et al., 2025).`;

const p1Result = parser.processText(paragraph1);
assert(p1Result.citations.length === 8, `Paragraph 1: Expected 8 citations, got ${p1Result.citations.length}`);

const p2Result = parser.processText(paragraph2);
assert(p2Result.citations.length === 3, `Paragraph 2: Expected 3 citations, got ${p2Result.citations.length}`);

console.log(`\n=== Final Results: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
