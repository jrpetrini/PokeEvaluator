# Pokémon Quality Evaluation Framework — Gen III (FireRed/LeafGreen)

## Purpose

A mathematical framework for evaluating the quality of freshly caught Pokémon based on their nature, IVs, and intended role. Designed to support a Claude Code project where the user inputs a Pokémon's species, level, nature, and visible stats, and receives a quality dashboard comparing the specimen against the theoretical distribution.

---

## 1. Background: Gen III Mechanics

### IVs (Individual Values)

Each Pokémon has 6 IVs, one per stat (HP, Atk, Def, SpAtk, SpDef, Spe), each drawn independently and uniformly from {0, 1, ..., 31}. IVs are hidden and permanent.

### Natures

There are 25 natures. 20 of them boost one stat by 10% and reduce another by 10%. 5 are neutral (Hardy, Docile, Serious, Bashful, Quirky). Nature is drawn uniformly at random.

### Gen III Stat Formula

For HP:

$$\text{HP} = \left\lfloor \frac{(2 \times \text{Base} + \text{IV} + \lfloor \text{EV}/4 \rfloor) \times \text{Level}}{100} \right\rfloor + \text{Level} + 10$$

For all other stats:

$$\text{Stat} = \left\lfloor \left( \left\lfloor \frac{(2 \times \text{Base} + \text{IV} + \lfloor \text{EV}/4 \rfloor) \times \text{Level}}{100} \right\rfloor + 5 \right) \times \text{NatureMod} \right\rfloor$$

Where NatureMod ∈ {0.9, 1.0, 1.1}.

### IV Recovery from Observed Stats

For a freshly caught Pokémon (EV = 0), the stat formula can be inverted to recover the IV (or a narrow range of possible IVs) from the observed stat value, given known Base stat, Level, and Nature.

---

## 2. Quality Metric

### Definition

Define the effective contribution of stat $i$:

$$c_i = \text{IV}_i \times n_i$$

Where $n_i \in \{0.9, 1.0, 1.1\}$ is the nature modifier for stat $i$.

The weighted quality score:

$$Q = \frac{\sum_{i=1}^{6} w_i \cdot c_i - Q_{\min}}{Q_{\max} - Q_{\min}}$$

Where:

- $w_i$ are role-based importance weights for each stat.
- $Q_{\min} = \sum_i w_i \cdot 0 \cdot 0.9 = 0$ (worst case: all IVs = 0, all penalized).
- $Q_{\max} = \sum_i w_i \cdot 31 \cdot 1.1$ (best case: all IVs = 31, all boosted).

This yields $Q \in [0, 1]$.

Note: since nature couples stats (boosting one penalizes another), $Q_{\min}$ and $Q_{\max}$ are theoretical extremes that cannot both be achieved simultaneously. This is acceptable — they serve as normalization bounds.

### Role-Based Weights

Pokémon are classified by role, and weights reflect how much each stat matters for that role:

| Role | HP | Atk | Def | SpAtk | SpDef | Spe |
|---|---|---|---|---|---|---|
| Physical Sweeper | 0.3 | 1.0 | 0.2 | 0.0 | 0.3 | 1.0 |
| Special Sweeper | 0.3 | 0.0 | 0.2 | 1.0 | 0.3 | 1.0 |
| Mixed Bulk Attacker | 0.7 | 1.0 | 0.6 | 1.0 | 0.6 | 0.2 |
| Physical Wall | 1.0 | 0.3 | 1.0 | 0.0 | 0.5 | 0.1 |
| Special Wall | 1.0 | 0.3 | 0.5 | 0.0 | 1.0 | 0.1 |
| Gimmick/Utility | 0.5 | 0.3 | 0.5 | 0.3 | 0.5 | 0.5 |

These are starting templates. Users should be able to define custom weights per Pokémon.

### Key Design Principle: Diminishing Importance of High-Base Stats

The absolute IV contribution to a final stat is constant regardless of base stat (~15 points at level 50). But the *relative* impact is smaller when the base stat is already high. A Snorlax with base 160 SpDef barely notices IV variance; a Gengar with base 75 SpDef feels it acutely. The weight system captures this indirectly: if a Pokémon's base stat is so high that IV variance is noise, that stat gets a lower weight.

---

## 3. Probability Model

### Single-Catch Success (Threshold Model)

Given a quality threshold $q$, the probability that a single random Pokémon meets $Q \geq q$:

$$p(q) = P(Q \geq q)$$

This is computed via Monte Carlo simulation (see Section 5).

### n-Catch Model

Each catch is an independent Bernoulli trial with success probability $p(q)$. The probability of at least one success in $n$ catches:

$$P(N \leq n) = 1 - (1 - p(q))^n$$

Expected catches to first success:

$$E[N] = \frac{1}{p(q)}$$

Catches needed for confidence level $\alpha$:

$$n_\alpha = \left\lceil \frac{\ln(1 - \alpha)}{\ln(1 - p(q))} \right\rceil$$

---

## 4. Earlier Simplified Models

Before arriving at the continuous quality metric, two simpler models were developed:

### Model A: Independent Nature + IV Floor

$$p = \frac{k}{25} \cdot \left(\frac{32 - t}{32}\right)^6$$

Where $k$ = number of acceptable natures, $t$ = minimum IV threshold for all 6 stats.

### Model B: Role-Aware Relevant Stats

Only require $m$ relevant stats (determined by role) to pass the threshold:

