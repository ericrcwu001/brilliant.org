# Interview Pack — Optimal Stopping (`course-optimal-stopping`)

> Dormant capstone asset — committed, NOT seeded/deployed. Regenerate with `./node_modules/.bin/tsx interviews/_build/build-optimal-stopping-pack.ts`.

**Anchor:** The Secretary / Best-Choice / Marriage problem — quant-interview optimal-stopping canon. The Green Book PDF is gitignored/absent in this checkout, so this pack is anchored to the sourced canon: Statistics LibreTexts §12.9 "The Secretary Problem" (success formula + optimal table n=3..20); Wikipedia "Secretary problem" (the 1/e law); Stanford AMDM Lecture 8 (take-first = 1/n; x·ln(1/x) maximized at 1/e).

**Engine:** `src/engine/optimalStopping.ts` — every answer is engine-verified (exact rational, no floats).

**Counts:** 57 questions (hard 16, harder 28, brutal 13; 53 templated, 4 free-form).

## Questions

### tmpl-best-prob#n3-r2  `hard`

**Prompt.** You interview 3 candidates in a uniformly random order and must hire or reject each on the spot (no callbacks). You use the look-then-leap rule: reject the first 1, remember the best of them as a benchmark, then hire the first later candidate who beats that benchmark (and the last candidate if none do). What is the probability you end up hiring the single best of the 3?

- **Answer (engine-verified):** `1/2`
- **Engine check:** `formatRational(secretarySuccess(3, 2))` → `1/2`
- **Source:** Statistics LibreTexts §12.9 (secretary problem success formula) / Wikipedia "Secretary problem" — a standard quant-desk optimal-stopping question.
- **Approaches:** Decompose by the best candidate's position i: P = Σ_{i=2}^{3} (1/3)·(1/(i-1)) = (1/3)·Σ_{j=2}^{3} 1/(j-1) = 1/2. / The best is hired iff it lands at some position i≥r AND the best of the first i-1 sat inside the reject zone (prob (r-1)/(i-1)).
- **Hint ladder:** (1) Condition on WHERE the best candidate sits. It can only be hired if it arrives after the reject zone. (2) For the best at position i to be taken, nothing better can have been accepted earlier — i.e. the best of the first i-1 must be in the first r-1. (3) That inner probability is (r-1)/(i-1); sum (1/n)·(r-1)/(i-1) over i from r to n.
- **Follow-ups:** Is r=2 the optimal cutoff for n=3? If not, which r is, and why? / How does this probability behave as n grows with r/n held fixed?

### tmpl-best-prob#n4-r2  `hard`

**Prompt.** You interview 4 candidates in a uniformly random order and must hire or reject each on the spot (no callbacks). You use the look-then-leap rule: reject the first 1, remember the best of them as a benchmark, then hire the first later candidate who beats that benchmark (and the last candidate if none do). What is the probability you end up hiring the single best of the 4?

- **Answer (engine-verified):** `11/24`
- **Engine check:** `formatRational(secretarySuccess(4, 2))` → `11/24`
- **Source:** Statistics LibreTexts §12.9 (secretary problem success formula) / Wikipedia "Secretary problem" — a standard quant-desk optimal-stopping question.
- **Approaches:** Decompose by the best candidate's position i: P = Σ_{i=2}^{4} (1/4)·(1/(i-1)) = (1/4)·Σ_{j=2}^{4} 1/(j-1) = 11/24. / The best is hired iff it lands at some position i≥r AND the best of the first i-1 sat inside the reject zone (prob (r-1)/(i-1)).
- **Hint ladder:** (1) Condition on WHERE the best candidate sits. It can only be hired if it arrives after the reject zone. (2) For the best at position i to be taken, nothing better can have been accepted earlier — i.e. the best of the first i-1 must be in the first r-1. (3) That inner probability is (r-1)/(i-1); sum (1/n)·(r-1)/(i-1) over i from r to n.
- **Follow-ups:** Is r=2 the optimal cutoff for n=4? If not, which r is, and why? / How does this probability behave as n grows with r/n held fixed?

### tmpl-best-prob#n4-r3  `harder`

**Prompt.** You interview 4 candidates in a uniformly random order and must hire or reject each on the spot (no callbacks). You use the look-then-leap rule: reject the first 2, remember the best of them as a benchmark, then hire the first later candidate who beats that benchmark (and the last candidate if none do). What is the probability you end up hiring the single best of the 4?

- **Answer (engine-verified):** `5/12`
- **Engine check:** `formatRational(secretarySuccess(4, 3))` → `5/12`
- **Source:** Statistics LibreTexts §12.9 (secretary problem success formula) / Wikipedia "Secretary problem" — a standard quant-desk optimal-stopping question.
- **Approaches:** Decompose by the best candidate's position i: P = Σ_{i=3}^{4} (1/4)·(2/(i-1)) = (2/4)·Σ_{j=3}^{4} 1/(j-1) = 5/12. / The best is hired iff it lands at some position i≥r AND the best of the first i-1 sat inside the reject zone (prob (r-1)/(i-1)).
- **Hint ladder:** (1) Condition on WHERE the best candidate sits. It can only be hired if it arrives after the reject zone. (2) For the best at position i to be taken, nothing better can have been accepted earlier — i.e. the best of the first i-1 must be in the first r-1. (3) That inner probability is (r-1)/(i-1); sum (1/n)·(r-1)/(i-1) over i from r to n.
- **Follow-ups:** Is r=3 the optimal cutoff for n=4? If not, which r is, and why? / How does this probability behave as n grows with r/n held fixed?

### tmpl-best-prob#n5-r3  `hard`

**Prompt.** You interview 5 candidates in a uniformly random order and must hire or reject each on the spot (no callbacks). You use the look-then-leap rule: reject the first 2, remember the best of them as a benchmark, then hire the first later candidate who beats that benchmark (and the last candidate if none do). What is the probability you end up hiring the single best of the 5?

- **Answer (engine-verified):** `13/30`
- **Engine check:** `formatRational(secretarySuccess(5, 3))` → `13/30`
- **Source:** Statistics LibreTexts §12.9 (secretary problem success formula) / Wikipedia "Secretary problem" — a standard quant-desk optimal-stopping question.
- **Approaches:** Decompose by the best candidate's position i: P = Σ_{i=3}^{5} (1/5)·(2/(i-1)) = (2/5)·Σ_{j=3}^{5} 1/(j-1) = 13/30. / The best is hired iff it lands at some position i≥r AND the best of the first i-1 sat inside the reject zone (prob (r-1)/(i-1)).
- **Hint ladder:** (1) Condition on WHERE the best candidate sits. It can only be hired if it arrives after the reject zone. (2) For the best at position i to be taken, nothing better can have been accepted earlier — i.e. the best of the first i-1 must be in the first r-1. (3) That inner probability is (r-1)/(i-1); sum (1/n)·(r-1)/(i-1) over i from r to n.
- **Follow-ups:** Is r=3 the optimal cutoff for n=5? If not, which r is, and why? / How does this probability behave as n grows with r/n held fixed?

### tmpl-best-prob#n5-r2  `harder`

**Prompt.** You interview 5 candidates in a uniformly random order and must hire or reject each on the spot (no callbacks). You use the look-then-leap rule: reject the first 1, remember the best of them as a benchmark, then hire the first later candidate who beats that benchmark (and the last candidate if none do). What is the probability you end up hiring the single best of the 5?

- **Answer (engine-verified):** `5/12`
- **Engine check:** `formatRational(secretarySuccess(5, 2))` → `5/12`
- **Source:** Statistics LibreTexts §12.9 (secretary problem success formula) / Wikipedia "Secretary problem" — a standard quant-desk optimal-stopping question.
- **Approaches:** Decompose by the best candidate's position i: P = Σ_{i=2}^{5} (1/5)·(1/(i-1)) = (1/5)·Σ_{j=2}^{5} 1/(j-1) = 5/12. / The best is hired iff it lands at some position i≥r AND the best of the first i-1 sat inside the reject zone (prob (r-1)/(i-1)).
- **Hint ladder:** (1) Condition on WHERE the best candidate sits. It can only be hired if it arrives after the reject zone. (2) For the best at position i to be taken, nothing better can have been accepted earlier — i.e. the best of the first i-1 must be in the first r-1. (3) That inner probability is (r-1)/(i-1); sum (1/n)·(r-1)/(i-1) over i from r to n.
- **Follow-ups:** Is r=2 the optimal cutoff for n=5? If not, which r is, and why? / How does this probability behave as n grows with r/n held fixed?

### tmpl-best-prob#n6-r3  `harder`

**Prompt.** You interview 6 candidates in a uniformly random order and must hire or reject each on the spot (no callbacks). You use the look-then-leap rule: reject the first 2, remember the best of them as a benchmark, then hire the first later candidate who beats that benchmark (and the last candidate if none do). What is the probability you end up hiring the single best of the 6?

- **Answer (engine-verified):** `77/180`
- **Engine check:** `formatRational(secretarySuccess(6, 3))` → `77/180`
- **Source:** Statistics LibreTexts §12.9 (secretary problem success formula) / Wikipedia "Secretary problem" — a standard quant-desk optimal-stopping question.
- **Approaches:** Decompose by the best candidate's position i: P = Σ_{i=3}^{6} (1/6)·(2/(i-1)) = (2/6)·Σ_{j=3}^{6} 1/(j-1) = 77/180. / The best is hired iff it lands at some position i≥r AND the best of the first i-1 sat inside the reject zone (prob (r-1)/(i-1)).
- **Hint ladder:** (1) Condition on WHERE the best candidate sits. It can only be hired if it arrives after the reject zone. (2) For the best at position i to be taken, nothing better can have been accepted earlier — i.e. the best of the first i-1 must be in the first r-1. (3) That inner probability is (r-1)/(i-1); sum (1/n)·(r-1)/(i-1) over i from r to n.
- **Follow-ups:** Is r=3 the optimal cutoff for n=6? If not, which r is, and why? / How does this probability behave as n grows with r/n held fixed?

