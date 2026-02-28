# PokeEvaluator

CLI para avaliar a qualidade de Pokémon recém-capturados em **Gen III (FireRed / LeafGreen)**.

Você informa espécie, nível, natureza e stats observados na tela de sumário.
O PokeEvaluator recupera os IVs possíveis, calcula um **score de qualidade Q**,
estima o **percentil via Monte Carlo** e diz quantas capturas extras seriam
necessárias para ter boas chances de encontrar algo melhor.

```
pokeval evaluate Diglett 15 Jolly --hp 18 --atk 14 --def 10 --spatk 11 --spdef 12 --spe 22
```

---

## Instalação

```bash
# clonar e instalar em modo editável
git clone https://github.com/jrpetrini/PokeEvaluator.git
cd PokeEvaluator
pip install uv          # se ainda não tiver
uv sync                 # instala deps + dev deps
```

O comando `pokeval` fica disponível no virtualenv:

```bash
uv run pokeval --help
```

---

## Comandos

| Comando | Descrição |
|---------|-----------|
| `pokeval evaluate <espécie> <nível> <natureza> --hp … --spe …` | Avaliação completa |
| `pokeval interactive` | Modo interativo com autocomplete fuzzy |
| `pokeval pokedex` | Lista os 151 Pokémon e seus base stats |
| `pokeval roles` | Mostra os perfis de role e pesos por stat |
| `pokeval natures` | Lista as 25 naturezas e seus modificadores |

---

## Metodologia

### 1. Recuperação de IVs

Cada stat visível é governado pelas fórmulas de Gen III:

**HP:**

$$\text{HP} = \left\lfloor \frac{(2B + \text{IV}) \times L}{100} \right\rfloor + L + 10$$

**Demais stats:**

$$\text{Stat} = \left\lfloor \left( \left\lfloor \frac{(2B + \text{IV}) \times L}{100} \right\rfloor + 5 \right) \times m \right\rfloor$$

Onde $B$ = base stat, $L$ = nível, $m$ = modificador de natureza (0.9 / 1.0 / 1.1),
e EV = 0 (Pokémon recém-capturado).

Para recuperar o IV, o programa faz **busca exaustiva** nos 32 valores possíveis
(0–31) e retém todos que produzem o stat observado. Em níveis baixos várias IVs
geram o mesmo stat visível, resultando numa **faixa** (ex.: 12–17); em níveis
altos a faixa estreita até virar um valor exato. O **ponto médio** da faixa é
usado nas etapas seguintes.

### 2. Roles e pesos

Cada Pokémon é associado a um **perfil de role** que define a importância
relativa de cada stat numa escala `[0.1, 1.0]`:

| Role | HP | Atk | Def | SpAtk | SpDef | Spe |
|------|:---:|:---:|:---:|:---:|:---:|:---:|
| Physical Sweeper | 0.5 | 0.8 | 0.5 | 0.3 | 0.5 | 0.8 |
| Special Sweeper | 0.5 | 0.3 | 0.5 | 0.8 | 0.5 | 0.8 |
| Physical Tank | 0.8 | 0.5 | 0.8 | 0.3 | 0.5 | 0.3 |
| Special Tank | 0.8 | 0.3 | 0.5 | 0.5 | 0.8 | 0.3 |
| Mixed Attacker | 0.5 | 0.8 | 0.5 | 0.8 | 0.5 | 0.8 |
| Balanced | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 |

**Herança por evolução:** pré-evoluções herdam a role da forma final.
Charmander → Charizard → *Special Sweeper*. Espécies sem mapeamento
caem em *Balanced*.

**Ajuste dinâmico de pesos:** os pesos brutos são ajustados de acordo com os
base stats da espécie. Stats dominantes ganham tilt proporcional, e velocidade
usa limiares absolutos (base ≥ 90 → ×1.2, base < 50 → ×0.7). Todos os pesos
ficam restritos a `[0.1, 1.0]`.

### 3. Score de qualidade Q

$$Q = \frac{\displaystyle\sum_i w_i \cdot \text{IV}_i \cdot m^*_i}{Q_{\max}}$$

Onde $w_i$ = peso ajustado do stat $i$ e $m^*_i$ = **modificador de natureza efetivo**
(ver abaixo).

#### Penalidade assimétrica de natureza

A premissa é que **perder 10% de um stat-chave dói mais do que ganhar 10% em
outro**. A penalidade de 0.9 é amplificada por um fator $k = 1.5$:

