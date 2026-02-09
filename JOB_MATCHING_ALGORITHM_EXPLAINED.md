# Job Matching Algorithm - Complete Explanation

## Overview

This document explains how the job matching algorithm works in SiswaGig, step by step with real examples.

---

## The Scenario

### Freelancer Profile (Ahmad)

| Field | Value |
|-------|-------|
| **Skills** | React, Node.js, MongoDB |
| **Bio** | "Web developer experienced in building modern websites" |

### 3 Jobs Available

| Job | Title | Required Skills | Description |
|-----|-------|-----------------|-------------|
| Job 1 | Build E-commerce Website | React, Node.js, MongoDB | "Need developer to build online shop with React frontend" |
| Job 2 | Mobile App Development | Flutter, Dart, Firebase | "Create iOS and Android mobile application" |
| Job 3 | Design Company Logo | Photoshop, Illustrator | "Design modern logo for tech startup" |

---

## Step 1: TOKENIZATION (Break into words)

Tokenization converts text into individual words (tokens) for processing.

### Ahmad's Profile

```
Original Skills: "React, Node.js, MongoDB"
Original Bio: "Web developer experienced in building modern websites"

After tokenization:
Skills tokens: ["react", "nodejs", "mongodb"]
Bio tokens: ["web", "developer", "experienced", "in", "building", "modern", "websites"]
```

### Job 1 (E-commerce)

```
Original Skills: "React, Node.js, MongoDB"
Original Description: "Need developer to build online shop with React frontend"

After tokenization:
Skills tokens: ["react", "nodejs", "mongodb"]
Desc tokens: ["need", "developer", "to", "build", "online", "shop", "with", "react", "frontend"]
```

### Process

1. Convert to lowercase
2. Remove special characters (commas, periods, etc.)
3. Split by spaces

---

## Step 2: TERM FREQUENCY (TF) - Count Words

**Question:** How often does each word appear in a document?

### Formula

$$TF(term) = \frac{\text{Count of term in document}}{\text{Total terms in document}}$$

### Example: Ahmad's Skills

Document: `["react", "nodejs", "mongodb"]` (3 words total)

| Word | Count | TF Calculation | TF Value |
|------|-------|----------------|----------|
| react | 1 | 1 ÷ 3 | **0.333** |
| nodejs | 1 | 1 ÷ 3 | **0.333** |
| mongodb | 1 | 1 ÷ 3 | **0.333** |

### Example: Job 1 Skills

Document: `["react", "nodejs", "mongodb"]` (3 words total)

| Word | Count | TF Calculation | TF Value |
|------|-------|----------------|----------|
| react | 1 | 1 ÷ 3 | **0.333** |
| nodejs | 1 | 1 ÷ 3 | **0.333** |
| mongodb | 1 | 1 ÷ 3 | **0.333** |

---

## Step 3: INVERSE DOCUMENT FREQUENCY (IDF) - Word Importance

**Question:** How rare/unique is each word? Rare words are more important.

### Formula

$$IDF(term) = \log\left(\frac{\text{Total documents}}{\text{Documents containing term}}\right)$$

### Example

We have 2 documents to compare (Ahmad's skills + Job's skills):

| Word | Appears in how many docs? | IDF Calculation | IDF Value |
|------|---------------------------|-----------------|-----------|
| react | 2 (both) | log(2/2) = log(1) | **0** |
| nodejs | 2 (both) | log(2/2) = log(1) | **0** |
| mongodb | 2 (both) | log(2/2) = log(1) | **0** |

> **Note:** When two texts have the exact same words, IDF becomes 0. This is why the system also uses keyword matching.

### Different Example (with different documents)

If we had 3 documents:
- Doc 1: ["react", "javascript"]
- Doc 2: ["react", "node"]
- Doc 3: ["python", "django"]

| Word | Appears in | IDF Calculation | IDF Value |
|------|------------|-----------------|-----------|
| react | 2 docs | log(3/2) | **0.405** (common) |
| python | 1 doc | log(3/1) | **1.099** (rare = important) |

---

## Step 4: TF-IDF VECTOR - Combine TF and IDF

### Formula

$$TF\text{-}IDF(term) = TF(term) \times IDF(term)$$

### Purpose

Creates a numerical representation (vector) of text where:
- Common words get low scores
- Rare/unique words get high scores

---

## Step 5: KEYWORD MATCHING (Direct Skill Comparison)

Since TF-IDF alone isn't enough for exact skill matching, the system also does direct comparison:

### Comparing Ahmad's Skills vs Job 1