### tmpl-best-prob#n7-r3  `harder`

**Prompt.** You interview 7 candidates in a uniformly random order and must hire or reject each on the spot (no callbacks). You use the look-then-leap rule: reject the first 2, remember the best of them as a benchmark, then hire the first later candidate who beats that benchmark (and the last candidate if none do). What is the probability you end up hiring the single best of the 7?

- **Answer (engine-verified):** `29/70`
- **Engine check:** `formatRational(secretarySuccess(7, 3))` → `29/70`
- **Source:** Statistics LibreTexts §12.9 (secretary problem success formula) / Wikipedia "Secretary problem" — a standard quant-desk optimal-stopping question.
- **Approaches:** Decompose by the best candidate's position i: P = Σ_{i=3}^{7} (1/7)·(2/(i-1)) = (2/7)·Σ_{j=3}^{7} 1/(j-1) = 29/70. / The best is hired iff it lands at some position i≥r AND the best of the first i-1 sat inside the reject zone (prob (r-1)/(i-1)).
- **Hint ladder:** (1) Condition on WHERE the best candidate sits. It can only be hired if it arrives after the reject zone. (2) For the best at position i to be taken, nothing better can have been accepted earlier — i.e. the best of the first i-1 must be in the first r-1. (3) That inner probability is (r-1)/(i-1); sum (1/n)·(r-1)/(i-1) over i from r to n.
- **Follow-ups:** Is r=3 the optimal cutoff for n=7? If not, which r is, and why? / How does this probability behave as n grows with r/n held fixed?

### tmpl-best-prob#n8-r4  `harder`

**Prompt.** You interview 8 candidates in a uniformly random order and must hire or reject each on the spot (no callbacks). You use the look-then-leap rule: reject the first 3, remember the best of them as a benchmark, then hire the first later candidate who beats that benchmark (and the last candidate if none do). What is the probability you end up hiring the single best of the 8?

- **Answer (engine-verified):** `459/1120`
- **Engine check:** `formatRational(secretarySuccess(8, 4))` → `459/1120`
- **Source:** Statistics LibreTexts §12.9 (secretary problem success formula) / Wikipedia "Secretary problem" — a standard quant-desk optimal-stopping question.
- **Approaches:** Decompose by the best candidate's position i: P = Σ_{i=4}^{8} (1/8)·(3/(i-1)) = (3/8)·Σ_{j=4}^{8} 1/(j-1) = 459/1120. / The best is hired iff it lands at some position i≥r AND the best of the first i-1 sat inside the reject zone (prob (r-1)/(i-1)).
- **Hint ladder:** (1) Condition on WHERE the best candidate sits. It can only be hired if it arrives after the reject zone. (2) For the best at position i to be taken, nothing better can have been accepted earlier — i.e. the best of the first i-1 must be in the first r-1. (3) That inner probability is (r-1)/(i-1); sum (1/n)·(r-1)/(i-1) over i from r to n.
- **Follow-ups:** Is r=4 the optimal cutoff for n=8? If not, which r is, and why? / How does this probability behave as n grows with r/n held fixed?

### tmpl-best-prob#n10-r4  `harder`

**Prompt.** You interview 10 candidates in a uniformly random order and must hire or reject each on the spot (no callbacks). You use the look-then-leap rule: reject the first 3, remember the best of them as a benchmark, then hire the first later candidate who beats that benchmark (and the last candidate if none do). What is the probability you end up hiring the single best of the 10?

- **Answer (engine-verified):** `3349/8400`
- **Engine check:** `formatRational(secretarySuccess(10, 4))` → `3349/8400`
- **Source:** Statistics LibreTexts §12.9 (secretary problem success formula) / Wikipedia "Secretary problem" — a standard quant-desk optimal-stopping question.
- **Approaches:** Decompose by the best candidate's position i: P = Σ_{i=4}^{10} (1/10)·(3/(i-1)) = (3/10)·Σ_{j=4}^{10} 1/(j-1) = 3349/8400. / The best is hired iff it lands at some position i≥r AND the best of the first i-1 sat inside the reject zone (prob (r-1)/(i-1)).
- **Hint ladder:** (1) Condition on WHERE the best candidate sits. It can only be hired if it arrives after the reject zone. (2) For the best at position i to be taken, nothing better can have been accepted earlier — i.e. the best of the first i-1 must be in the first r-1. (3) That inner probability is (r-1)/(i-1); sum (1/n)·(r-1)/(i-1) over i from r to n.
- **Follow-ups:** Is r=4 the optimal cutoff for n=10? If not, which r is, and why? / How does this probability behave as n grows with r/n held fixed?

### tmpl-best-prob#n10-r3  `brutal`

**Prompt.** You interview 10 candidates in a uniformly random order and must hire or reject each on the spot (no callbacks). You use the look-then-leap rule: reject the first 2, remember the best of them as a benchmark, then hire the first later candidate who beats that benchmark (and the last candidate if none do). What is the probability you end up hiring the single best of the 10?

- **Answer (engine-verified):** `4609/12600`
- **Engine check:** `formatRational(secretarySuccess(10, 3))` → `4609/12600`
- **Source:** Statistics LibreTexts §12.9 (secretary problem success formula) / Wikipedia "Secretary problem" — a standard quant-desk optimal-stopping question.
- **Approaches:** Decompose by the best candidate's position i: P = Σ_{i=3}^{10} (1/10)·(2/(i-1)) = (2/10)·Σ_{j=3}^{10} 1/(j-1) = 4609/12600. / The best is hired iff it lands at some position i≥r AND the best of the first i-1 sat inside the reject zone (prob (r-1)/(i-1)).
- **Hint ladder:** (1) Condition on WHERE the best candidate sits. It can only be hired if it arrives after the reject zone. (2) For the best at position i to be taken, nothing better can have been accepted earlier — i.e. the best of the first i-1 must be in the first r-1. (3) That inner probability is (r-1)/(i-1); sum (1/n)·(r-1)/(i-1) over i from r to n.
- **Follow-ups:** Is r=3 the optimal cutoff for n=10? If not, which r is, and why? / How does this probability behave as n grows with r/n held fixed?

### tmpl-best-prob#n12-r5  `brutal`

**Prompt.** You interview 12 candidates in a uniformly random order and must hire or reject each on the spot (no callbacks). You use the look-then-leap rule: reject the first 4, remember the best of them as a benchmark, then hire the first later candidate who beats that benchmark (and the last candidate if none do). What is the probability you end up hiring the single best of the 12?

- **Answer (engine-verified):** `32891/83160`
- **Engine check:** `formatRational(secretarySuccess(12, 5))` → `32891/83160`
- **Source:** Statistics LibreTexts §12.9 (secretary problem success formula) / Wikipedia "Secretary problem" — a standard quant-desk optimal-stopping question.
- **Approaches:** Decompose by the best candidate's position i: P = Σ_{i=5}^{12} (1/12)·(4/(i-1)) = (4/12)·Σ_{j=5}^{12} 1/(j-1) = 32891/83160. / The best is hired iff it lands at some position i≥r AND the best of the first i-1 sat inside the reject zone (prob (r-1)/(i-1)).
- **Hint ladder:** (1) Condition on WHERE the best candidate sits. It can only be hired if it arrives after the reject zone. (2) For the best at position i to be taken, nothing better can have been accepted earlier — i.e. the best of the first i-1 must be in the first r-1. (3) That inner probability is (r-1)/(i-1); sum (1/n)·(r-1)/(i-1) over i from r to n.
- **Follow-ups:** Is r=5 the optimal cutoff for n=12? If not, which r is, and why? / How does this probability behave as n grows with r/n held fixed?

### tmpl-best-prob#n3-r1  `hard`

**Prompt.** You interview 3 candidates in a uniformly random order and must hire or reject each on the spot (no callbacks). You use the look-then-leap rule: reject the first 0, remember the best of them as a benchmark, then hire the first later candidate who beats that benchmark (and the last candidate if none do). What is the probability you end up hiring the single best of the 3?

- **Answer (engine-verified):** `1/3`
- **Engine check:** `formatRational(secretarySuccess(3, 1))` → `1/3`
- **Source:** Statistics LibreTexts §12.9 (secretary problem success formula) / Wikipedia "Secretary problem" — a standard quant-desk optimal-stopping question.
- **Approaches:** Decompose by the best candidate's position i: P = Σ_{i=1}^{3} (1/3)·(0/(i-1)) = (0/3)·Σ_{j=1}^{3} 1/(j-1) = 1/3. / The best is hired iff it lands at some position i≥r AND the best of the first i-1 sat inside the reject zone (prob (r-1)/(i-1)).
- **Hint ladder:** (1) Condition on WHERE the best candidate sits. It can only be hired if it arrives after the reject zone. (2) For the best at position i to be taken, nothing better can have been accepted earlier — i.e. the best of the first i-1 must be in the first r-1. (3) That inner probability is (r-1)/(i-1); sum (1/n)·(r-1)/(i-1) over i from r to n.
- **Follow-ups:** Is r=1 the optimal cutoff for n=3? If not, which r is, and why? / How does this probability behave as n grows with r/n held fixed?

### tmpl-best-prob#n4-r1  `hard`

**Prompt.** You interview 4 candidates in a uniformly random order and must hire or reject each on the spot (no callbacks). You use the look-then-leap rule: reject the first 0, remember the best of them as a benchmark, then hire the first later candidate who beats that benchmark (and the last candidate if none do). What is the probability you end up hiring the single best of the 4?

