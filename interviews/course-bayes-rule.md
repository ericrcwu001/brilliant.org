# Bayes' Rule — Interview Pack (human-readable mirror)

> Canonical asset: `interviews/course-bayes-rule.json` (`version` 1.0.0). This `.md` is a generated mirror — do not hand-edit; rebuild from the JSON.
> **Concept:** Bayes' Rule (`course-bayes-rule`) · **Engine:** `src/engine/bayes.ts` · **Anchor:** Green Book Ch.4 §Conditional Probability & Bayes' Formula, p.37–42.
> **Status:** committed-but-NOT-deployed (dormant capstone asset; never seeded).

## Pool summary

- **Total questions:** 57 — **all 100% engine-verified** (every answer recomputed by `src/engine/bayes.ts` and asserted via `formatRational`).
- **By tier:** Hard 12 · Harder 36 · Brutal 9.
- **Engine-backed templates:** 9 (51 verified parameterizations) · **Free-form showcase:** 6.
- **Fingerprints:** all unique (57/57).

### Engine-backed templates

| template | engine call | parameterizations | what it asks |
|----------|-------------|:-:|--------------|
| `screening-ppv` | `bayesUpdate(prevalence, sensitivity, 1−specificity)` | 8 | P(condition \| positive test) — base-rate / PPV screening |
| `spam-precision` | `bayesUpdate(baseRate, recall, falsePositiveRate)` | 5 | precision of a flag under class imbalance (spam / fraud / moderation / anomaly) |
| `two-coins-sequential` | `sequentialPosterior(1/2, 1, 1/2, k)` | 6 | fair vs double-headed coin after k heads → 2^k/(2^k+1) |
| `rare-coin-n` | `sequentialPosterior(1/N, 1, 1/2, k)` | 7 | N coins, one double-headed, k heads → 2^k/(2^k+N−1) (GB 1000-coins) |
| `odds-multi-evidence` | `oddsToProb(∏ posteriorOdds(priorOdds, LR_i))` | 6 | stacking independent tests/signals in odds form (LR+ and LR−) |
| `two-children` | `bayesUpdate(1/2^n, 1, P(≥1 boy \| not all boys))` | 4 | Green Book boys-and-girls conditioning (≥1 boy vs a specific boy) |
| `two-urns` | `bayesUpdate(P(A), P(red\|A), P(red\|B))` | 5 | pick an urn, draw a color, posterior on the urn |
| `multi-source-defect` | `bayesPosterior(shares, defectRates)[j]` | 5 | n factories/machines/suppliers, a defective item → P(source j) |
| `natural-frequency-counts` | `naturalFrequencies(prevalence, sensitivity, specificity, population)[cell]` | 5 | confusion-grid counts and PPV as whole numbers |

## Questions by tier

### Hard (12)

1. **[screening-ppv-1pct-99-99]** A disease affects 1 in 100 people. A test is 99% sensitive (flags 99% of the sick) and 99% specific (clears 99% of the healthy). You test positive. What is the probability you actually have the condition, given the positive result? Give the exact fraction, and explain whether it should worry you.
   - **Answer (exact):** `1/2`  ·  **engine:** `bayesUpdate`  ·  **template:** `screening-ppv`
   - **Source:** The canonical base-rate / PPV interview question. Sources: quantblueprint.com/glossary/bayes-theorem; nishchalnishant.gitbook.io 'Canonical Stats Questions' (both state 50%). GB-anchored: Green Book p.37–38 §Conditional Probability & Bayes' Formula.

2. **[screening-ppv-50pct-99-99]** A 99%/99% test is used where the prior is already even — half the tested patients have the disease (a strongly pre-selected group). The result is positive. What is the probability you actually have the condition, given the positive result? Give the exact fraction, and explain whether it should worry you.
   - **Answer (exact):** `99/100`  ·  **engine:** `bayesUpdate`  ·  **template:** `screening-ppv`
   - **Source:** Contrast case showing PPV ≈ accuracy only when the prior is even. GB-anchored: Green Book p.37–38 §Bayes' Formula.

3. **[two-coins-k1]** Two coins sit in a bag: one fair, one double-headed (heads on both sides). You draw one at random and flip it, getting heads. What is the probability you are holding the double-headed coin? Exact fraction.
   - **Answer (exact):** `2/3`  ·  **engine:** `sequentialPosterior`  ·  **template:** `two-coins-sequential`
   - **Source:** Two-coin Bayes classic: stats.stackexchange.com/questions/514627; mathproblems.info/prob16s.htm (both state 2/3 for one head). GB-anchored: Green Book p.38 §"Unfair coin".

4. **[two-coins-k2]** Two coins sit in a bag: one fair, one double-headed (heads on both sides). You draw one at random and flip it, getting heads 2 times in a row. What is the probability you are holding the double-headed coin? Exact fraction.
   - **Answer (exact):** `4/5`  ·  **engine:** `sequentialPosterior`  ·  **template:** `two-coins-sequential`
   - **Source:** Two-coin Bayes classic: stats.stackexchange.com/questions/514627; mathproblems.info/prob16s.htm (both state 2/3 for one head). GB-anchored: Green Book p.38 §"Unfair coin".

5. **[rare-coin-N1000-k1]** You are given 1000 coins. Exactly one is double-headed; the other 999 are fair. You pick one at random and toss it 1 time — every toss is heads. What is the probability you chose the double-headed coin? Exact fraction.
   - **Answer (exact):** `2/1001`  ·  **engine:** `sequentialPosterior`  ·  **template:** `rare-coin-n`
   - **Source:** Green Book p.38 §"Unfair coin" (1000 coins, one double-headed, 10 heads → 1024/2023), generalized to N coins and k heads.

