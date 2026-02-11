# Music Theory App — Preliminary Requirements (Frontend Only)

## 1. Purpose

The purpose of this application is to provide an **interactive music-theory exploration tool** that allows users to:

- Analyze collections of notes
- Discover scales that satisfy musical constraints
- Explore triads, modes, and relationships between scales
- Compare scales by similarity

The application is intended for **musicians, composers, and theorists** who want fast, deterministic answers without AI-based inference.

---

## 2. Scope

### In Scope
- Web-based frontend application
- Deterministic, rule-based music-theory logic
- Finite, explicit catalog of musical scales
- Interactive exploration and comparison of scales, modes, and triads
- Offline-capable operation (no backend required)

### Out of Scope
- AI-based recommendations
- User accounts or persistence beyond local preferences
- Harmonic analysis beyond scale and triad level

---

## 3. Core Concepts

### 3.1 Notes
- Notes are treated as **pitch classes** (octave-independent).
- Enharmonic equivalents are considered equal for matching purposes.
- Note spelling (sharp/flat) is a presentation concern only.

### 3.2 Scales
- A scale is defined as a **set of pitch classes relative to a root**.
- All scale types are defined explicitly in a **catalog**.
- The catalog is assumed to be **exhaustive** for all scale types the system recognizes.

### 3.3 Modes
- A mode is defined as a **rotation of a scale’s interval structure**.
- Modes are not named explicitly inside a scale definition.
- Mode names are resolved by matching rotated interval sets against the scale catalog.

### 3.4 Triads
- A triad is defined as a three-note chord built from a root and a quality.
- Triads may be evaluated for membership within a scale.
- A triad may or may not be diatonic to a scale.

---

## 4. Functional Requirements

### 4.1 Scale Identification by Notes

**Description**  
The system shall identify all scales that contain a given set of input notes.

**Inputs**
- A set of 1 or more notes (pitch classes)

**Outputs**
- A list of matching scales, each defined by:
    - Scale name
    - Root note
    - Scale family (if applicable)
    - Complete list of notes in the scale
    - Optional indication of additional notes not present in input

**Rules**
- A scale matches if all input notes are contained in the scale.
- Matching is octave-agnostic.
- Enharmonic spelling does not affect matching.

---

### 4.2 Scale Details

**Description**  
The system shall display detailed information about a selected scale.

**Inputs**
- Scale type
- Root note

**Outputs**
- List of notes in the scale
- Interval structure
- Derived modes
- Triads available on each scale degree

---

### 4.3 Mode Discovery

**Description**  
The system shall expose the modes of a scale by analyzing its interval structure.

**Inputs**
- A selected scale

**Outputs**
For each degree of the scale:
- Degree number
- Rotated interval structure
- Name of the corresponding scale type, if found in the catalog
- Indication when no catalog scale matches the rotation

**Rules**
- Modes are derived solely through rotation.
- Mode naming is resolved by catalog lookup, not hardcoded lists.

---

### 4.4 Triads Within a Scale

**Description**  
The system shall identify triads available at each scale degree.

**Inputs**
- A selected scale

**Outputs**
For each scale degree:
- Degree number
- Triad root
- Triad quality
- Triad notes

**Rules**
- Triads are derived from scale notes only.
- The system does not assume tonal hierarchy beyond scale membership.

---

### 4.5 Scales Matching a Pair of Triads

**Description**  
The system shall identify scales that contain two given triads.

**Inputs**
- Triad A (root + quality)
- Triad B (root + quality)

**Outputs**
For each matching scale:
- Scale name and root
- Degree of Triad A within the scale
- Degree of Triad B within the scale
- Indication whether each triad is diatonic to the scale

**Rules**
- A scale matches if it contains all notes from both triads.
- Triads may share notes.

---

### 4.6 Similar Scales

**Description**  
The system shall identify scales that are similar to a given scale.

**Inputs**
- A selected scale
- Similarity criteria:
    - Maximum number of differing notes
    - Optional constraint on scale size (same number of notes)

**Outputs**
For each similar scale:
- Scale name and root
- List of notes added and removed relative to the original scale
- Distance metric (number of note changes)

**Rules**
- Similarity is defined by set difference of pitch classes.
- Ordering is based on increasing distance.

---

## 5. Catalog Requirements

### 5.1 Scale Catalog
- The system shall load scale definitions from a structured catalog.
- Each scale definition includes:
    - Unique identifier
    - Human-readable name
    - Interval structure
    - Optional family classification

### 5.2 Catalog Authority
- The catalog is the **single source of truth**.
- All scale names, including modes, must be resolved through catalog lookup.
- The system shall not infer or invent scale names.

---

## 6. Non-Functional Requirements

### 6.1 Determinism
- All outputs must be deterministic and reproducible.
- No probabilistic or heuristic behavior is allowed.

### 6.2 Performance
- All interactions must be effectively instantaneous for typical catalog sizes.

### 6.3 Usability
- Inputs must support flexible note entry.
- Outputs must be readable and structured for exploration.

### 6.4 Extensibility
- Adding a new scale to the catalog must automatically enable:
    - Scale discovery
    - Mode resolution
    - Triad analysis
    - Similarity comparison

---

## 7. Constraints

- Frontend-only execution environment
- No external services required
- No persistence beyond local user preferences

---

## 8. Success Criteria

The system is considered successful when a user can:

- Enter arbitrary note sets and discover valid scales
- Explore scales, their modes, and their triads
- Analyze harmonic compatibility of multiple triads
- Compare scales by structural similarity
- Trust that all results are grounded in explicit theory, not inference

---
End of document.