```
Ahmad:  [React, Node.js, MongoDB]
Job 1:  [React, Node.js, MongoDB]

Exact matches: 3 out of 3 = 100%
```

### Comparing Ahmad's Skills vs Job 2

```
Ahmad:  [React, Node.js, MongoDB]
Job 2:  [Flutter, Dart, Firebase]

Exact matches: 0 out of 3 = 0%
Related matches: 0 (different categories)
```

### Comparing Ahmad's Skills vs Job 3

```
Ahmad:  [React, Node.js, MongoDB]
Job 3:  [Photoshop, Illustrator]

Exact matches: 0 out of 2 = 0%
Related matches: 0 (design vs development)
```

### Matching Types

| Match Type | Score | Example |
|------------|-------|---------|
| Exact match | 1.0 | "React" = "React" |
| Partial match | 0.5 | "JavaScript" contains "Java" |
| Related skills | 0.3 | "React" and "Vue" (both frontend) |

---

## Step 6: COSINE SIMILARITY - Measuring Similarity

### What is it?

Cosine similarity measures the angle between two vectors. Smaller angle = more similar.

### Formula

$$\text{Similarity} = \frac{A \cdot B}{||A|| \times ||B||}$$

Where:
- $A \cdot B$ = dot product (multiply corresponding elements, sum them)
- $||A||$ = magnitude of vector A = $\sqrt{\sum a_i^2}$

### Visual Explanation

```
           Job Vector
              ↗
             /
            / θ (angle)
           /
          /
         ────────────→ User Vector

Similarity = cos(θ)
- θ = 0°  → cos(0°) = 1.0 (perfect match)
- θ = 90° → cos(90°) = 0.0 (no match)
```

### Worked Example

**Ahmad's Bio:** "web developer experienced in building modern websites"
**Job 1 Desc:** "need developer to build online shop with react frontend"

**Step 1: Create vectors based on word presence**

| Word | Ahmad's Bio (A) | Job 1 Desc (B) |
|------|-----------------|----------------|
| developer | 1 | 1 |
| building | 1 | 0 |
| build | 0 | 1 |
| web | 1 | 0 |
| modern | 1 | 0 |
| react | 0 | 1 |

Simplified vectors:
- **Ahmad Vector (A):** `[1, 1, 0, 1, 1, 0]`
- **Job 1 Vector (B):** `[1, 0, 1, 0, 0, 1]`

**Step 2: Calculate Dot Product (A · B)**

```
A · B = (1×1) + (1×0) + (0×1) + (1×0) + (1×0) + (0×1)
      = 1 + 0 + 0 + 0 + 0 + 0
      = 1
```

**Step 3: Calculate Magnitude of A**

```
||A|| = √(1² + 1² + 0² + 1² + 1² + 0²)
      = √(1 + 1 + 0 + 1 + 1 + 0)
      = √4 
      = 2
```

**Step 4: Calculate Magnitude of B**

```
||B|| = √(1² + 0² + 1² + 0² + 0² + 1²)
      = √(1 + 0 + 1 + 0 + 0 + 1)
      = √3 
      = 1.73
```

**Step 5: Calculate Cosine Similarity**

```
Similarity = (A · B) / (||A|| × ||B||)
           = 1 / (2 × 1.73)
           = 1 / 3.46
           = 0.289 (28.9%)
```

---

## Step 7: WEIGHTED FINAL SCORE

Combine all factors with importance weights:

### Formula

$$\text{Match Score} = (S_{skill} \times 0.4) + (S_{bio} \times 0.25) + (S_{title} \times 0.15) + (S_{distance} \times 0.2)$$

### Weights Explained

| Factor | Weight | Description |
|--------|--------|-------------|
| Skill Match | 40% | User skills vs Job required skills |
| Bio Match | 25% | User bio vs Job description |
| Title Match | 15% | User skills vs Job title |
| Distance | 20% | Geographic proximity |

### Calculation for Job 1 (E-commerce)

```
Skill Match:    1.00 (100% - exact match)
Bio Match:      0.29 (29% - some word overlap)
Title Match:    0.15 (15% - "build website")
Distance:       0.90 (90% - nearby location)

Final Score = (1.00 × 0.4) + (0.29 × 0.25) + (0.15 × 0.15) + (0.90 × 0.2)
            = 0.40 + 0.07 + 0.02 + 0.18
            = 0.67 (67% match) ✓
```

### Calculation for Job 2 (Mobile App)