- **Answer (engine-verified):** `1/4`
- **Engine check:** `formatRational(secretarySuccess(4, 1))` → `1/4`
- **Source:** Statistics LibreTexts §12.9 (secretary problem success formula) / Wikipedia "Secretary problem" — a standard quant-desk optimal-stopping question.
- **Approaches:** Decompose by the best candidate's position i: P = Σ_{i=1}^{4} (1/4)·(0/(i-1)) = (0/4)·Σ_{j=1}^{4} 1/(j-1) = 1/4. / The best is hired iff it lands at some position i≥r AND the best of the first i-1 sat inside the reject zone (prob (r-1)/(i-1)).
- **Hint ladder:** (1) Condition on WHERE the best candidate sits. It can only be hired if it arrives after the reject zone. (2) For the best at position i to be taken, nothing better can have been accepted earlier — i.e. the best of the first i-1 must be in the first r-1. (3) That inner probability is (r-1)/(i-1); sum (1/n)·(r-1)/(i-1) over i from r to n.
- **Follow-ups:** Is r=1 the optimal cutoff for n=4? If not, which r is, and why? / How does this probability behave as n grows with r/n held fixed?

### tmpl-best-prob#n5-r4  `harder`

**Prompt.** You interview 5 candidates in a uniformly random order and must hire or reject each on the spot (no callbacks). You use the look-then-leap rule: reject the first 3, remember the best of them as a benchmark, then hire the first later candidate who beats that benchmark (and the last candidate if none do). What is the probability you end up hiring the single best of the 5?

- **Answer (engine-verified):** `7/20`
- **Engine check:** `formatRational(secretarySuccess(5, 4))` → `7/20`
- **Source:** Statistics LibreTexts §12.9 (secretary problem success formula) / Wikipedia "Secretary problem" — a standard quant-desk optimal-stopping question.
- **Approaches:** Decompose by the best candidate's position i: P = Σ_{i=4}^{5} (1/5)·(3/(i-1)) = (3/5)·Σ_{j=4}^{5} 1/(j-1) = 7/20. / The best is hired iff it lands at some position i≥r AND the best of the first i-1 sat inside the reject zone (prob (r-1)/(i-1)).
- **Hint ladder:** (1) Condition on WHERE the best candidate sits. It can only be hired if it arrives after the reject zone. (2) For the best at position i to be taken, nothing better can have been accepted earlier — i.e. the best of the first i-1 must be in the first r-1. (3) That inner probability is (r-1)/(i-1); sum (1/n)·(r-1)/(i-1) over i from r to n.
- **Follow-ups:** Is r=4 the optimal cutoff for n=5? If not, which r is, and why? / How does this probability behave as n grows with r/n held fixed?

### tmpl-best-prob#n6-r4  `harder`

**Prompt.** You interview 6 candidates in a uniformly random order and must hire or reject each on the spot (no callbacks). You use the look-then-leap rule: reject the first 3, remember the best of them as a benchmark, then hire the first later candidate who beats that benchmark (and the last candidate if none do). What is the probability you end up hiring the single best of the 6?

- **Answer (engine-verified):** `47/120`
- **Engine check:** `formatRational(secretarySuccess(6, 4))` → `47/120`
- **Source:** Statistics LibreTexts §12.9 (secretary problem success formula) / Wikipedia "Secretary problem" — a standard quant-desk optimal-stopping question.
- **Approaches:** Decompose by the best candidate's position i: P = Σ_{i=4}^{6} (1/6)·(3/(i-1)) = (3/6)·Σ_{j=4}^{6} 1/(j-1) = 47/120. / The best is hired iff it lands at some position i≥r AND the best of the first i-1 sat inside the reject zone (prob (r-1)/(i-1)).
- **Hint ladder:** (1) Condition on WHERE the best candidate sits. It can only be hired if it arrives after the reject zone. (2) For the best at position i to be taken, nothing better can have been accepted earlier — i.e. the best of the first i-1 must be in the first r-1. (3) That inner probability is (r-1)/(i-1); sum (1/n)·(r-1)/(i-1) over i from r to n.
- **Follow-ups:** Is r=4 the optimal cutoff for n=6? If not, which r is, and why? / How does this probability behave as n grows with r/n held fixed?

### tmpl-best-prob#n7-r4  `harder`

**Prompt.** You interview 7 candidates in a uniformly random order and must hire or reject each on the spot (no callbacks). You use the look-then-leap rule: reject the first 3, remember the best of them as a benchmark, then hire the first later candidate who beats that benchmark (and the last candidate if none do). What is the probability you end up hiring the single best of the 7?

- **Answer (engine-verified):** `57/140`
- **Engine check:** `formatRational(secretarySuccess(7, 4))` → `57/140`
- **Source:** Statistics LibreTexts §12.9 (secretary problem success formula) / Wikipedia "Secretary problem" — a standard quant-desk optimal-stopping question.
- **Approaches:** Decompose by the best candidate's position i: P = Σ_{i=4}^{7} (1/7)·(3/(i-1)) = (3/7)·Σ_{j=4}^{7} 1/(j-1) = 57/140. / The best is hired iff it lands at some position i≥r AND the best of the first i-1 sat inside the reject zone (prob (r-1)/(i-1)).
- **Hint ladder:** (1) Condition on WHERE the best candidate sits. It can only be hired if it arrives after the reject zone. (2) For the best at position i to be taken, nothing better can have been accepted earlier — i.e. the best of the first i-1 must be in the first r-1. (3) That inner probability is (r-1)/(i-1); sum (1/n)·(r-1)/(i-1) over i from r to n.
- **Follow-ups:** Is r=4 the optimal cutoff for n=7? If not, which r is, and why? / How does this probability behave as n grows with r/n held fixed?

### tmpl-best-prob#n9-r4  `harder`

**Prompt.** You interview 9 candidates in a uniformly random order and must hire or reject each on the spot (no callbacks). You use the look-then-leap rule: reject the first 3, remember the best of them as a benchmark, then hire the first later candidate who beats that benchmark (and the last candidate if none do). What is the probability you end up hiring the single best of the 9?

- **Answer (engine-verified):** `341/840`
- **Engine check:** `formatRational(secretarySuccess(9, 4))` → `341/840`
- **Source:** Statistics LibreTexts §12.9 (secretary problem success formula) / Wikipedia "Secretary problem" — a standard quant-desk optimal-stopping question.
- **Approaches:** Decompose by the best candidate's position i: P = Σ_{i=4}^{9} (1/9)·(3/(i-1)) = (3/9)·Σ_{j=4}^{9} 1/(j-1) = 341/840. / The best is hired iff it lands at some position i≥r AND the best of the first i-1 sat inside the reject zone (prob (r-1)/(i-1)).
- **Hint ladder:** (1) Condition on WHERE the best candidate sits. It can only be hired if it arrives after the reject zone. (2) For the best at position i to be taken, nothing better can have been accepted earlier — i.e. the best of the first i-1 must be in the first r-1. (3) That inner probability is (r-1)/(i-1); sum (1/n)·(r-1)/(i-1) over i from r to n.
- **Follow-ups:** Is r=4 the optimal cutoff for n=9? If not, which r is, and why? / How does this probability behave as n grows with r/n held fixed?

### tmpl-best-prob#n8-r3  `brutal`

**Prompt.** You interview 8 candidates in a uniformly random order and must hire or reject each on the spot (no callbacks). You use the look-then-leap rule: reject the first 2, remember the best of them as a benchmark, then hire the first later candidate who beats that benchmark (and the last candidate if none do). What is the probability you end up hiring the single best of the 8?

- **Answer (engine-verified):** `223/560`
- **Engine check:** `formatRational(secretarySuccess(8, 3))` → `223/560`
- **Source:** Statistics LibreTexts §12.9 (secretary problem success formula) / Wikipedia "Secretary problem" — a standard quant-desk optimal-stopping question.
- **Approaches:** Decompose by the best candidate's position i: P = Σ_{i=3}^{8} (1/8)·(2/(i-1)) = (2/8)·Σ_{j=3}^{8} 1/(j-1) = 223/560. / The best is hired iff it lands at some position i≥r AND the best of the first i-1 sat inside the reject zone (prob (r-1)/(i-1)).
- **Hint ladder:** (1) Condition on WHERE the best candidate sits. It can only be hired if it arrives after the reject zone. (2) For the best at position i to be taken, nothing better can have been accepted earlier — i.e. the best of the first i-1 must be in the first r-1. (3) That inner probability is (r-1)/(i-1); sum (1/n)·(r-1)/(i-1) over i from r to n.
- **Follow-ups:** Is r=3 the optimal cutoff for n=8? If not, which r is, and why? / How does this probability behave as n grows with r/n held fixed?

### tmpl-best-prob#n11-r5  `brutal`

**Prompt.** You interview 11 candidates in a uniformly random order and must hire or reject each on the spot (no callbacks). You use the look-then-leap rule: reject the first 4, remember the best of them as a benchmark, then hire the first later candidate who beats that benchmark (and the last candidate if none do). What is the probability you end up hiring the single best of the 11?

- **Answer (engine-verified):** `251/630`
- **Engine check:** `formatRational(secretarySuccess(11, 5))` → `251/630`
- **Source:** Statistics LibreTexts §12.9 (secretary problem success formula) / Wikipedia "Secretary problem" — a standard quant-desk optimal-stopping question.
- **Approaches:** Decompose by the best candidate's position i: P = Σ_{i=5}^{11} (1/11)·(4/(i-1)) = (4/11)·Σ_{j=5}^{11} 1/(j-1) = 251/630. / The best is hired iff it lands at some position i≥r AND the best of the first i-1 sat inside the reject zone (prob (r-1)/(i-1)).
- **Hint ladder:** (1) Condition on WHERE the best candidate sits. It can only be hired if it arrives after the reject zone. (2) For the best at position i to be taken, nothing better can have been accepted earlier — i.e. the best of the first i-1 must be in the first r-1. (3) That inner probability is (r-1)/(i-1); sum (1/n)·(r-1)/(i-1) over i from r to n.
- **Follow-ups:** Is r=5 the optimal cutoff for n=11? If not, which r is, and why? / How does this probability behave as n grows with r/n held fixed?