6. **[odds-1pct-one-99test]** A disease has prior odds 1 : 99 (1% prevalence). A test with likelihood ratio 99 for "sick" (99% sensitive, 99% specific) comes back positive once. Working in odds form, where does your belief land? Give the exact probability and show the odds update.
   - **Answer (exact):** `1/2`  ·  **engine:** `oddsUpdateProb`  ·  **template:** `odds-multi-evidence`
   - **Source:** Odds-form view of the base-rate trap (one 99% test on a 1% disease → 50%). quantblueprint.com/glossary/bayes-theorem. GB-anchored: Green Book p.38.

7. **[two-children-2-atleast1boy]** A family has two children. You learn that at least one of them is a boy. What is the probability that both children are boys? Exact fraction, and explain the subtlety.
   - **Answer (exact):** `1/3`  ·  **engine:** `bayesUpdate`  ·  **template:** `two-children`
   - **Source:** Green Book p.37–38 §Conditional Probability and Bayes' Formula (boys-and-girls; at least one boy → 1/3).

8. **[two-children-2-specificboy]** A family has two children. You meet one of them on the street and he is a boy. What is the probability that both children are boys? Exact fraction, and explain why it differs from the "at least one is a boy" version.
   - **Answer (exact):** `1/2`  ·  **engine:** `bayesUpdate`  ·  **template:** `two-children`
   - **Source:** Green Book p.37–38 §Conditional Probability and Bayes' Formula (boys-and-girls; you meet a boy → 1/2).

9. **[two-urns-2r1b-1r2b-even]** Urn A holds 2 red and 1 blue balls; urn B holds 1 red and 2 blue. You pick an urn at random (50/50), then draw one ball — it is red. What is the probability the ball came from urn A? Exact fraction.
   - **Answer (exact):** `2/3`  ·  **engine:** `bayesUpdate`  ·  **template:** `two-urns`
   - **Source:** Standard textbook conditional-probability / two-urn Bayes problem; same structure as the two-coin update. GB-anchored: Green Book p.37 §Bayes' Formula.

10. **[defect-2factory-pA]** An item is produced by one of several sources, then found DEFECTIVE. Sources: Factory A (60% of output, 2% defective); Factory B (40% of output, 5% defective). Given that a randomly chosen item is defective, what is the probability it came from Factory A? Exact fraction.
   - **Answer (exact):** `3/8`  ·  **engine:** `bayesPosterior`  ·  **template:** `multi-source-defect`
   - **Source:** Classic factories/machines/suppliers Bayes problem (law of total probability + Bayes). GB-anchored: Green Book p.37 §Bayes' Formula.

11. **[nf-1pct-99-99-10000-fp]** Picture exactly 10,000 people screened for a condition with prevalence 1/100, using a test that is 99/100 sensitive and 99/100 specific. Filling in the confusion grid, how many of the 10,000 are healthy people who nonetheless test positive (false positives)? Exact count.
   - **Answer (exact):** `99`  ·  **engine:** `naturalFrequencies`  ·  **template:** `natural-frequency-counts`
   - **Source:** Natural-frequency / confusion-matrix method (Gigerenzer 1995 — express Bayes as whole-number counts). GB-anchored: Green Book p.37–38 §Bayes' Formula.

12. **[nf-1pct-99-99-10000-ppv]** Picture exactly 10,000 people screened for a condition with prevalence 1/100, using a test that is 99/100 sensitive and 99/100 specific. Filling in the confusion grid, what fraction of all the positive tests are true positives (the PPV)? Exact fraction.
   - **Answer (exact):** `1/2`  ·  **engine:** `naturalFrequencies`  ·  **template:** `natural-frequency-counts`
   - **Source:** Natural-frequency / confusion-matrix method (Gigerenzer 1995 — express Bayes as whole-number counts). GB-anchored: Green Book p.37–38 §Bayes' Formula.

### Harder (36)

1. **[screening-ppv-10pct-99-99]** Take that same 99%-sensitive, 99%-specific test, but run it in a clinic population where 1 in 10 patients actually has the disease. A patient tests positive. What is the probability you actually have the condition, given the positive result? Give the exact fraction, and explain whether it should worry you.
   - **Answer (exact):** `11/12`  ·  **engine:** `bayesUpdate`  ·  **template:** `screening-ppv`
   - **Source:** Post-test-probability table, PMC3055966 (10% prevalence → 91.7%). GB-anchored: Green Book p.37–38 §Conditional Probability & Bayes' Formula.

2. **[screening-ppv-25pct-99-99]** Same 99%/99% test, now applied to a symptomatic subgroup where 1 in 4 truly has the disease. The result is positive. What is the probability you actually have the condition, given the positive result? Give the exact fraction, and explain whether it should worry you.
   - **Answer (exact):** `33/34`  ·  **engine:** `bayesUpdate`  ·  **template:** `screening-ppv`
   - **Source:** Post-test-probability table, PMC3055966 (25% prevalence → 97.1%). GB-anchored: Green Book p.37–38 §Conditional Probability & Bayes' Formula.

3. **[screening-ppv-1pct-95-95]** A cheaper test is only 95% sensitive and 95% specific. Used on the same 1-in-100 disease, it comes back positive. What is the probability you actually have the condition, given the positive result? Give the exact fraction, and explain whether it should worry you.
   - **Answer (exact):** `19/118`  ·  **engine:** `bayesUpdate`  ·  **template:** `screening-ppv`
   - **Source:** A. Downey, BiteSizeBayes 05 (Bayesville, ~16%): allendowney.github.io/BiteSizeBayes/05_test.html. GB-anchored: Green Book p.37–38 §Bayes' Formula.

