# quaid-scanner Report: /Users/karstenwade/Projects/AINative-Studio/src/ainative-strapi-mcp-server

**Score:** 🔴 0.9/10 — CRITICAL risk
**Maturity:** sandbox | **Depth:** standard | **Duration:** 0.2s
**Scanned:** 2026-06-01T21:06:56.557Z

## Pillar Scores

| Pillar | Score | Weight | Findings |
|--------|-------|--------|----------|
| Security | 0.5 | 25% | 0C 6W 1I |
| Governance | 0.0 | 20% | 1C 2W 11I |
| Community | 0.0 | 15% | 0C 4W 9I |
| AI Readiness | 2.5 | 15% | 0C 5W 0I |
| Inclusive Language | 0.0 | 15% | 0C 5W 5I |
| Technical Rigor | 3.5 | 10% | 1C 2W 1I |

## Critical Findings

### vendor-neutrality-critical-concentration
**Pillar:** Governance | **Category:** vendor-neutrality

Project is dominated by ainative.studio (100% of commits)

_(source: computed heuristic)_

**Suggestion:** Diversify contributors across multiple organizations to reduce single-vendor risk

**Reference:** https://chaoss.community/metric-project-sponsorship/

### test-coverage-1
**Pillar:** Technical Rigor | **Category:** test-coverage

No test files detected in the repository

_(source: local file check)_

**Suggestion:** Add a test suite to improve code reliability and enable coverage tracking

**Reference:** https://chaoss.community/metric-test-coverage/

## Warnings