### tmpl-optimal-cutoff#n3  `hard`

**Prompt.** With 3 candidates arriving in random order under the irrevocable-choice rules, which cutoff r (reject the first r-1, then take the first record) MAXIMIZES your chance of hiring the single best — and what is that maximum probability?

- **Answer (engine-verified):** `r=2, p=1/2`
- **Engine check:** `optimalCutoff(3)  // -> { r: 2, p: 1/2 }` → `r=2, p=1/2`
- **Source:** Statistics LibreTexts §12.9 optimal-strategy table (n=3..20) — canonical optimal-stopping interview question.
- **Approaches:** Maximize p_3(r) over r. Equivalent rule: the optimal r is the largest with Σ_{j=r}^{3} 1/(j-1) > 1; here that gives r=2, p=1/2 (≈ 50%). / p_n(r) rises then falls (unimodal); stop increasing r once the marginal harmonic term drops the sum below 1.
- **Hint ladder:** (1) The success probability is unimodal in r — rises, peaks, then falls. Find the peak. (2) Adding one more rejected candidate helps exactly while Σ_{j=r}^{n} 1/(j-1) > 1. (3) Take the largest r for which that harmonic tail still exceeds 1 — for n=3 that is r=2.
- **Follow-ups:** What fraction r/n is this, and what number does it approach as n grows? / Compare this to hiring the first candidate blindly (1/3). How much does the rule buy you?

### tmpl-optimal-cutoff#n4  `hard`

**Prompt.** With 4 candidates arriving in random order under the irrevocable-choice rules, which cutoff r (reject the first r-1, then take the first record) MAXIMIZES your chance of hiring the single best — and what is that maximum probability?

- **Answer (engine-verified):** `r=2, p=11/24`
- **Engine check:** `optimalCutoff(4)  // -> { r: 2, p: 11/24 }` → `r=2, p=11/24`
- **Source:** Statistics LibreTexts §12.9 optimal-strategy table (n=3..20) — canonical optimal-stopping interview question.
- **Approaches:** Maximize p_4(r) over r. Equivalent rule: the optimal r is the largest with Σ_{j=r}^{4} 1/(j-1) > 1; here that gives r=2, p=11/24 (≈ 46%). / p_n(r) rises then falls (unimodal); stop increasing r once the marginal harmonic term drops the sum below 1.
- **Hint ladder:** (1) The success probability is unimodal in r — rises, peaks, then falls. Find the peak. (2) Adding one more rejected candidate helps exactly while Σ_{j=r}^{n} 1/(j-1) > 1. (3) Take the largest r for which that harmonic tail still exceeds 1 — for n=4 that is r=2.
- **Follow-ups:** What fraction r/n is this, and what number does it approach as n grows? / Compare this to hiring the first candidate blindly (1/4). How much does the rule buy you?

### tmpl-optimal-cutoff#n5  `hard`

**Prompt.** With 5 candidates arriving in random order under the irrevocable-choice rules, which cutoff r (reject the first r-1, then take the first record) MAXIMIZES your chance of hiring the single best — and what is that maximum probability?

- **Answer (engine-verified):** `r=3, p=13/30`
- **Engine check:** `optimalCutoff(5)  // -> { r: 3, p: 13/30 }` → `r=3, p=13/30`
- **Source:** Statistics LibreTexts §12.9 optimal-strategy table (n=3..20) — canonical optimal-stopping interview question.
- **Approaches:** Maximize p_5(r) over r. Equivalent rule: the optimal r is the largest with Σ_{j=r}^{5} 1/(j-1) > 1; here that gives r=3, p=13/30 (≈ 43%). / p_n(r) rises then falls (unimodal); stop increasing r once the marginal harmonic term drops the sum below 1.
- **Hint ladder:** (1) The success probability is unimodal in r — rises, peaks, then falls. Find the peak. (2) Adding one more rejected candidate helps exactly while Σ_{j=r}^{n} 1/(j-1) > 1. (3) Take the largest r for which that harmonic tail still exceeds 1 — for n=5 that is r=3.
- **Follow-ups:** What fraction r/n is this, and what number does it approach as n grows? / Compare this to hiring the first candidate blindly (1/5). How much does the rule buy you?

### tmpl-optimal-cutoff#n6  `harder`

**Prompt.** With 6 candidates arriving in random order under the irrevocable-choice rules, which cutoff r (reject the first r-1, then take the first record) MAXIMIZES your chance of hiring the single best — and what is that maximum probability?

- **Answer (engine-verified):** `r=3, p=77/180`
- **Engine check:** `optimalCutoff(6)  // -> { r: 3, p: 77/180 }` → `r=3, p=77/180`
- **Source:** Statistics LibreTexts §12.9 optimal-strategy table (n=3..20) — canonical optimal-stopping interview question.
- **Approaches:** Maximize p_6(r) over r. Equivalent rule: the optimal r is the largest with Σ_{j=r}^{6} 1/(j-1) > 1; here that gives r=3, p=77/180 (≈ 43%). / p_n(r) rises then falls (unimodal); stop increasing r once the marginal harmonic term drops the sum below 1.
- **Hint ladder:** (1) The success probability is unimodal in r — rises, peaks, then falls. Find the peak. (2) Adding one more rejected candidate helps exactly while Σ_{j=r}^{n} 1/(j-1) > 1. (3) Take the largest r for which that harmonic tail still exceeds 1 — for n=6 that is r=3.
- **Follow-ups:** What fraction r/n is this, and what number does it approach as n grows? / Compare this to hiring the first candidate blindly (1/6). How much does the rule buy you?

### tmpl-optimal-cutoff#n7  `harder`

**Prompt.** With 7 candidates arriving in random order under the irrevocable-choice rules, which cutoff r (reject the first r-1, then take the first record) MAXIMIZES your chance of hiring the single best — and what is that maximum probability?

- **Answer (engine-verified):** `r=3, p=29/70`
- **Engine check:** `optimalCutoff(7)  // -> { r: 3, p: 29/70 }` → `r=3, p=29/70`
- **Source:** Statistics LibreTexts §12.9 optimal-strategy table (n=3..20) — canonical optimal-stopping interview question.
- **Approaches:** Maximize p_7(r) over r. Equivalent rule: the optimal r is the largest with Σ_{j=r}^{7} 1/(j-1) > 1; here that gives r=3, p=29/70 (≈ 41%). / p_n(r) rises then falls (unimodal); stop increasing r once the marginal harmonic term drops the sum below 1.
- **Hint ladder:** (1) The success probability is unimodal in r — rises, peaks, then falls. Find the peak. (2) Adding one more rejected candidate helps exactly while Σ_{j=r}^{n} 1/(j-1) > 1. (3) Take the largest r for which that harmonic tail still exceeds 1 — for n=7 that is r=3.
- **Follow-ups:** What fraction r/n is this, and what number does it approach as n grows? / Compare this to hiring the first candidate blindly (1/7). How much does the rule buy you?

### tmpl-optimal-cutoff#n8  `harder`

**Prompt.** With 8 candidates arriving in random order under the irrevocable-choice rules, which cutoff r (reject the first r-1, then take the first record) MAXIMIZES your chance of hiring the single best — and what is that maximum probability?

- **Answer (engine-verified):** `r=4, p=459/1120`
- **Engine check:** `optimalCutoff(8)  // -> { r: 4, p: 459/1120 }` → `r=4, p=459/1120`
- **Source:** Statistics LibreTexts §12.9 optimal-strategy table (n=3..20) — canonical optimal-stopping interview question.
- **Approaches:** Maximize p_8(r) over r. Equivalent rule: the optimal r is the largest with Σ_{j=r}^{8} 1/(j-1) > 1; here that gives r=4, p=459/1120 (≈ 41%). / p_n(r) rises then falls (unimodal); stop increasing r once the marginal harmonic term drops the sum below 1.
- **Hint ladder:** (1) The success probability is unimodal in r — rises, peaks, then falls. Find the peak. (2) Adding one more rejected candidate helps exactly while Σ_{j=r}^{n} 1/(j-1) > 1. (3) Take the largest r for which that harmonic tail still exceeds 1 — for n=8 that is r=4.
- **Follow-ups:** What fraction r/n is this, and what number does it approach as n grows? / Compare this to hiring the first candidate blindly (1/8). How much does the rule buy you?

### tmpl-optimal-cutoff#n9  `harder`

**Prompt.** With 9 candidates arriving in random order under the irrevocable-choice rules, which cutoff r (reject the first r-1, then take the first record) MAXIMIZES your chance of hiring the single best — and what is that maximum probability?

- **Answer (engine-verified):** `r=4, p=341/840`
- **Engine check:** `optimalCutoff(9)  // -> { r: 4, p: 341/840 }` → `r=4, p=341/840`
- **Source:** Statistics LibreTexts §12.9 optimal-strategy table (n=3..20) — canonical optimal-stopping interview question.
- **Approaches:** Maximize p_9(r) over r. Equivalent rule: the optimal r is the largest with Σ_{j=r}^{9} 1/(j-1) > 1; here that gives r=4, p=341/840 (≈ 41%). / p_n(r) rises then falls (unimodal); stop increasing r once the marginal harmonic term drops the sum below 1.
- **Hint ladder:** (1) The success probability is unimodal in r — rises, peaks, then falls. Find the peak. (2) Adding one more rejected candidate helps exactly while Σ_{j=r}^{n} 1/(j-1) > 1. (3) Take the largest r for which that harmonic tail still exceeds 1 — for n=9 that is r=4.
- **Follow-ups:** What fraction r/n is this, and what number does it approach as n grows? / Compare this to hiring the first candidate blindly (1/9). How much does the rule buy you?