4. **[screening-ppv-0p1pct-99-99]** A rare cancer strikes 1 in 1,000. A 99%-sensitive, 99%-specific screen returns positive. What is the probability you actually have the condition, given the positive result? Give the exact fraction, and explain whether it should worry you.
   - **Answer (exact):** `11/122`  ·  **engine:** `bayesUpdate`  ·  **template:** `screening-ppv`
   - **Source:** Base-rate / PPV classic at very low prevalence (false-positive paradox). en.wikipedia.org/wiki/Base_rate_fallacy. GB-anchored: Green Book p.37–38 §Bayes' Formula.

5. **[screening-ppv-2pct-90-90]** An anti-doping test is 90% sensitive and 90% specific. Doping prevalence among tested athletes is 2%. An athlete tests positive. What is the probability you actually have the condition, given the positive result? Give the exact fraction, and explain whether it should worry you.
   - **Answer (exact):** `9/58`  ·  **engine:** `bayesUpdate`  ·  **template:** `screening-ppv`
   - **Source:** Drug-testing variant of the base-rate / PPV question. en.wikipedia.org/wiki/Base_rate_fallacy. GB-anchored: Green Book p.37–38 §Bayes' Formula.

6. **[screening-ppv-5pct-99-95]** A screen is 99% sensitive but only 95% specific (it over-flags). Prevalence is 5%. The result is positive. What is the probability you actually have the condition, given the positive result? Give the exact fraction, and explain whether it should worry you.
   - **Answer (exact):** `99/194`  ·  **engine:** `bayesUpdate`  ·  **template:** `screening-ppv`
   - **Source:** Asymmetric sensitivity/specificity PPV variant (specificity drives PPV). GB-anchored: Green Book p.37–38 §Bayes' Formula; cf. PMC3055966.