| Natureza | Modificador real | Modificador efetivo |
|----------|:---:|:---:|
| Boost (+) | 1.1 | **1.1** (inalterado) |
| Neutro | 1.0 | 1.0 |
| Penalidade (−) | 0.9 | **0.85** ($1 - 1.5 \times 0.1$) |

#### Normalização: Q<sub>max</sub> realista

$Q_{\max}$ é calculado como o **melhor cenário alcançável**: IVs perfeitos (31)
combinados com a natureza ótima para os pesos da role (boost no stat de maior
peso, penalidade no de menor peso). Isso garante que $Q = 1.0$ é de fato
atingível — ao contrário de usar $1.1$ em todos os stats, que seria impossível.

Se os pesos não-HP forem todos iguais, qualquer natureza é um trade negativo
(−15% > +10%), e o $Q_{\max}$ usa natureza neutra como referência.

### 4. Avaliação de natureza

Usa o mesmo princípio assimétrico:

$$\text{score} = w_{\text{boost}} - 1.5 \times w_{\text{penalidade}}$$

| Score | Avaliação |
|-------|-----------|
| ≥ 0.3 | **Excelente** — boost em stat-chave, penalidade em stat irrelevante |
| ≥ 0.0 | **Boa** — trade levemente favorável |
| ≥ −0.3 | **Aceitável** — trade levemente desfavorável |
| < −0.3 | **Ruim** — penaliza stat importante |
| — | **Neutra** — natureza sem boost/penalidade |

Exemplo: Timid (+Spe −Atk) num Diglett Physical Sweeper dá
`score = 0.96 − 1.5 × 0.96 = −0.48` → **Ruim**, porque perder Atk num
atacante físico é devastador mesmo ganhando Spe.

### 5. Simulação Monte Carlo

Para situar o Q do seu Pokémon no contexto de capturas aleatórias, o programa
gera **200.000 amostras** com:

- IVs aleatórios: uniforme em [0, 31] por stat
- Naturezas aleatórias: uniforme entre as 25 possíveis
- Mesma fórmula de Q (com penalidade assimétrica)

Os Q das amostras são ordenados e o **percentil** é calculado via `searchsorted`:

$$\text{percentil} = \frac{\text{rank}}{N} \times 100$$

Se o seu Pokémon está no percentil 72, ele é melhor que 72% das capturas
aleatórias possíveis para aquela espécie e role.

### 6. Planejamento de capturas

Dado que a probabilidade de uma captura ser melhor é $p = 1 - \text{percentil}/100$,
o número mínimo de capturas para atingir confiança $c$ é:

$$n = \left\lceil \frac{\ln(1 - c)}{\ln(1 - p)} \right\rceil$$

O programa calcula $n$ para confiança de 90% e 95%.

---

## Estrutura do projeto

```
src/pokeevaluator/
├── cli.py              # Comandos Typer: evaluate, pokedex, roles, natures, interactive
├── ui.py               # Renderização Rich (tabelas, painéis, barra de qualidade)
├── i18n.py             # Strings PT-BR
├── interactive.py      # Modo interativo com prompt_toolkit
├── core/
│   ├── stats.py        # Fórmulas Gen III + recuperação de IVs
│   ├── quality.py      # Score Q, penalidade assimétrica, avaliação de natureza
│   ├── montecarlo.py   # 200k amostras, NumPy vetorizado
│   └── planning.py     # Modelo probabilístico de n capturas
├── models/
│   ├── pokemon.py      # StatName enum, BaseStats, StatBlock
│   ├── specimen.py     # IVRange, IVSet, CaughtPokemon, EvaluationResult
│   └── roles.py        # 6 perfis de role + mapeamento espécie→role
└── data/
    ├── gen3.py         # Constantes (MAX_IV, NATURE_PENALTY_WEIGHT, etc.)
    ├── natures.py      # 25 naturezas com boost/penalidade
    ├── pokedex.py      # 151 Pokémon Gen I (base stats Gen III)
    └── evolutions.py   # Cadeia evolutiva Gen I
```

---

## Testes

```bash
uv run pytest tests/ -v
```

72 testes cobrindo recuperação de IVs, score Q, penalidade assimétrica,
Monte Carlo, planejamento de capturas, avaliação de natureza, herança
evolutiva e CLI.

---

## Stack

- **Python** ≥ 3.10
- **NumPy** — cálculos vetorizados e Monte Carlo
- **Rich** — renderização de tabelas e painéis no terminal
- **Typer** — framework CLI
- **prompt_toolkit** — modo interativo com autocomplete fuzzy

---

## Licença

Este projeto é distribuído para fins educacionais.
Pokémon é marca registrada de Nintendo / Game Freak / The Pokémon Company.