### tmpl-optimal-cutoff#n10  `harder`

**Prompt.** With 10 candidates arriving in random order under the irrevocable-choice rules, which cutoff r (reject the first r-1, then take the first record) MAXIMIZES your chance of hiring the single best — and what is that maximum probability?

- **Answer (engine-verified):** `r=4, p=3349/8400`
- **Engine check:** `optimalCutoff(10)  // -> { r: 4, p: 3349/8400 }` → `r=4, p=3349/8400`
- **Source:** Statistics LibreTexts §12.9 optimal-strategy table (n=3..20) — canonical optimal-stopping interview question.
- **Approaches:** Maximize p_10(r) over r. Equivalent rule: the optimal r is the largest with Σ_{j=r}^{10} 1/(j-1) > 1; here that gives r=4, p=3349/8400 (≈ 40%). / p_n(r) rises then falls (unimodal); stop increasing r once the marginal harmonic term drops the sum below 1.
- **Hint ladder:** (1) The success probability is unimodal in r — rises, peaks, then falls. Find the peak. (2) Adding one more rejected candidate helps exactly while Σ_{j=r}^{n} 1/(j-1) > 1. (3) Take the largest r for which that harmonic tail still exceeds 1 — for n=10 that is r=4.
- **Follow-ups:** What fraction r/n is this, and what number does it approach as n grows? / Compare this to hiring the first candidate blindly (1/10). How much does the rule buy you?

### tmpl-optimal-cutoff#n11  `harder`

**Prompt.** With 11 candidates arriving in random order under the irrevocable-choice rules, which cutoff r (reject the first r-1, then take the first record) MAXIMIZES your chance of hiring the single best — and what is that maximum probability?

- **Answer (engine-verified):** `r=5, p=251/630`
- **Engine check:** `optimalCutoff(11)  // -> { r: 5, p: 251/630 }` → `r=5, p=251/630`
- **Source:** Statistics LibreTexts §12.9 optimal-strategy table (n=3..20) — canonical optimal-stopping interview question.
- **Approaches:** Maximize p_11(r) over r. Equivalent rule: the optimal r is the largest with Σ_{j=r}^{11} 1/(j-1) > 1; here that gives r=5, p=251/630 (≈ 40%). / p_n(r) rises then falls (unimodal); stop increasing r once the marginal harmonic term drops the sum below 1.
- **Hint ladder:** (1) The success probability is unimodal in r — rises, peaks, then falls. Find the peak. (2) Adding one more rejected candidate helps exactly while Σ_{j=r}^{n} 1/(j-1) > 1. (3) Take the largest r for which that harmonic tail still exceeds 1 — for n=11 that is r=5.
- **Follow-ups:** What fraction r/n is this, and what number does it approach as n grows? / Compare this to hiring the first candidate blindly (1/11). How much does the rule buy you?

### tmpl-optimal-cutoff#n12  `harder`

**Prompt.** With 12 candidates arriving in random order under the irrevocable-choice rules, which cutoff r (reject the first r-1, then take the first record) MAXIMIZES your chance of hiring the single best — and what is that maximum probability?

- **Answer (engine-verified):** `r=5, p=32891/83160`
- **Engine check:** `optimalCutoff(12)  // -> { r: 5, p: 32891/83160 }` → `r=5, p=32891/83160`
- **Source:** Statistics LibreTexts §12.9 optimal-strategy table (n=3..20) — canonical optimal-stopping interview question.
- **Approaches:** Maximize p_12(r) over r. Equivalent rule: the optimal r is the largest with Σ_{j=r}^{12} 1/(j-1) > 1; here that gives r=5, p=32891/83160 (≈ 40%). / p_n(r) rises then falls (unimodal); stop increasing r once the marginal harmonic term drops the sum below 1.
- **Hint ladder:** (1) The success probability is unimodal in r — rises, peaks, then falls. Find the peak. (2) Adding one more rejected candidate helps exactly while Σ_{j=r}^{n} 1/(j-1) > 1. (3) Take the largest r for which that harmonic tail still exceeds 1 — for n=12 that is r=5.
- **Follow-ups:** What fraction r/n is this, and what number does it approach as n grows? / Compare this to hiring the first candidate blindly (1/12). How much does the rule buy you?

### tmpl-optimal-cutoff#n14  `brutal`

**Prompt.** With 14 candidates arriving in random order under the irrevocable-choice rules, which cutoff r (reject the first r-1, then take the first record) MAXIMIZES your chance of hiring the single best — and what is that maximum probability?

- **Answer (engine-verified):** `r=6, p=395243/1009008`
- **Engine check:** `optimalCutoff(14)  // -> { r: 6, p: 395243/1009008 }` → `r=6, p=395243/1009008`
- **Source:** Statistics LibreTexts §12.9 optimal-strategy table (n=3..20) — canonical optimal-stopping interview question.
- **Approaches:** Maximize p_14(r) over r. Equivalent rule: the optimal r is the largest with Σ_{j=r}^{14} 1/(j-1) > 1; here that gives r=6, p=395243/1009008 (≈ 39%). / p_n(r) rises then falls (unimodal); stop increasing r once the marginal harmonic term drops the sum below 1.
- **Hint ladder:** (1) The success probability is unimodal in r — rises, peaks, then falls. Find the peak. (2) Adding one more rejected candidate helps exactly while Σ_{j=r}^{n} 1/(j-1) > 1. (3) Take the largest r for which that harmonic tail still exceeds 1 — for n=14 that is r=6.
- **Follow-ups:** What fraction r/n is this, and what number does it approach as n grows? / Compare this to hiring the first candidate blindly (1/14). How much does the rule buy you?

### tmpl-optimal-cutoff#n15  `brutal`

**Prompt.** With 15 candidates arriving in random order under the irrevocable-choice rules, which cutoff r (reject the first r-1, then take the first record) MAXIMIZES your chance of hiring the single best — and what is that maximum probability?

- **Answer (engine-verified):** `r=6, p=420983/1081080`
- **Engine check:** `optimalCutoff(15)  // -> { r: 6, p: 420983/1081080 }` → `r=6, p=420983/1081080`
- **Source:** Statistics LibreTexts §12.9 optimal-strategy table (n=3..20) — canonical optimal-stopping interview question.
- **Approaches:** Maximize p_15(r) over r. Equivalent rule: the optimal r is the largest with Σ_{j=r}^{15} 1/(j-1) > 1; here that gives r=6, p=420983/1081080 (≈ 39%). / p_n(r) rises then falls (unimodal); stop increasing r once the marginal harmonic term drops the sum below 1.
- **Hint ladder:** (1) The success probability is unimodal in r — rises, peaks, then falls. Find the peak. (2) Adding one more rejected candidate helps exactly while Σ_{j=r}^{n} 1/(j-1) > 1. (3) Take the largest r for which that harmonic tail still exceeds 1 — for n=15 that is r=6.
- **Follow-ups:** What fraction r/n is this, and what number does it approach as n grows? / Compare this to hiring the first candidate blindly (1/15). How much does the rule buy you?

### tmpl-optimal-cutoff#n18  `brutal`

**Prompt.** With 18 candidates arriving in random order under the irrevocable-choice rules, which cutoff r (reject the first r-1, then take the first record) MAXIMIZES your chance of hiring the single best — and what is that maximum probability?

- **Answer (engine-verified):** `r=7, p=2833255/7351344`
- **Engine check:** `optimalCutoff(18)  // -> { r: 7, p: 2833255/7351344 }` → `r=7, p=2833255/7351344`
- **Source:** Statistics LibreTexts §12.9 optimal-strategy table (n=3..20) — canonical optimal-stopping interview question.
- **Approaches:** Maximize p_18(r) over r. Equivalent rule: the optimal r is the largest with Σ_{j=r}^{18} 1/(j-1) > 1; here that gives r=7, p=2833255/7351344 (≈ 39%). / p_n(r) rises then falls (unimodal); stop increasing r once the marginal harmonic term drops the sum below 1.
- **Hint ladder:** (1) The success probability is unimodal in r — rises, peaks, then falls. Find the peak. (2) Adding one more rejected candidate helps exactly while Σ_{j=r}^{n} 1/(j-1) > 1. (3) Take the largest r for which that harmonic tail still exceeds 1 — for n=18 that is r=7.
- **Follow-ups:** What fraction r/n is this, and what number does it approach as n grows? / Compare this to hiring the first candidate blindly (1/18). How much does the rule buy you?

### tmpl-optimal-cutoff#n20  `brutal`

**Prompt.** With 20 candidates arriving in random order under the irrevocable-choice rules, which cutoff r (reject the first r-1, then take the first record) MAXIMIZES your chance of hiring the single best — and what is that maximum probability?

- **Answer (engine-verified):** `r=8, p=3407275/8868288`
- **Engine check:** `optimalCutoff(20)  // -> { r: 8, p: 3407275/8868288 }` → `r=8, p=3407275/8868288`
- **Source:** Statistics LibreTexts §12.9 optimal-strategy table (n=3..20) — canonical optimal-stopping interview question.
- **Approaches:** Maximize p_20(r) over r. Equivalent rule: the optimal r is the largest with Σ_{j=r}^{20} 1/(j-1) > 1; here that gives r=8, p=3407275/8868288 (≈ 38%). / p_n(r) rises then falls (unimodal); stop increasing r once the marginal harmonic term drops the sum below 1.
- **Hint ladder:** (1) The success probability is unimodal in r — rises, peaks, then falls. Find the peak. (2) Adding one more rejected candidate helps exactly while Σ_{j=r}^{n} 1/(j-1) > 1. (3) Take the largest r for which that harmonic tail still exceeds 1 — for n=20 that is r=8.
- **Follow-ups:** What fraction r/n is this, and what number does it approach as n grows? / Compare this to hiring the first candidate blindly (1/20). How much does the rule buy you?