- **[TIMEOUT-binary-artifacts]** Scanner "binary-artifacts" timed out after undefinedms *(Increase scannerTimeout in configuration or check network connectivity)*
- **[TIMEOUT-dep-pinning-docker]** Scanner "dep-pinning-docker" timed out after undefinedms *(Increase scannerTimeout in configuration or check network connectivity)*
- **[dep-pinning-packages-1]** Loosely pinned dependency "@modelcontextprotocol/sdk": "^1.0.0" uses ^ prefix in dependencies *(Consider pinning "@modelcontextprotocol/sdk" to an exact version for reproducible builds)*
- **[dep-pinning-packages-2]** Loosely pinned dependency "axios": "^1.7.7" uses ^ prefix in dependencies *(Consider pinning "axios" to an exact version for reproducible builds)*
- **[TIMEOUT-openssf-local-checks]** Scanner "openssf-local-checks" timed out after undefinedms *(Increase scannerTimeout in configuration or check network connectivity)*
- **[TIMEOUT-openssf-scorecard]** Scanner "openssf-scorecard" timed out after undefinedms *(Increase scannerTimeout in configuration or check network connectivity)*
- **[TIMEOUT-clearly-defined]** Scanner "clearly-defined" timed out after undefinedms *(Increase scannerTimeout in configuration or check network connectivity)*
- **[TIMEOUT-license-header-scanner]** Scanner "license-header-scanner" timed out after undefinedms *(Increase scannerTimeout in configuration or check network connectivity)*
- **[contributor-data-1]** 1 unique contributor with 4 commits in the last 12 months *(Single contributor detected — consider recruiting additional maintainers)*
- **[contributor-funnel-2]** Conversion rates: casual→regular 0%, regular→core 0% *(Low casual-to-regular conversion suggests contributor onboarding friction)*
- **[psych-safety-1]** No Code of Conduct found *(Add a CODE_OF_CONDUCT.md — see https://www.contributor-covenant.org/)*
- **[support-channels-1]** No SUPPORT.md or .github/SUPPORT.md found *(Add a SUPPORT.md documenting how users can get help)*
- **[agentic-rules-2]** CLAUDE.md lacks recognized structural sections *(Add sections like "Critical Rules", "Project Structure", "Common Tasks" to improve agent guidance.)*
- **[TIMEOUT-ai-repo-detection]** Scanner "ai-repo-detection" timed out after undefinedms *(Increase scannerTimeout in configuration or check network connectivity)*
- **[TIMEOUT-dataset-provenance]** Scanner "dataset-provenance" timed out after undefinedms *(Increase scannerTimeout in configuration or check network connectivity)*
- **[TIMEOUT-model-card-detection]** Scanner "model-card-detection" timed out after undefinedms *(Increase scannerTimeout in configuration or check network connectivity)*
- **[TIMEOUT-model-card-scoring]** Scanner "model-card-scoring" timed out after undefinedms *(Increase scannerTimeout in configuration or check network connectivity)*
- **[AK-PREREQ-MISSING-README.md]** README.md contains tool commands but no Prerequisites or Requirements section *(Consider adding a Prerequisites section listing required tools and versions)*
- **[TIMEOUT-diminishing-language-scanner]** Scanner "diminishing-language-scanner" timed out after undefinedms *(Increase scannerTimeout in configuration or check network connectivity)*
- **[TIMEOUT-inclusive-code-scanner]** Scanner "inclusive-code-scanner" failed: Cannot read properties of undefined (reading 'termListUrl') *(Check scanner implementation for errors)*
- **[TIMEOUT-inclusive-doc-scanner]** Scanner "inclusive-doc-scanner" failed: Cannot read properties of undefined (reading 'termListUrl') *(Check scanner implementation for errors)*
- **[TIMEOUT-inclusive-naming-scanner]** Scanner "inclusive-naming-scanner" failed: Cannot read properties of undefined (reading 'termListUrl') *(Check scanner implementation for errors)*
- **[interaction-templates-1]** No issue templates configured *(Add .github/ISSUE_TEMPLATE/ with bug report and feature request templates)*
- **[semver-validation-2]** 1 versioned tags found but no CHANGELOG detected *(Add a CHANGELOG.md documenting changes per release (see keepachangelog.com))*

## Info

- **[branch-protection-1]** GitHub token not provided. Cannot check branch protection settings.
- **[asset-protection-1]** No trademark policy found (optional)
- **[asset-protection-2]** No export control documentation found (optional)
- **[asset-protection-3]** No CLA or DCO requirement detected
- **[asset-protection-4]** Contributor friction level: Low
- **[bus-factor-1]** Bus factor: 1, Elephant factor: 100% (1 contributors, 4 commits in last 12 months)
- **[dep-license-scanning-1]** package.json found but node_modules not installed — cannot scan dependency licenses
- **[governance-classification-1]** No governance model detected — governance files exist but no recognizable model pattern found
- **[governance-detection-1]** No governance documentation found
- **[license-compatibility-1]** Project license is MIT — no installed dependencies to check compatibility
- **[vendor-neutrality-domain-count]** Found 1 unique email domain(s) across 4 commits
- **[vendor-neutrality-no-succession]** No succession planning documentation found
- **[burnout-detection-1]** Burnout detection requires a GitHub token
- **[contributor-data-2]** Contributor emails span 1 domain
- **[contributor-funnel-1]** Contributor funnel: 0 core, 0 regular, 1 casual (1 total)
- **[funding-1]** No funding infrastructure detected
- **[issue-closure-1]** Issue closure analysis requires a GitHub token
- **[response-classification-1]** Response classification requires a GitHub token
- **[response-time-1]** Response time analysis requires a GitHub token
- **[stale-bot-1]** No stale bot configured
- **[support-channels-2]** README contains a support/help section
- **[AK-TOOL-NPM-README.md:22]** Assumed knowledge: "npm" command used without Node.js listed as prerequisite
- **[AK-ACRONYM-MCP-README.md:1]** Undefined acronym "MCP" may confuse newcomers
- **[AK-ACRONYM-CMS-README.md:6]** Undefined acronym "CMS" may confuse newcomers
- **[AK-ACRONYM-CRUD-README.md:142]** Undefined acronym "CRUD" may confuse newcomers
- **[AK-ACRONYM-LICENSE-README.md:148]** Undefined acronym "LICENSE" may confuse newcomers
- **[linter-config-2]** Linter config found but no lint step detected in CI workflows

## Recommendations

- **[HIGH impact / medium effort]** Diversify contributors across multiple organizations to reduce single-vendor risk
  - https://chaoss.community/metric-project-sponsorship/
- **[HIGH impact / medium effort]** Add a test suite to improve code reliability and enable coverage tracking
  - https://chaoss.community/metric-test-coverage/
- **[MEDIUM impact / low effort]** Increase scannerTimeout in configuration or check network connectivity
- **[MEDIUM impact / low effort]** Consider pinning "@modelcontextprotocol/sdk" to an exact version for reproducible builds
- **[MEDIUM impact / low effort]** Increase scannerTimeout in configuration or check network connectivity
- **[MEDIUM impact / low effort]** Single contributor detected — consider recruiting additional maintainers
- **[MEDIUM impact / low effort]** Low casual-to-regular conversion suggests contributor onboarding friction
- **[MEDIUM impact / low effort]** Add a CODE_OF_CONDUCT.md — see https://www.contributor-covenant.org/
- **[MEDIUM impact / low effort]** Add a SUPPORT.md documenting how users can get help
- **[MEDIUM impact / low effort]** Add sections like "Critical Rules", "Project Structure", "Common Tasks" to improve agent guidance.
- **[MEDIUM impact / low effort]** Increase scannerTimeout in configuration or check network connectivity
- **[MEDIUM impact / low effort]** Consider adding a Prerequisites section listing required tools and versions
- **[MEDIUM impact / low effort]** Increase scannerTimeout in configuration or check network connectivity
- **[MEDIUM impact / low effort]** Check scanner implementation for errors
- **[MEDIUM impact / low effort]** Add .github/ISSUE_TEMPLATE/ with bug report and feature request templates
- **[MEDIUM impact / low effort]** Add a CHANGELOG.md documenting changes per release (see keepachangelog.com)

## Score Rationale

Overall score is a weighted sum of six pillar scores (each scored 0–10).

| Pillar | Weight | Raw Score | Contribution |
|--------|--------|-----------|-------------|
| Security | 25% | 0.5 | 0.13 |
| Governance | 20% | 0.0 | 0.00 |
| Community | 15% | 0.0 | 0.00 |
| AI Readiness | 15% | 2.5 | 0.38 |
| Inclusive Language | 15% | 0.0 | 0.00 |
| Technical Rigor | 10% | 3.5 | 0.35 |
| **Overall** | **100%** | | **0.90** |

---
*quaid-scanner v0.1.2 | 2026-06-01T21:06:56.557Z*
*Commit: 09965621a0fa4f6731ad3aeaeb0e75525898388e*