7. **[precision-spam-20pct-99-2]** A spam filter catches 99% of spam (recall) but also flags 2% of legitimate mail (false-positive rate). 20% of incoming mail is spam. An email lands in the spam folder. What is the probability the flagged item is the positive class (the model's precision on this flag)? Give the exact fraction and say whether you'd ship this alert to a human.
   - **Answer (exact):** `99/107`  ·  **engine:** `bayesUpdate`  ·  **template:** `spam-precision`
   - **Source:** Precision under class imbalance (false-positive paradox), spam-filter example: en.wikipedia.org/wiki/Base_rate_fallacy. GB-anchored: Green Book p.37 §Bayes' Formula.

8. **[precision-mod-30pct-90-5]** A content-moderation classifier flags 90% of violating posts and 5% of clean posts. 30% of posts in the queue actually violate policy. A post is flagged. What is the probability the flagged item is the positive class (the model's precision on this flag)? Give the exact fraction and say whether you'd ship this alert to a human.
   - **Answer (exact):** `54/61`  ·  **engine:** `bayesUpdate`  ·  **template:** `spam-precision`
   - **Source:** Precision/recall under imbalance (moderation framing). en.wikipedia.org/wiki/Precision_and_recall. GB-anchored: Green Book p.37 §Bayes' Formula.

9. **[precision-fraud-1pct-80-0p1]** A fraud model has only 80% recall but a very low 0.1% false-positive rate. 1% of transactions are fraudulent. It flags a transaction. What is the probability the flagged item is the positive class (the model's precision on this flag)? Give the exact fraction and say whether you'd ship this alert to a human.
   - **Answer (exact):** `800/899`  ·  **engine:** `bayesUpdate`  ·  **template:** `spam-precision`
   - **Source:** Precision when the false-positive rate is tiny (contrast to the high-FPR case). en.wikipedia.org/wiki/Precision_and_recall. GB-anchored: Green Book p.37 §Bayes' Formula.

10. **[precision-anomaly-25pct-70-10]** An intrusion-detection model has 70% recall and a 10% false-positive rate. 25% of sessions in the test set are malicious. It raises an alert. What is the probability the flagged item is the positive class (the model's precision on this flag)? Give the exact fraction and say whether you'd ship this alert to a human.
   - **Answer (exact):** `7/10`  ·  **engine:** `bayesUpdate`  ·  **template:** `spam-precision`
   - **Source:** Precision under class imbalance (security/anomaly framing). en.wikipedia.org/wiki/Precision_and_recall. GB-anchored: Green Book p.37 §Bayes' Formula.

11. **[two-coins-k3]** Two coins sit in a bag: one fair, one double-headed (heads on both sides). You draw one at random and flip it, getting heads 3 times in a row. What is the probability you are holding the double-headed coin? Exact fraction.
   - **Answer (exact):** `8/9`  ·  **engine:** `sequentialPosterior`  ·  **template:** `two-coins-sequential`
   - **Source:** Two-coin Bayes classic: stats.stackexchange.com/questions/514627; mathproblems.info/prob16s.htm (both state 2/3 for one head). GB-anchored: Green Book p.38 §"Unfair coin".

12. **[two-coins-k4]** Two coins sit in a bag: one fair, one double-headed (heads on both sides). You draw one at random and flip it, getting heads 4 times in a row. What is the probability you are holding the double-headed coin? Exact fraction.
   - **Answer (exact):** `16/17`  ·  **engine:** `sequentialPosterior`  ·  **template:** `two-coins-sequential`
   - **Source:** Two-coin Bayes classic: stats.stackexchange.com/questions/514627; mathproblems.info/prob16s.htm (both state 2/3 for one head). GB-anchored: Green Book p.38 §"Unfair coin".

13. **[two-coins-k5]** Two coins sit in a bag: one fair, one double-headed (heads on both sides). You draw one at random and flip it, getting heads 5 times in a row. What is the probability you are holding the double-headed coin? Exact fraction.
   - **Answer (exact):** `32/33`  ·  **engine:** `sequentialPosterior`  ·  **template:** `two-coins-sequential`
   - **Source:** Two-coin Bayes classic: stats.stackexchange.com/questions/514627; mathproblems.info/prob16s.htm (both state 2/3 for one head). GB-anchored: Green Book p.38 §"Unfair coin".

14. **[two-coins-k6]** Two coins sit in a bag: one fair, one double-headed (heads on both sides). You draw one at random and flip it, getting heads 6 times in a row. What is the probability you are holding the double-headed coin? Exact fraction.
   - **Answer (exact):** `64/65`  ·  **engine:** `sequentialPosterior`  ·  **template:** `two-coins-sequential`
   - **Source:** Two-coin Bayes classic: stats.stackexchange.com/questions/514627; mathproblems.info/prob16s.htm (both state 2/3 for one head). GB-anchored: Green Book p.38 §"Unfair coin".

15. **[rare-coin-N1000-k5]** You are given 1000 coins. Exactly one is double-headed; the other 999 are fair. You pick one at random and toss it 5 times — every toss is heads. What is the probability you chose the double-headed coin? Exact fraction.
   - **Answer (exact):** `32/1031`  ·  **engine:** `sequentialPosterior`  ·  **template:** `rare-coin-n`
   - **Source:** Green Book p.38 §"Unfair coin" (1000 coins, one double-headed, 10 heads → 1024/2023), generalized to N coins and k heads.

16. **[rare-coin-N1000-k9]** You are given 1000 coins. Exactly one is double-headed; the other 999 are fair. You pick one at random and toss it 9 times — every toss is heads. What is the probability you chose the double-headed coin? Exact fraction.
   - **Answer (exact):** `512/1511`  ·  **engine:** `sequentialPosterior`  ·  **template:** `rare-coin-n`
   - **Source:** Green Book p.38 §"Unfair coin" (1000 coins, one double-headed, 10 heads → 1024/2023), generalized to N coins and k heads.

17. **[rare-coin-N1000-k10]** You are given 1000 coins. Exactly one is double-headed; the other 999 are fair. You pick one at random and toss it 10 times — every toss is heads. What is the probability you chose the double-headed coin? Exact fraction.
   - **Answer (exact):** `1024/2023`  ·  **engine:** `sequentialPosterior`  ·  **template:** `rare-coin-n`
   - **Source:** Green Book p.38 §"Unfair coin" (1000 coins, one double-headed, 10 heads → 1024/2023), generalized to N coins and k heads.

18. **[rare-coin-N64-k3]** You are given 64 coins. Exactly one is double-headed; the other 63 are fair. You pick one at random and toss it 3 times — every toss is heads. What is the probability you chose the double-headed coin? Exact fraction.
   - **Answer (exact):** `8/71`  ·  **engine:** `sequentialPosterior`  ·  **template:** `rare-coin-n`
   - **Source:** Green Book p.38 §"Unfair coin" (1000 coins, one double-headed, 10 heads → 1024/2023), generalized to N coins and k heads.

19. **[rare-coin-N100-k7]** You are given 100 coins. Exactly one is double-headed; the other 99 are fair. You pick one at random and toss it 7 times — every toss is heads. What is the probability you chose the double-headed coin? Exact fraction.
   - **Answer (exact):** `128/227`  ·  **engine:** `sequentialPosterior`  ·  **template:** `rare-coin-n`
   - **Source:** Green Book p.38 §"Unfair coin" (1000 coins, one double-headed, 10 heads → 1024/2023), generalized to N coins and k heads.

20. **[odds-1pct-two-99tests]** Same 1% disease (prior odds 1 : 99). You take TWO independent 99%/99% tests; both are positive. Working in odds form, where does your belief land? Give the exact probability and show the odds update.
   - **Answer (exact):** `99/100`  ·  **engine:** `oddsUpdateProb`  ·  **template:** `odds-multi-evidence`
   - **Source:** Two independent positive tests → 99%. quantblueprint.com/glossary/bayes-theorem (LR 99 per test; 1/99 × 99 × 99 = 99). GB-anchored: Green Book p.38.

21. **[odds-10pct-two-LR4p5]** A 10% condition (prior odds 1 : 9). A test is 90% sensitive and 80% specific, so its positive likelihood ratio is 0.9 / 0.2 = 9/2. You get two independent positives. Working in odds form, where does your belief land? Give the exact probability and show the odds update.
   - **Answer (exact):** `9/13`  ·  **engine:** `oddsUpdateProb`  ·  **template:** `odds-multi-evidence`
   - **Source:** Diagnostic likelihood-ratio stacking (LR+ = sens/(1−spec)); standard evidence-based-medicine / quant signal-stacking. GB-anchored: Green Book p.38.

22. **[two-children-3-atleast1boy]** A family has three children, at least one of whom is a boy. What is the probability that all three are boys? Exact fraction.
   - **Answer (exact):** `1/7`  ·  **engine:** `bayesUpdate`  ·  **template:** `two-children`
   - **Source:** Green Book p.37–38 §Conditional Probability (boys-and-girls), extended to three children (P(all boys|≥1 boy) = 1/7).

23. **[two-children-4-atleast1boy]** A family has four children, at least one of whom is a boy. What is the probability that all four are boys? Exact fraction.
   - **Answer (exact):** `1/15`  ·  **engine:** `bayesUpdate`  ·  **template:** `two-children`
   - **Source:** Green Book p.37–38 §Conditional Probability (boys-and-girls), extended to four children (P(all boys|≥1 boy) = 1/15).

24. **[two-urns-3r1b-1r1b-even]** Urn A holds 3 red and 1 blue balls; urn B holds 1 red and 1 blue. You pick an urn at random (50/50), then draw one ball — it is red. What is the probability the ball came from urn A? Exact fraction.
   - **Answer (exact):** `3/5`  ·  **engine:** `bayesUpdate`  ·  **template:** `two-urns`
   - **Source:** Standard textbook conditional-probability / two-urn Bayes problem; same structure as the two-coin update. GB-anchored: Green Book p.37 §Bayes' Formula.

25. **[two-urns-7r3b-2r8b-even]** Urn A holds 7 red and 3 blue balls; urn B holds 2 red and 8 blue. You pick an urn at random (50/50), then draw one ball — it is red. What is the probability the ball came from urn A? Exact fraction.
   - **Answer (exact):** `7/9`  ·  **engine:** `bayesUpdate`  ·  **template:** `two-urns`
   - **Source:** Standard textbook conditional-probability / two-urn Bayes problem; same structure as the two-coin update. GB-anchored: Green Book p.37 §Bayes' Formula.

26. **[two-urns-2r1b-1r2b-priorA-1of3]** Urn A holds 2 red and 1 blue balls; urn B holds 1 red and 2 blue. You pick urn A with probability 1/3 and urn B otherwise, then draw one ball — it is red. What is the probability the ball came from urn A? Exact fraction.
   - **Answer (exact):** `1/2`  ·  **engine:** `bayesUpdate`  ·  **template:** `two-urns`
   - **Source:** Standard textbook conditional-probability / two-urn Bayes problem; same structure as the two-coin update. GB-anchored: Green Book p.37 §Bayes' Formula.

27. **[two-urns-1r3b-3r1b-even]** Urn A holds 1 red and 3 blue balls; urn B holds 3 red and 1 blue. You pick an urn at random (50/50), then draw one ball — it is red. What is the probability the ball came from urn A? Exact fraction.
   - **Answer (exact):** `1/4`  ·  **engine:** `bayesUpdate`  ·  **template:** `two-urns`
   - **Source:** Standard textbook conditional-probability / two-urn Bayes problem; same structure as the two-coin update. GB-anchored: Green Book p.37 §Bayes' Formula.

28. **[defect-2factory-pB]** An item is produced by one of several sources, then found DEFECTIVE. Sources: Factory A (60% of output, 2% defective); Factory B (40% of output, 5% defective). Given that a randomly chosen item is defective, what is the probability it came from Factory B? Exact fraction.
   - **Answer (exact):** `5/8`  ·  **engine:** `bayesPosterior`  ·  **template:** `multi-source-defect`
   - **Source:** Classic factories/machines/suppliers Bayes problem (law of total probability + Bayes). GB-anchored: Green Book p.37 §Bayes' Formula.

29. **[defect-3machine-pM1]** An item is produced by one of several sources, then found DEFECTIVE. Sources: Machine 1 (50%, 1% defective); Machine 2 (30%, 2% defective); Machine 3 (20%, 3% defective). Given that a randomly chosen item is defective, what is the probability it came from Machine 1? Exact fraction.
   - **Answer (exact):** `5/17`  ·  **engine:** `bayesPosterior`  ·  **template:** `multi-source-defect`
   - **Source:** Classic factories/machines/suppliers Bayes problem (law of total probability + Bayes). GB-anchored: Green Book p.37 §Bayes' Formula.

30. **[defect-3machine-pM3]** An item is produced by one of several sources, then found DEFECTIVE. Sources: Machine 1 (50%, 1% defective); Machine 2 (30%, 2% defective); Machine 3 (20%, 3% defective). Given that a randomly chosen item is defective, what is the probability it came from Machine 3? Exact fraction.
   - **Answer (exact):** `6/17`  ·  **engine:** `bayesPosterior`  ·  **template:** `multi-source-defect`
   - **Source:** Classic factories/machines/suppliers Bayes problem (law of total probability + Bayes). GB-anchored: Green Book p.37 §Bayes' Formula.

31. **[nf-1pct-99-99-10000-tn]** Picture exactly 10,000 people screened for a condition with prevalence 1/100, using a test that is 99/100 sensitive and 99/100 specific. Filling in the confusion grid, how many true negatives are there (healthy and correctly cleared)? Exact count.
   - **Answer (exact):** `9801`  ·  **engine:** `naturalFrequencies`  ·  **template:** `natural-frequency-counts`
   - **Source:** Natural-frequency / confusion-matrix method (Gigerenzer 1995 — express Bayes as whole-number counts). GB-anchored: Green Book p.37–38 §Bayes' Formula.

32. **[nf-10pct-99-99-10000-fp]** Picture exactly 10,000 people screened for a condition with prevalence 1/10, using a test that is 99/100 sensitive and 99/100 specific. Filling in the confusion grid, how many false positives are there? Exact count.
   - **Answer (exact):** `90`  ·  **engine:** `naturalFrequencies`  ·  **template:** `natural-frequency-counts`
   - **Source:** Natural-frequency / confusion-matrix method (Gigerenzer 1995 — express Bayes as whole-number counts). GB-anchored: Green Book p.37–38 §Bayes' Formula.

33. **[nf-1pct-90-90-100000-ppv]** Picture exactly 100,000 people screened for a condition with prevalence 1/100, using a test that is 9/10 sensitive and 9/10 specific. Filling in the confusion grid, what is the PPV (fraction of positives that are truly sick)? Exact fraction.
   - **Answer (exact):** `1/12`  ·  **engine:** `naturalFrequencies`  ·  **template:** `natural-frequency-counts`
   - **Source:** Natural-frequency / confusion-matrix method (Gigerenzer 1995 — express Bayes as whole-number counts). GB-anchored: Green Book p.37–38 §Bayes' Formula.

34. **[showcase-taxicab]** In a city, 85% of cabs are Green and 15% are Blue. A cab is involved in a hit-and-run at night. A witness identifies it as Blue. Tested under the same conditions, the witness is correct 80% of the time (and wrong 20%). What is the probability the cab really was Blue? Exact fraction.
   - **Answer (exact):** `12/29`  ·  **engine:** `bayesUpdate`  ·  *free-form*
   - **Source:** Tversky & Kahneman (1980/1982), the taxicab base-rate problem. en.wikipedia.org/wiki/Base_rate_fallacy. GB-anchored: Green Book p.37 §Bayes' Formula.

35. **[showcase-monty-hall]** Three doors; a car behind one, goats behind the other two. You pick Door 1. The host — who knows where the car is and always opens a different door revealing a goat — opens Door 3. Treating the host's choice as evidence, what is the probability the car is behind Door 2 (i.e. that switching wins)? Exact fraction, with the conditioning made explicit.
   - **Answer (exact):** `2/3`  ·  **engine:** `bayesPosterior`  ·  *free-form*
   - **Source:** Monty Hall problem (host's action is informative). Green Book p.40 (Monty Hall → 2/3); en.wikipedia.org/wiki/Monty_Hall_problem.

36. **[showcase-bertrand-box]** Three cards: one black on both sides (BB), one white on both sides (WW), one black on one side and white on the other (BW). You draw a card at random, look at one uniformly-random face, and it is black. What is the probability the OTHER side is also black? Exact fraction — beware the "two cards left, so 1/2" trap.
   - **Answer (exact):** `2/3`  ·  **engine:** `bayesPosterior`  ·  *free-form*
   - **Source:** Bertrand's box / three-card paradox. en.wikipedia.org/wiki/Bertrand%27s_box_paradox. GB-anchored: Green Book p.37 §Bayes' Formula.

### Brutal (9)

1. **[precision-fraud-0p1pct-95-1]** A credit-card fraud model has 95% recall and a 1% false-positive rate. Only 1 in 1,000 transactions is fraudulent. The model flags a transaction. What is the probability the flagged item is the positive class (the model's precision on this flag)? Give the exact fraction and say whether you'd ship this alert to a human.
   - **Answer (exact):** `95/1094`  ·  **engine:** `bayesUpdate`  ·  **template:** `spam-precision`
   - **Source:** Class-imbalance precision (why "99% accurate" fraud models still drown in false alarms). en.wikipedia.org/wiki/Base_rate_fallacy. GB-anchored: Green Book p.37 §Bayes' Formula.

2. **[rare-coin-N1000-k20]** You are given 1000 coins. Exactly one is double-headed; the other 999 are fair. You pick one at random and toss it 20 times — every toss is heads. What is the probability you chose the double-headed coin? Exact fraction.
   - **Answer (exact):** `1048576/1049575`  ·  **engine:** `sequentialPosterior`  ·  **template:** `rare-coin-n`
   - **Source:** Green Book p.38 §"Unfair coin" (1000 coins, one double-headed, 10 heads → 1024/2023), generalized to N coins and k heads.

3. **[odds-1pct-three-99tests]** Same 1% disease (prior odds 1 : 99). THREE independent 99%/99% tests all come back positive. Working in odds form, where does your belief land? Give the exact probability and show the odds update.
   - **Answer (exact):** `9801/9802`  ·  **engine:** `oddsUpdateProb`  ·  **template:** `odds-multi-evidence`
   - **Source:** Compounding independent evidence (three positive 99% tests). quantblueprint.com/glossary/bayes-theorem. GB-anchored: Green Book p.38.

4. **[odds-1pct-pos-then-neg]** Same 1% disease (prior odds 1 : 99), one 99%/99% test positive, then a second independent 99%/99% test NEGATIVE. Working in odds form, where does your belief land? Give the exact probability and show the odds update.
   - **Answer (exact):** `1/100`  ·  **engine:** `oddsUpdateProb`  ·  **template:** `odds-multi-evidence`
   - **Source:** Conflicting evidence in odds form (a positive then a negative with sens=spec returns you to the base rate). GB-anchored: Green Book p.38 §Bayes' Formula.

5. **[odds-2pct-two-99tests]** A 2% disease (prior odds 1 : 49). Two independent 99%/99% tests are both positive. Working in odds form, where does your belief land? Give the exact probability and show the odds update.
   - **Answer (exact):** `9801/9850`  ·  **engine:** `oddsUpdateProb`  ·  **template:** `odds-multi-evidence`
   - **Source:** Odds-form stacking at a different base rate. quantblueprint.com/glossary/bayes-theorem. GB-anchored: Green Book p.38.

6. **[defect-3supplier-pS1]** An item is produced by one of several sources, then found DEFECTIVE. Sources: Supplier 1 (25% of parts, 5% defective); Supplier 2 (20%, 3% defective); Supplier 3 (55%, 1% defective). Given that a randomly chosen item is defective, what is the probability it came from Supplier 1? Exact fraction.
   - **Answer (exact):** `25/48`  ·  **engine:** `bayesPosterior`  ·  **template:** `multi-source-defect`
   - **Source:** Classic factories/machines/suppliers Bayes problem (law of total probability + Bayes). GB-anchored: Green Book p.37 §Bayes' Formula.

7. **[showcase-1000coin-cross-half]** You have 1,000 coins: one is double-headed, the other 999 are fair. You pick one at random and start flipping; it keeps coming up heads. What is the SMALLEST number of consecutive heads after which the chosen coin is more likely than not to be the double-headed one? Justify the threshold.
   - **Answer (exact):** `10`  ·  **engine:** `smallestKCross`  ·  *free-form*
   - **Source:** Green Book p.38 §"Unfair coin" (solve 2^k > 999 ⇒ k = 10; the 10th head is the one that crosses ½).

8. **[showcase-1000coin-cross-99]** Same setup — 1,000 coins, one double-headed, 999 fair, chosen at random and flipping heads repeatedly. What is the smallest number of consecutive heads after which you are at least 99% sure you hold the double-headed coin?
   - **Answer (exact):** `17`  ·  **engine:** `smallestKCross`  ·  *free-form*
   - **Source:** Green Book p.38 §"Unfair coin", extended (solve 2^k/(2^k+999) ≥ 99/100 ⇒ 2^k ≥ 98,901 ⇒ k = 17).

9. **[showcase-prosecutors-fallacy]** A DNA test has a random-match probability of 1 in 1,000,000 and never misses a true match. A suspect is one of 10,001 people who could equally have been the source (so your prior that this particular person is the source is 1/10,001). The suspect's DNA matches. What is the probability the suspect is actually the source? Exact fraction — and name the fallacy if you answered "1 − 1/1,000,000".
   - **Answer (exact):** `100/101`  ·  **engine:** `bayesUpdate`  ·  *free-form*
   - **Source:** Prosecutor's fallacy / cold-hit DNA Bayes problem. en.wikipedia.org/wiki/Prosecutor%27s_fallacy. GB-anchored: Green Book p.37 §Bayes' Formula.

---

## Interviewer prompt

```text
# Bayes' Rule — AI Quant Interviewer (interviewer prompt template)

You are a SENIOR QUANTITATIVE INTERVIEWER at a top trading desk (think Jane Street / Citadel / IMC), running a live probability interview on conditional probability and Bayes' rule. You are professional, probing, and fair — but you keep the candidate under realistic time pressure and you do not hand out the answer.

The platform injects ONE question per turn from the engine-verified pool (or the generator). For the current question you receive, as ground truth:
- PROMPT: {{PROMPT}}
- TIER: {{TIER}}            (hard | harder | brutal)
- SOURCE: {{SOURCE}}        (context only — do not read it aloud)
- HIDDEN.ANSWER: {{HIDDEN_ANSWER}}            (exact fraction; NEVER reveal)
- HIDDEN.APPROACHES: {{HIDDEN_APPROACHES}}    (accepted solution paths)
- HIDDEN.WRONG_TURNS: {{HIDDEN_WRONG_TURNS}}  (common misconceptions to watch for)
- HIDDEN.HINT_LADDER: {{HIDDEN_HINT_LADDER}}  (rung 1 nudge → rung 2 stronger → rung 3 near-reveal)
- HIDDEN.RUBRIC: {{HIDDEN_RUBRIC}}            (correctness / approach / rigor / communication / speed)
- FOLLOW_UPS: {{FOLLOW_UPS}}

## Grounding clause (CRITICAL — keeps you honest)
Treat HIDDEN.ANSWER and HIDDEN.APPROACHES as the ONLY source of mathematical truth. Do NOT re-derive, re-compute, or "double-check" the math yourself — your arithmetic is not trusted; the engine-verified record is. Grade the candidate strictly against HIDDEN.RUBRIC. If the candidate's exact fraction equals HIDDEN.ANSWER (in any equivalent reduced form), it is correct; if it does not, it is not — never argue them into or out of the engine's answer with your own derivation.

## Protocol
1. Present exactly ONE question at a time — read PROMPT verbatim, then stop and let them work.
2. Make them THINK ALOUD. Ask "what's your prior?", "what's the likelihood of this evidence under each hypothesis?", "what are you conditioning on?" Insist on reasoning, not just a number.
3. NEVER reveal the answer, the fraction, or any rung of the hint ladder unprompted. Do not confirm partial numbers early.
4. Probe assumptions and edge cases: independence, what the evidence actually says (P(E|H) vs P(H|E)), base rates, normalization, and whether the magnitude is believable.
5. Escalating hints ONLY when the candidate is genuinely stuck (silent, going in circles, or has asked). Release HINT_LADDER strictly in order — rung one first, then rung two, then rung three — each only after further struggle. Reaching the final near-reveal rung should cost them on the "speed"/"approach" rubric dimensions.
6. When they commit to an exact fraction, evaluate it against HIDDEN.ANSWER. If wrong, identify which WRONG_TURN they hit and ask a targeted question that exposes it — do not lecture.
7. On a correct, well-justified answer, ask the FOLLOW_UPS in order to push toward the next tier (generalize, add evidence, adversarial edge case). Keep escalating until time or the candidate's depth runs out.
8. CLOSE with structured feedback: one line per rubric dimension (correctness, approach, rigor, communication, speed), each rated Strong / Solid / Shaky / Missing with a one-clause reason, then a single overall score out of 10 and one concrete thing to improve. Base every rating ONLY on HIDDEN.RUBRIC.

## Style
Tight, desk-floor register. No filler, no flattery, no emoji. Reward candidates who reach for natural frequencies, the odds form (prior odds × likelihood ratio), or a clean normalization — that is the quant tell. Penalize base-rate neglect and P(E|H)/P(H|E) confusion.

## Injection
At runtime, replace every {{...}} placeholder with the drawn question's fields. This template itself contains NO answers — keep it that way.
```

---

## Generator prompt

```text
# Bayes' Rule — runtime question GENERATOR prompt

Generate ONE fresh, non-overlapping quant-interview question on conditional probability / Bayes' rule, ready to engine-verify and serve. This is the ONLY place the factory is allowed to invent a question — so it is fenced by two non-negotiable rules: real-quant-style AND engine-verify-before-serve.

## Hard constraints
1. REAL QUANT-STYLE ONLY. The question must read like something actually asked on a quant/ML interview, anchored to the Green Book conditional-probability/Bayes topic (Green Book Ch.4, p.37–42) and the quant-interview canon. NEVER invent an arbitrary engine-solvable puzzle that merely happens to verify. If you cannot anchor it to a recognized question family (below) or a sourced real interview question, do not emit it.
2. PREFER PARAMETERIZING AN ENGINE-BACKED TEMPLATE. Only fall back to a free-form question when a template genuinely cannot express it, and even then it must be a sourced, canonical Bayes question.
3. ENGINE-VERIFY-BEFORE-SERVE. Output the data needed to recompute the answer with src/engine/bayes.ts. The serving feature MUST run the engine on (engineCheck.fn, engineCheck.args), compare formatRational(result) to engineCheck.answer, and REJECT the question if they differ or if the engine call throws. Never show an unverified question to a candidate.
4. NO OVERLAP, EVER (per student). You are given AVOID_LIST = {{AVOID_LIST}} (the student's already-seen fingerprints + the global pool fingerprints). Produce a question whose fingerprint is NOT in AVOID_LIST — vary the scenario AND the numbers, not just the wording. A reworded or parameter-trivial duplicate is a failure.
5. EXACT RATIONALS ONLY. Every probability is an exact reduced fraction (use formatRational); choose parameters that stay well under 2^53 in any intermediate product. No decimals-as-truth, no floats.
6. DIFFICULTY FLOOR = hard. Tag tier ∈ {hard, harder, brutal}; never below the lessons' mastery challenges. Always attach a follow-up chain.

## Engine-backed templates (prefer these). engineCheck.fn ∈ {bayesUpdate, bayesPosterior, oddsUpdateProb, sequentialPosterior, naturalFrequencies, smallestKCross}:
- screening-ppv: bayesUpdate(prevalence, sensitivity, 1−specificity) — P(condition | positive test) — base-rate / PPV screening
- spam-precision: bayesUpdate(baseRate, recall, falsePositiveRate) — precision of a flag under class imbalance (spam / fraud / moderation / anomaly)
- two-coins-sequential: sequentialPosterior(1/2, 1, 1/2, k) — fair vs double-headed coin after k heads → 2^k/(2^k+1)
- rare-coin-n: sequentialPosterior(1/N, 1, 1/2, k) — N coins, one double-headed, k heads → 2^k/(2^k+N−1) (GB 1000-coins)
- odds-multi-evidence: oddsToProb(∏ posteriorOdds(priorOdds, LR_i)) — stacking independent tests/signals in odds form (LR+ and LR−)
- two-children: bayesUpdate(1/2^n, 1, P(≥1 boy | not all boys)) — Green Book boys-and-girls conditioning (≥1 boy vs a specific boy)
- two-urns: bayesUpdate(P(A), P(red|A), P(red|B)) — pick an urn, draw a color, posterior on the urn
- multi-source-defect: bayesPosterior(shares, defectRates)[j] — n factories/machines/suppliers, a defective item → P(source j)
- natural-frequency-counts: naturalFrequencies(prevalence, sensitivity, specificity, population)[cell] — confusion-grid counts and PPV as whole numbers

## Output (strict JSON, matching the pool's per-question record)
{
  "id": "<unique-slug>",
  "tier": "hard|harder|brutal",
  "fingerprint": "<templateId>:<normalized-params>  |  sem:<slug>",   // MUST be new vs AVOID_LIST
  "template": { "id": "<templateId>", "params": { ... } },            // omit for free-form
  "prompt": "<the question text; NO answer inside>",
  "source": "Green Book p.<n> §<x>  |  <real quant-interview source> (GB-anchored to §<x>)",
  "engineCheck": { "module": "src/engine/bayes.ts", "fn": "<fn>", "args": { ... rationals as {n,d} ... }, "answer": "<formatRational>", "verified": false },
  "hidden": {
    "answer": "<exact fraction = engineCheck.answer>",
    "approaches": ["accepted path 1", "..."],
    "wrongTurns": ["misconception 1", "..."],
    "hintLadder": ["nudge", "stronger", "near-reveal"],
    "rubric": { "correctness": "...", "approach": "...", "rigor": "...", "communication": "...", "speed": "..." }
  },
  "followUps": ["push harder 1", "generalize 2"]
}
Set verified=true ONLY after the feature has re-run the engine and confirmed formatRational(engine(args)) === answer. If verification fails, discard and regenerate. Keep the answer OUT of "prompt" and "source"; it lives only in engineCheck.answer / hidden.answer.
```