```
Skill Match:    0.00 (0% - different skills)
Bio Match:      0.10 (10% - only "developer" matches)
Title Match:    0.00 (0% - no overlap)
Distance:       0.80 (80% - medium distance)

Final Score = (0.00 × 0.4) + (0.10 × 0.25) + (0.00 × 0.15) + (0.80 × 0.2)
            = 0.00 + 0.025 + 0.00 + 0.16
            = 0.185 (18.5% match)
```

### Calculation for Job 3 (Logo Design)

```
Skill Match:    0.00 (0% - design vs coding)
Bio Match:      0.00 (0% - no overlap)
Title Match:    0.00 (0% - no overlap)
Distance:       0.70 (70%)

Final Score = (0.00 × 0.4) + (0.00 × 0.25) + (0.00 × 0.15) + (0.70 × 0.2)
            = 0.00 + 0.00 + 0.00 + 0.14
            = 0.14 (14% match)
```

---

## Final Ranking for Ahmad

| Rank | Job | Match Score | Reason |
|------|-----|-------------|--------|
| #1 | Build E-commerce Website | **67%** | Same skills (React, Node, MongoDB) |
| #2 | Mobile App Development | **18.5%** | Different skills, but still coding |
| #3 | Design Company Logo | **14%** | Completely different field |

---

## Visual Summary

```
AHMAD'S PROFILE                         JOB MATCHING RESULT
┌─────────────────────┐                 
│ Skills:             │                 ┌─────────────────────────────┐
│ • React      ───────┼─────match──────►│ Job 1: E-commerce (67%) ✓  │
│ • Node.js    ───────┼─────match──────►│ React, Node.js, MongoDB    │
│ • MongoDB    ───────┼─────match──────►│                            │
│                     │                 └─────────────────────────────┘
│ Bio:                │                 
│ "Web developer      │                 ┌─────────────────────────────┐
│  experienced in     │       ✗        │ Job 2: Mobile App (18.5%)   │
│  building modern    │ ───no match───►│ Flutter, Dart, Firebase     │
│  websites"          │                 └─────────────────────────────┘
└─────────────────────┘                 
                                        ┌─────────────────────────────┐
                               ✗        │ Job 3: Logo Design (14%)    │
                        ───no match────►│ Photoshop, Illustrator      │
                                        └─────────────────────────────┘
```

---

## Algorithm Flow Diagram

```
┌──────────────────┐
│  User Profile    │
│  - Skills        │
│  - Bio           │
│  - Location      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  TOKENIZATION    │
│  Break into      │
│  words           │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│  Calculate TF    │     │  Calculate IDF   │
│  (word frequency)│     │  (word rarity)   │
└────────┬─────────┘     └────────┬─────────┘
         │                        │
         └──────────┬─────────────┘
                    │
                    ▼
         ┌──────────────────┐
         │  TF-IDF Vector   │
         │  (text → numbers)│
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐
         │ COSINE SIMILARITY│
         │ (compare vectors)│
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐
         │ WEIGHTED SCORE   │
         │ Skills: 40%      │
         │ Bio: 25%         │
         │ Title: 15%       │
         │ Distance: 20%    │
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐
         │ RANKED JOB LIST  │
         │ (highest first)  │
         └──────────────────┘
```

---

## Summary

| Step | Process | Output |
|------|---------|--------|
| 1 | Tokenize text | `["react", "nodejs", "mongodb"]` |
| 2 | Calculate TF | Word frequencies `{react: 0.333}` |
| 3 | Calculate IDF | Word importance `{react: 0.405}` |
| 4 | TF-IDF Vector | Numeric representation of text |
| 5 | Cosine Similarity | Similarity score (0-1) |
| 6 | Weighted Sum | Final match percentage |

---

## Why This Algorithm?

1. **TF-IDF** handles text intelligently - rare skills are weighted more importantly
2. **Cosine Similarity** is scale-independent - works regardless of text length
3. **Weighted factors** allow prioritizing what matters most (skills > bio)
4. **Location-aware** - considers geographic proximity for local jobs

---

## Implementation Files

| File | Purpose |
|------|---------|
| `server/utils/ml-algorithms.ts` | Core TF-IDF & Cosine Similarity functions |
| `server/api/jobs/recommended.get.ts` | API endpoint for recommendations |
| `app/composables/useJobRecommendations.ts` | Frontend composable |

---

## References

- [TF-IDF (Wikipedia)](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)
- [Cosine Similarity (Wikipedia)](https://en.wikipedia.org/wiki/Cosine_similarity)
- [Information Retrieval](https://en.wikipedia.org/wiki/Information_retrieval)