$$p = \frac{k}{25} \cdot \left(\frac{32 - t}{32}\right)^m$$

This dramatically reduces required catches — e.g., for $k=5$, $t=10$: $m=6$ gives $E[N]=47$, but $m=3$ gives $E[N]=7$.

### Model C: Mixed Thresholds

Apply strict threshold $t_\text{high}$ to core stats and relaxed threshold $t_\text{low}$ to secondary stats:

$$p = \frac{k}{25} \cdot \left(\frac{32 - t_\text{high}}{32}\right)^{m_\text{high}} \cdot \left(\frac{32 - t_\text{low}}{32}\right)^{m_\text{low}}$$

Example (Poliwrath): $k=9$, $t_\text{high}=10$, $m_\text{high}=2$ (Atk, SpAtk), $t_\text{low}=5$, $m_\text{low}=3$ (HP, Def, SpDef), Speed excluded.

$$p \approx 0.102, \quad E[N] \approx 10, \quad n_{90\%} = 22$$

---

## 5. Monte Carlo Simulation

The continuous quality metric $Q$ is best evaluated via simulation:

1. For each of $N_\text{samples}$ iterations (recommend 200,000):
   a. Draw a nature uniformly from 25 options.
   b. Draw 6 IVs independently from Uniform(0, 31).
   c. Compute $c_i = \text{IV}_i \times n_i$ for each stat.
   d. Compute $Q = \frac{\sum w_i c_i - Q_{\min}}{Q_{\max} - Q_{\min}}$.
2. Sort scores, build empirical CDF.
3. For any threshold $q$, read off $p(q) = P(Q \geq q)$.
4. Build $n$-catch probability curves: $P(N \leq n) = 1 - (1-p(q))^n$.

---

## 6. Practical Rule of Thumb

From both the analytical and Monte Carlo models, a consistent result emerges:

**Catching 20 copies and picking the best yields a Pokémon above Q ≥ 70% with ~95% confidence for most role profiles.**

The second-best catch is almost certainly above Q ≥ 50%, making it suitable as a playthrough Pokémon while the best specimen is reserved in the PC for post-game EV training.

---

## 7. Dashboard Specification (Claude Code Project)

### Input

- Pokémon species (determines base stats)
- Level at capture
- Nature (selected from list of 25)
- Observed stats (6 values: HP, Atk, Def, SpAtk, SpDef, Spe)
- Role weights (preset or custom)

### Computed Outputs

1. **IV Recovery**: From the stat formula with EV=0, compute exact or candidate IVs for each stat.
2. **Quality Score**: Compute $Q$ for this specific Pokémon.
3. **Percentile**: Where does this $Q$ fall in the simulated distribution? (e.g., "This Poliwag is in the 73rd percentile for a Mixed Bulk Attacker role.")
4. **Nature Assessment**: Is the nature beneficial, neutral, or detrimental for this role? Which natures would be better?
5. **IV Breakdown**: Per-stat IV assessment — highlight any stats where the IV is critically low relative to the weight.
6. **Comparison Dashboard**: Overlay this Pokémon's $Q$ on the simulated CDF. Show where it falls relative to the 25th, 50th, 75th, 90th percentile marks.
7. **Catch Planning**: Given the current best catch so far, how many more catches to have X% chance of finding something better?

### Visualization

- Histogram of simulated $Q$ distribution with the specimen marked.
- CDF curve with percentile highlighted.
- Per-stat radar chart: actual IVs vs ideal (31) vs median (15.5), weighted by importance.
- $n$-catch probability curves for various quality thresholds (50%, 60%, 70%, 80%, 90%).

---

## 8. Reference: Gen III Base Stats for Target Team

| Pokémon | HP | Atk | Def | SpAtk | SpDef | Spe | Suggested Role |
|---|---|---|---|---|---|---|---|
| Dugtrio | 35 | 80 | 50 | 50 | 70 | 120 | Trapper / Physical Sweeper |
| Poliwrath | 90 | 85 | 95 | 70 | 90 | 70 | Mixed Bulk Attacker |
| Alakazam | 55 | 50 | 45 | 135 | 95 | 120 | Special Sweeper |
| Magneton | 50 | 60 | 95 | 120 | 70 | 70 | Electric Wall / Pivot |
| Arcanine | 90 | 110 | 80 | 100 | 80 | 95 | Fire / Intimidate Pivot |
| Dragonite | 91 | 134 | 95 | 100 | 100 | 80 | Physical Sweeper |

---

## 9. Appendix: Nature Reference Table

| Nature | +10% | -10% |
|---|---|---|
| Hardy | — | — |
| Lonely | Atk | Def |
| Brave | Atk | Spe |
| Adamant | Atk | SpAtk |
| Naughty | Atk | SpDef |
| Bold | Def | Atk |
| Docile | — | — |
| Relaxed | Def | Spe |
| Impish | Def | SpAtk |
| Lax | Def | SpDef |
| Timid | Spe | Atk |
| Hasty | Spe | Def |
| Serious | — | — |
| Jolly | Spe | SpAtk |
| Naive | Spe | SpDef |
| Modest | SpAtk | Atk |
| Mild | SpAtk | Def |
| Quiet | SpAtk | Spe |
| Bashful | — | — |
| Rash | SpAtk | SpDef |
| Calm | SpDef | Atk |
| Gentle | SpDef | Def |
| Sassy | SpDef | Spe |
| Careful | SpDef | SpAtk |
| Quirky | — | — |