### tmpl-naive-vs-optimal#n4  `hard`

**Prompt.** A hiring manager with 4 candidates says "I'll just hire the first decent one — the first candidate." You counter with the optimal look-then-leap rule. State both success probabilities (manager's vs yours) and the exact improvement.

- **Answer (engine-verified):** `naive=1/4, optimal=11/24 (r=2)`
- **Engine check:** `formatRational(naiveSuccess(4)); formatRational(optimalCutoff(4).p)` → `naive=1/4, optimal=11/24 (r=2)`
- **Source:** Stanford AMDM Lecture 8 (take-first = 1/n; optimal strategy) — interview framing.
- **Approaches:** Take-first wins iff the best is in seat 1 → 1/4 = 1/4. The optimal rule (cutoff r=2) wins 11/24 ≈ 46%. / Any rule that ignores the candidates seen so far ties at 1/n; the gain comes entirely from using the reject phase as a benchmark.
- **Hint ladder:** (1) What does "hire the first" actually depend on? Only the best landing in seat 1. (2) That is 1/n. Now contrast with a rule that scouts first. (3) Optimal cutoff r=2 gives 11/24; subtract to get the edge.
- **Follow-ups:** As n → ∞, what happens to each probability? / When would "hire the first decent one" actually be reasonable?

### tmpl-naive-vs-optimal#n5  `hard`

**Prompt.** A hiring manager with 5 candidates says "I'll just hire the first decent one — the first candidate." You counter with the optimal look-then-leap rule. State both success probabilities (manager's vs yours) and the exact improvement.

- **Answer (engine-verified):** `naive=1/5, optimal=13/30 (r=3)`
- **Engine check:** `formatRational(naiveSuccess(5)); formatRational(optimalCutoff(5).p)` → `naive=1/5, optimal=13/30 (r=3)`
- **Source:** Stanford AMDM Lecture 8 (take-first = 1/n; optimal strategy) — interview framing.
- **Approaches:** Take-first wins iff the best is in seat 1 → 1/5 = 1/5. The optimal rule (cutoff r=3) wins 13/30 ≈ 43%. / Any rule that ignores the candidates seen so far ties at 1/n; the gain comes entirely from using the reject phase as a benchmark.
- **Hint ladder:** (1) What does "hire the first" actually depend on? Only the best landing in seat 1. (2) That is 1/n. Now contrast with a rule that scouts first. (3) Optimal cutoff r=3 gives 13/30; subtract to get the edge.
- **Follow-ups:** As n → ∞, what happens to each probability? / When would "hire the first decent one" actually be reasonable?

### tmpl-naive-vs-optimal#n7  `harder`

**Prompt.** A hiring manager with 7 candidates says "I'll just hire the first decent one — the first candidate." You counter with the optimal look-then-leap rule. State both success probabilities (manager's vs yours) and the exact improvement.

- **Answer (engine-verified):** `naive=1/7, optimal=29/70 (r=3)`
- **Engine check:** `formatRational(naiveSuccess(7)); formatRational(optimalCutoff(7).p)` → `naive=1/7, optimal=29/70 (r=3)`
- **Source:** Stanford AMDM Lecture 8 (take-first = 1/n; optimal strategy) — interview framing.
- **Approaches:** Take-first wins iff the best is in seat 1 → 1/7 = 1/7. The optimal rule (cutoff r=3) wins 29/70 ≈ 41%. / Any rule that ignores the candidates seen so far ties at 1/n; the gain comes entirely from using the reject phase as a benchmark.
- **Hint ladder:** (1) What does "hire the first" actually depend on? Only the best landing in seat 1. (2) That is 1/n. Now contrast with a rule that scouts first. (3) Optimal cutoff r=3 gives 29/70; subtract to get the edge.
- **Follow-ups:** As n → ∞, what happens to each probability? / When would "hire the first decent one" actually be reasonable?

### tmpl-naive-vs-optimal#n10  `harder`

**Prompt.** A hiring manager with 10 candidates says "I'll just hire the first decent one — the first candidate." You counter with the optimal look-then-leap rule. State both success probabilities (manager's vs yours) and the exact improvement.

- **Answer (engine-verified):** `naive=1/10, optimal=3349/8400 (r=4)`
- **Engine check:** `formatRational(naiveSuccess(10)); formatRational(optimalCutoff(10).p)` → `naive=1/10, optimal=3349/8400 (r=4)`
- **Source:** Stanford AMDM Lecture 8 (take-first = 1/n; optimal strategy) — interview framing.
- **Approaches:** Take-first wins iff the best is in seat 1 → 1/10 = 1/10. The optimal rule (cutoff r=4) wins 3349/8400 ≈ 40%. / Any rule that ignores the candidates seen so far ties at 1/n; the gain comes entirely from using the reject phase as a benchmark.
- **Hint ladder:** (1) What does "hire the first" actually depend on? Only the best landing in seat 1. (2) That is 1/n. Now contrast with a rule that scouts first. (3) Optimal cutoff r=4 gives 3349/8400; subtract to get the edge.
- **Follow-ups:** As n → ∞, what happens to each probability? / When would "hire the first decent one" actually be reasonable?

### tmpl-naive-vs-optimal#n20  `brutal`

**Prompt.** A hiring manager with 20 candidates says "I'll just hire the first decent one — the first candidate." You counter with the optimal look-then-leap rule. State both success probabilities (manager's vs yours) and the exact improvement.

- **Answer (engine-verified):** `naive=1/20, optimal=3407275/8868288 (r=8)`
- **Engine check:** `formatRational(naiveSuccess(20)); formatRational(optimalCutoff(20).p)` → `naive=1/20, optimal=3407275/8868288 (r=8)`
- **Source:** Stanford AMDM Lecture 8 (take-first = 1/n; optimal strategy) — interview framing.
- **Approaches:** Take-first wins iff the best is in seat 1 → 1/20 = 1/20. The optimal rule (cutoff r=8) wins 3407275/8868288 ≈ 38%. / Any rule that ignores the candidates seen so far ties at 1/n; the gain comes entirely from using the reject phase as a benchmark.
- **Hint ladder:** (1) What does "hire the first" actually depend on? Only the best landing in seat 1. (2) That is 1/n. Now contrast with a rule that scouts first. (3) Optimal cutoff r=8 gives 3407275/8868288; subtract to get the edge.
- **Follow-ups:** As n → ∞, what happens to each probability? / When would "hire the first decent one" actually be reasonable?

### tmpl-skip-count#n10  `hard`

**Prompt.** Classic: 10 applicants interview in random order, you decide on the spot, and you only "win" by hiring the very best. Using the optimal strategy, how many applicants should you reject outright before you start being willing to hire?

- **Answer (engine-verified):** `3`
- **Engine check:** `optimalCutoff(10).r - 1  // = 3` → `3`
- **Source:** Wikipedia "Secretary problem" (reject ~n/e, then take the first record) — the textbook quant phrasing.
- **Approaches:** Optimal cutoff r=4, so reject the first r-1 = 3, then hire the first candidate better than all 3. / As a fraction that is 3/10 ≈ 30%, hugging 1/e ≈ 37% for large n.
- **Hint ladder:** (1) The optimal rule has a single reject-then-accept threshold. (2) Reject the first r−1 where r is the optimal cutoff for this n. (3) For n=10 the optimal cutoff is r=4, so you reject 3.
- **Follow-ups:** What success probability does this give, roughly? / Does the answer fraction change much between n=100 and n=1,000,000?

### tmpl-skip-count#n20  `harder`

**Prompt.** Classic: 20 applicants interview in random order, you decide on the spot, and you only "win" by hiring the very best. Using the optimal strategy, how many applicants should you reject outright before you start being willing to hire?

- **Answer (engine-verified):** `7`
- **Engine check:** `optimalCutoff(20).r - 1  // = 7` → `7`
- **Source:** Wikipedia "Secretary problem" (reject ~n/e, then take the first record) — the textbook quant phrasing.
- **Approaches:** Optimal cutoff r=8, so reject the first r-1 = 7, then hire the first candidate better than all 7. / As a fraction that is 7/20 ≈ 35%, hugging 1/e ≈ 37% for large n.
- **Hint ladder:** (1) The optimal rule has a single reject-then-accept threshold. (2) Reject the first r−1 where r is the optimal cutoff for this n. (3) For n=20 the optimal cutoff is r=8, so you reject 7.
- **Follow-ups:** What success probability does this give, roughly? / Does the answer fraction change much between n=100 and n=1,000,000?

### tmpl-skip-count#n50  `harder`

**Prompt.** Classic: 50 applicants interview in random order, you decide on the spot, and you only "win" by hiring the very best. Using the optimal strategy, how many applicants should you reject outright before you start being willing to hire?

- **Answer (engine-verified):** `18`
- **Engine check:** `optimalCutoff(50).r - 1  // = 18` → `18`
- **Source:** Wikipedia "Secretary problem" (reject ~n/e, then take the first record) — the textbook quant phrasing.
- **Approaches:** Optimal cutoff r=19, so reject the first r-1 = 18, then hire the first candidate better than all 18. / As a fraction that is 18/50 ≈ 36%, hugging 1/e ≈ 37% for large n.
- **Hint ladder:** (1) The optimal rule has a single reject-then-accept threshold. (2) Reject the first r−1 where r is the optimal cutoff for this n. (3) For n=50 the optimal cutoff is r=19, so you reject 18.
- **Follow-ups:** What success probability does this give, roughly? / Does the answer fraction change much between n=100 and n=1,000,000?

### tmpl-skip-count#n100  `brutal`

**Prompt.** Classic: 100 applicants interview in random order, you decide on the spot, and you only "win" by hiring the very best. Using the optimal strategy, how many applicants should you reject outright before you start being willing to hire?

- **Answer (engine-verified):** `37`
- **Engine check:** `optimalCutoff(100).r - 1  // = 37` → `37`
- **Source:** Wikipedia "Secretary problem" (reject ~n/e, then take the first record) — the textbook quant phrasing.
- **Approaches:** Optimal cutoff r=38, so reject the first r-1 = 37, then hire the first candidate better than all 37. / As a fraction that is 37/100 ≈ 37%, hugging 1/e ≈ 37% for large n.
- **Hint ladder:** (1) The optimal rule has a single reject-then-accept threshold. (2) Reject the first r−1 where r is the optimal cutoff for this n. (3) For n=100 the optimal cutoff is r=38, so you reject 37.
- **Follow-ups:** What success probability does this give, roughly? / Does the answer fraction change much between n=100 and n=1,000,000?

### tmpl-run-outcome#213-c1  `hard`

**Prompt.** You impatiently hire the first candidate. The candidates' true ranks (1 = best) arrive in this order: [2, 1, 3]. You use the look-then-leap rule with cutoff r=1 (reject the first 0, then take the first who beats the best so far; take the last if none do). Which arrival position do you hire, and is it the best?

- **Answer (engine-verified):** `position 1 (rank 2) — miss`
- **Engine check:** `runStrategy([2, 1, 3], 1)` → `position 1 (rank 2) — miss`
- **Source:** Standard secretary-problem trace question (relative-rank arrivals) — interview drill.
- **Approaches:** Look phase = positions 1..0: benchmark = best (min rank) seen. Leap phase: accept the first rank below the benchmark. / Tracing [2, 1, 3] with cutoff 1 gives position 1 (rank 2) — miss.
- **Hint ladder:** (1) Split the sequence into the reject (look) phase and the accept (leap) phase. (2) The benchmark is the smallest rank in the look phase; in the leap phase take the first rank below it. (3) Walk left to right and stop at the first leap-phase candidate beating the benchmark.
- **Follow-ups:** For this same order, which cutoff would have landed the best? / Over all orders of this length, what is the win rate at this cutoff?

### tmpl-run-outcome#213-c2  `hard`

**Prompt.** A 3-person search. The candidates' true ranks (1 = best) arrive in this order: [2, 1, 3]. You use the look-then-leap rule with cutoff r=2 (reject the first 1, then take the first who beats the best so far; take the last if none do). Which arrival position do you hire, and is it the best?

- **Answer (engine-verified):** `position 2 (rank 1) — WIN, the best`
- **Engine check:** `runStrategy([2, 1, 3], 2)` → `position 2 (rank 1) — WIN, the best`
- **Source:** Standard secretary-problem trace question (relative-rank arrivals) — interview drill.
- **Approaches:** Look phase = positions 1..1: benchmark = best (min rank) seen. Leap phase: accept the first rank below the benchmark. / Tracing [2, 1, 3] with cutoff 2 gives position 2 (rank 1) — WIN, the best.
- **Hint ladder:** (1) Split the sequence into the reject (look) phase and the accept (leap) phase. (2) The benchmark is the smallest rank in the look phase; in the leap phase take the first rank below it. (3) Walk left to right and stop at the first leap-phase candidate beating the benchmark.
- **Follow-ups:** For this same order, which cutoff would have landed the best? / Over all orders of this length, what is the win rate at this cutoff?

### tmpl-run-outcome#312-c2  `hard`

**Prompt.** A 3-person search. The candidates' true ranks (1 = best) arrive in this order: [3, 1, 2]. You use the look-then-leap rule with cutoff r=2 (reject the first 1, then take the first who beats the best so far; take the last if none do). Which arrival position do you hire, and is it the best?

- **Answer (engine-verified):** `position 2 (rank 1) — WIN, the best`
- **Engine check:** `runStrategy([3, 1, 2], 2)` → `position 2 (rank 1) — WIN, the best`
- **Source:** Standard secretary-problem trace question (relative-rank arrivals) — interview drill.
- **Approaches:** Look phase = positions 1..1: benchmark = best (min rank) seen. Leap phase: accept the first rank below the benchmark. / Tracing [3, 1, 2] with cutoff 2 gives position 2 (rank 1) — WIN, the best.
- **Hint ladder:** (1) Split the sequence into the reject (look) phase and the accept (leap) phase. (2) The benchmark is the smallest rank in the look phase; in the leap phase take the first rank below it. (3) Walk left to right and stop at the first leap-phase candidate beating the benchmark.
- **Follow-ups:** For this same order, which cutoff would have landed the best? / Over all orders of this length, what is the win rate at this cutoff?

### tmpl-run-outcome#123-c2  `harder`

**Prompt.** A 3-person search where the strongest comes first. The candidates' true ranks (1 = best) arrive in this order: [1, 2, 3]. You use the look-then-leap rule with cutoff r=2 (reject the first 1, then take the first who beats the best so far; take the last if none do). Which arrival position do you hire, and is it the best?

- **Answer (engine-verified):** `position 3 (rank 3) — miss`
- **Engine check:** `runStrategy([1, 2, 3], 2)` → `position 3 (rank 3) — miss`
- **Source:** Standard secretary-problem trace question (relative-rank arrivals) — interview drill.
- **Approaches:** Look phase = positions 1..1: benchmark = best (min rank) seen. Leap phase: accept the first rank below the benchmark. / Tracing [1, 2, 3] with cutoff 2 gives position 3 (rank 3) — miss.
- **Hint ladder:** (1) Split the sequence into the reject (look) phase and the accept (leap) phase. (2) The benchmark is the smallest rank in the look phase; in the leap phase take the first rank below it. (3) Walk left to right and stop at the first leap-phase candidate beating the benchmark.
- **Follow-ups:** For this same order, which cutoff would have landed the best? / Over all orders of this length, what is the win rate at this cutoff?

### tmpl-run-outcome#2314-c2  `harder`

**Prompt.** A 4-person search. The candidates' true ranks (1 = best) arrive in this order: [2, 3, 1, 4]. You use the look-then-leap rule with cutoff r=2 (reject the first 1, then take the first who beats the best so far; take the last if none do). Which arrival position do you hire, and is it the best?

- **Answer (engine-verified):** `position 3 (rank 1) — WIN, the best`
- **Engine check:** `runStrategy([2, 3, 1, 4], 2)` → `position 3 (rank 1) — WIN, the best`
- **Source:** Standard secretary-problem trace question (relative-rank arrivals) — interview drill.
- **Approaches:** Look phase = positions 1..1: benchmark = best (min rank) seen. Leap phase: accept the first rank below the benchmark. / Tracing [2, 3, 1, 4] with cutoff 2 gives position 3 (rank 1) — WIN, the best.
- **Hint ladder:** (1) Split the sequence into the reject (look) phase and the accept (leap) phase. (2) The benchmark is the smallest rank in the look phase; in the leap phase take the first rank below it. (3) Walk left to right and stop at the first leap-phase candidate beating the benchmark.
- **Follow-ups:** For this same order, which cutoff would have landed the best? / Over all orders of this length, what is the win rate at this cutoff?

### tmpl-run-outcome#4321-c2  `harder`

**Prompt.** A 4-person search in worsening-then-best order. The candidates' true ranks (1 = best) arrive in this order: [4, 3, 2, 1]. You use the look-then-leap rule with cutoff r=2 (reject the first 1, then take the first who beats the best so far; take the last if none do). Which arrival position do you hire, and is it the best?

- **Answer (engine-verified):** `position 2 (rank 3) — miss`
- **Engine check:** `runStrategy([4, 3, 2, 1], 2)` → `position 2 (rank 3) — miss`
- **Source:** Standard secretary-problem trace question (relative-rank arrivals) — interview drill.
- **Approaches:** Look phase = positions 1..1: benchmark = best (min rank) seen. Leap phase: accept the first rank below the benchmark. / Tracing [4, 3, 2, 1] with cutoff 2 gives position 2 (rank 3) — miss.
- **Hint ladder:** (1) Split the sequence into the reject (look) phase and the accept (leap) phase. (2) The benchmark is the smallest rank in the look phase; in the leap phase take the first rank below it. (3) Walk left to right and stop at the first leap-phase candidate beating the benchmark.
- **Follow-ups:** For this same order, which cutoff would have landed the best? / Over all orders of this length, what is the win rate at this cutoff?

### tmpl-run-outcome#35142-c3  `harder`

**Prompt.** Five apartments, viewed one at a time. The candidates' true ranks (1 = best) arrive in this order: [3, 5, 1, 4, 2]. You use the look-then-leap rule with cutoff r=3 (reject the first 2, then take the first who beats the best so far; take the last if none do). Which arrival position do you hire, and is it the best?

- **Answer (engine-verified):** `position 3 (rank 1) — WIN, the best`
- **Engine check:** `runStrategy([3, 5, 1, 4, 2], 3)` → `position 3 (rank 1) — WIN, the best`
- **Source:** Standard secretary-problem trace question (relative-rank arrivals) — interview drill.
- **Approaches:** Look phase = positions 1..2: benchmark = best (min rank) seen. Leap phase: accept the first rank below the benchmark. / Tracing [3, 5, 1, 4, 2] with cutoff 3 gives position 3 (rank 1) — WIN, the best.
- **Hint ladder:** (1) Split the sequence into the reject (look) phase and the accept (leap) phase. (2) The benchmark is the smallest rank in the look phase; in the leap phase take the first rank below it. (3) Walk left to right and stop at the first leap-phase candidate beating the benchmark.
- **Follow-ups:** For this same order, which cutoff would have landed the best? / Over all orders of this length, what is the win rate at this cutoff?

### tmpl-run-outcome#54321-c3  `brutal`

**Prompt.** Five candidates arriving worst to best. The candidates' true ranks (1 = best) arrive in this order: [5, 4, 3, 2, 1]. You use the look-then-leap rule with cutoff r=3 (reject the first 2, then take the first who beats the best so far; take the last if none do). Which arrival position do you hire, and is it the best?

- **Answer (engine-verified):** `position 3 (rank 3) — miss`
- **Engine check:** `runStrategy([5, 4, 3, 2, 1], 3)` → `position 3 (rank 3) — miss`
- **Source:** Standard secretary-problem trace question (relative-rank arrivals) — interview drill.
- **Approaches:** Look phase = positions 1..2: benchmark = best (min rank) seen. Leap phase: accept the first rank below the benchmark. / Tracing [5, 4, 3, 2, 1] with cutoff 3 gives position 3 (rank 3) — miss.
- **Hint ladder:** (1) Split the sequence into the reject (look) phase and the accept (leap) phase. (2) The benchmark is the smallest rank in the look phase; in the leap phase take the first rank below it. (3) Walk left to right and stop at the first leap-phase candidate beating the benchmark.
- **Follow-ups:** For this same order, which cutoff would have landed the best? / Over all orders of this length, what is the win rate at this cutoff?

### tmpl-run-outcome#132-c1  `hard`

**Prompt.** You hire the very first candidate. The candidates' true ranks (1 = best) arrive in this order: [1, 3, 2]. You use the look-then-leap rule with cutoff r=1 (reject the first 0, then take the first who beats the best so far; take the last if none do). Which arrival position do you hire, and is it the best?

- **Answer (engine-verified):** `position 1 (rank 1) — WIN, the best`
- **Engine check:** `runStrategy([1, 3, 2], 1)` → `position 1 (rank 1) — WIN, the best`
- **Source:** Standard secretary-problem trace question (relative-rank arrivals) — interview drill.
- **Approaches:** Look phase = positions 1..0: benchmark = best (min rank) seen. Leap phase: accept the first rank below the benchmark. / Tracing [1, 3, 2] with cutoff 1 gives position 1 (rank 1) — WIN, the best.
- **Hint ladder:** (1) Split the sequence into the reject (look) phase and the accept (leap) phase. (2) The benchmark is the smallest rank in the look phase; in the leap phase take the first rank below it. (3) Walk left to right and stop at the first leap-phase candidate beating the benchmark.
- **Follow-ups:** For this same order, which cutoff would have landed the best? / Over all orders of this length, what is the win rate at this cutoff?

### tmpl-run-outcome#2413-c2  `harder`

**Prompt.** A 4-person search. The candidates' true ranks (1 = best) arrive in this order: [2, 4, 1, 3]. You use the look-then-leap rule with cutoff r=2 (reject the first 1, then take the first who beats the best so far; take the last if none do). Which arrival position do you hire, and is it the best?

- **Answer (engine-verified):** `position 3 (rank 1) — WIN, the best`
- **Engine check:** `runStrategy([2, 4, 1, 3], 2)` → `position 3 (rank 1) — WIN, the best`
- **Source:** Standard secretary-problem trace question (relative-rank arrivals) — interview drill.
- **Approaches:** Look phase = positions 1..1: benchmark = best (min rank) seen. Leap phase: accept the first rank below the benchmark. / Tracing [2, 4, 1, 3] with cutoff 2 gives position 3 (rank 1) — WIN, the best.
- **Hint ladder:** (1) Split the sequence into the reject (look) phase and the accept (leap) phase. (2) The benchmark is the smallest rank in the look phase; in the leap phase take the first rank below it. (3) Walk left to right and stop at the first leap-phase candidate beating the benchmark.
- **Follow-ups:** For this same order, which cutoff would have landed the best? / Over all orders of this length, what is the win rate at this cutoff?

### tmpl-run-outcome#4132-c2  `harder`

**Prompt.** A 4-person search where a strong candidate comes early. The candidates' true ranks (1 = best) arrive in this order: [4, 1, 3, 2]. You use the look-then-leap rule with cutoff r=2 (reject the first 1, then take the first who beats the best so far; take the last if none do). Which arrival position do you hire, and is it the best?

- **Answer (engine-verified):** `position 2 (rank 1) — WIN, the best`
- **Engine check:** `runStrategy([4, 1, 3, 2], 2)` → `position 2 (rank 1) — WIN, the best`
- **Source:** Standard secretary-problem trace question (relative-rank arrivals) — interview drill.
- **Approaches:** Look phase = positions 1..1: benchmark = best (min rank) seen. Leap phase: accept the first rank below the benchmark. / Tracing [4, 1, 3, 2] with cutoff 2 gives position 2 (rank 1) — WIN, the best.
- **Hint ladder:** (1) Split the sequence into the reject (look) phase and the accept (leap) phase. (2) The benchmark is the smallest rank in the look phase; in the leap phase take the first rank below it. (3) Walk left to right and stop at the first leap-phase candidate beating the benchmark.
- **Follow-ups:** For this same order, which cutoff would have landed the best? / Over all orders of this length, what is the win rate at this cutoff?

### ff-the-37-percent-rule  `brutal`

**Prompt.** In the classical secretary problem, as the number of candidates n grows without bound, what fraction of candidates should you skip, and what is your probability of hiring the single best? Explain the famous coincidence.

- **Answer (engine-verified):** `1/e ≈ 0.368 (both the skip fraction r*/n and the success probability converge to 1/e)`
- **Engine check:** `optimalCutoff(100)  // r=38, r/n=0.38, p≈0.371 — the finite anchor heading to 1/e` → `1/e ≈ 0.368`
- **Source:** Wikipedia "Secretary problem" / Stanford AMDM L8 — the 1/e law.
- **Approaches:** In the continuous limit, skipping fraction x gives success ≈ x·ln(1/x); maximizing −x·ln x sets the derivative −ln x − 1 = 0, so x = 1/e, and the max value is also 1/e. / Finite check: for n=100 the engine gives r*=38 (skip 37/100 = 37%) and p*≈37%, already near 1/e.
- **Hint ladder:** (1) Write the large-n success as a function of the skip fraction x = r/n. (2) It is approximately x·ln(1/x). Maximize it. (3) The maximizer and the maximum value are both 1/e ≈ 0.368.
- **Follow-ups:** Why are the optimal threshold and the optimal success probability the SAME number? / Does the answer depend on whether n is 100 or 100 million?

### ff-apartment-hunt  `harder`

**Prompt.** You will view 5 apartments in a random order; each is gone the moment you leave, and you want the single best. Using the optimal rule, how many do you view-and-pass first, and what is your chance of landing the best?

- **Answer (engine-verified):** `skip 2, P(best) = 13/30 ≈ 43%`
- **Engine check:** `optimalCutoff(5)  // r=3, p=13/30` → `skip 2, P(best) = 13/30`
- **Source:** Wikipedia "Secretary problem" (house-hunting framing) — applied optimal stopping.
- **Approaches:** Optimal cutoff for n=5 is r=3, so view and pass the first 2, then take the first apartment better than both. / p_5(3) = (2/5)(1/2 + 1/3 + 1/4) = (2/5)(13/12) = 13/30.
- **Hint ladder:** (1) Same secretary problem with n=5; find the optimal cutoff. (2) The optimal cutoff is r=3, so the look phase is the first 2. (3) Compute p_5(3) = (2/5)·(1/2+1/3+1/4).
- **Follow-ups:** How does this compare to just taking the first apartment you like? / What if you would accept the second-best too?

### ff-why-irrevocable  `hard`

**Prompt.** In the best-choice problem, prove that ANY strategy that commits to a fixed arrival position (or picks one at random) — ignoring the candidates it has seen — has success probability exactly 1/n.

- **Answer (engine-verified):** `1/n`
- **Engine check:** `naiveSuccess(10)  // 1/10, representative of 1/n` → `1/n`
- **Source:** Statistics LibreTexts §12.9 / Stanford AMDM L8.
- **Approaches:** The single best is equally likely to occupy any of the n positions (uniform over a random permutation). / A rule that commits to one position wins iff the best lands there: probability 1/n. Randomizing the position averages 1/n with weight 1, still 1/n.
- **Hint ladder:** (1) Where is the best candidate, as a random variable? (2) Its position is uniform on {1,…,n}. (3) A fixed-position rule wins exactly when the best is at that position.
- **Follow-ups:** What is the only way to beat 1/n? / Why does using earlier candidates as a benchmark help?

### ff-full-information-contrast  `brutal`

**Prompt.** The classic 1/e result assumes you see only RELATIVE ranks. If instead each candidate had a known numeric score drawn from a known distribution (full information), would your best-possible win probability be higher or lower than 1/e — and intuitively why?

- **Answer (engine-verified):** `Higher than 1/e — full information lets you use thresholds on actual values (Gilbert–Mosteller ≈ 0.58).`
- **Engine check:** `optimalCutoff(20)  // no-info benchmark r=8, p≈0.384 for comparison` → `Higher than 1/e`
- **Source:** Wikipedia "Secretary problem" (Gilbert–Mosteller full-information variant).
- **Approaches:** Knowing the value distribution lets you accept early when a value is extreme, not just when it is a new record — strictly more information. / The rank-only optimum is ~1/e (engine: n=20 gives p≈38%); the full-information optimum is higher (~0.58).
- **Hint ladder:** (1) Does extra information ever reduce your best-possible performance? (2) With known values you can use value thresholds, not just record-events. (3) So the optimum can only rise above the rank-only 1/e.
- **Follow-ups:** What changes if you only need a candidate in the top 10%? / What if recall (going back) is allowed?

