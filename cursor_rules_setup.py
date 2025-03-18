import os

# Define the directory for Cursor rules
rules_dir = ".cursor/rules"
os.makedirs(rules_dir, exist_ok=True)

# Define the rules and their contents
rules = {
    "always.mdc": {
        "rule_type": "Always",
        "content": """# Always Rules

These rules apply to every task, no exceptions.

## Stay Focused on the Task
- Work **only** on the specific task at hand; do not go out of scope.

## Preserve Established Patterns
- Do not modify workflows, structures, or conventions unless absolutely necessary.

## Avoid Duplication
- Before writing new code, check for existing functions that accomplish the same goal.
- Identify and clean up redundant or duplicate code.

## Enforce Code Cleanliness
- Refactor bloated files and avoid functions longer than **300 lines**.
- Ensure modularity for maintainability.

## Commit & Document Work Often
- Make **incremental commits** with clear, structured commit messages.
- Keep local files organized to track project progress.

## Keep Solutions Simple
- Avoid over-engineering; prioritize clarity and efficiency.
"""
    },

    "testing.mdc": {
        "rule_type": "Always",
        "file_patterns": ["*_test.py", "tests/**", "*.spec.tsx"],
        "content": """# Testing Rules

These rules ensure every task is validated with proper testing.

## Plan Testing Before Development
- Define **unit tests** and **end-to-end tests** before coding.
- Identify edge cases, failure scenarios, and performance limits.

## Execute Tests to Prove Work is Complete
- Run all relevant tests before submitting a task.
- Ensure no regressions or breakages.

## Unit Testing Best Practices
- Cover core logic and edge cases.
- Use the right frameworks:
  - **Flask/Python:** `pytest`
  - **LWC:** Jest
  - **React Native:** React Testing Library + Jest

## End-to-End Testing Guidelines
- Test complete workflows for real-world validation.
- Automate tests using **Selenium, Cypress, or Playwright**.

## Maintain Test Quality
- Prioritize meaningful test cases over sheer quantity.
- Add new test cases for any discovered bugs.
"""
    },

    "git-rules.mdc": {
        "rule_type": "Auto Attached",
        "file_patterns": ["*.sh", "*.gitignore", ".cursor/config.json"],
        "content": """# Git & Repository Management Rules

## Every Project Must Have a GitHub Repository
- If no repository exists, create a **new public GitHub repo**.
- Store repository details in a **standardized location** for reference.

## Commit Often with Detailed Notes
- Use structured commit messages:
  - **Feature Addition:** `feat: Added [feature]`
  - **Bug Fix:** `fix: Resolved [issue]`
  - **Refactor:** `refactor: Improved [module]`

## Automate Repository Setup
- Initialize Git (`git init`) if needed.
- Add a **`.gitignore`** file.
- Push an initial commit with a **`README.md`**.

## Branching Best Practices
- Use **feature branches** for new work.
- Merge via **pull requests** (PRs), not direct commits.
"""
    },

    "build-planning.mdc": {
        "rule_type": "Auto Attached",
        "file_patterns": ["docs/*.md", "plans/*.json"],
        "content": """# Build Planning Rules

These rules ensure agents create structured project plans.

## Map Out a Build Plan
- Before coding, generate a **clear build plan** outlining:
  - Features to be developed.
  - Dependencies and integrations.
  - Expected output.

## Store and Catalog Plans
- Plans should be **saved locally** and easily accessible by agents.
- Completed plans should be cataloged for reference.

## Break Plans Into Daily Goals
- Tasks should be **divided into actionable goals**.
- Reference previous work to ensure continuity.
"""
    },

    "context-passing.mdc": {
        "rule_type": "Auto Attached",
        "file_patterns": ["*.md", "context/*.json"],
        "content": """# Context Passing Rules

Ensures smooth transitions between agents due to tool limitations.

## Efficiently Pass Context
- After **25 tool calls**, wrap up and generate a **handoff prompt**.
- Store key progress details in an **accessible location**.

## Automate Context Retention
- Use an **indexing system** to allow agents to search previous work.
- Prioritize **important decisions** in context notes.

## Standardize Handoff Prompts
- Clearly state what has been completed and **next steps** for the next agent.
- Include **relevant files, APIs, or database updates**.
"""
    },

    "manual.mdc": {
        "rule_type": "Manual",
        "content": """# Manual Rules

These rules apply when manually activated.

## Refactoring & Optimization
- Break down large functions into **smaller, reusable modules**.
- Apply **performance improvements** only when requested.

## Deep Code Review & Debugging
- Conduct **in-depth reviews** beyond automated linting.
- Debug tricky issues with **additional logging and tracing**.

## Custom Implementations
- Write specialized solutions only **when standard approaches won't work**.
"""
    },

    "agent-requested.mdc": {
        "rule_type": "Agent Requested",
        "description": "Use when a task requires alternative approaches, deep optimizations, or refactoring guidance.",
        "content": """# Agent Requested Rules

These rules apply only when explicitly requested.

## Suggest Alternative Approaches
- Provide multiple ways to solve a problem, with trade-offs.

## Optimize for Learning
- Explain technical decisions in **clear, concise terms**.

## Review & Improve Existing Code
- Identify areas for **refactoring** or **improvement** without assuming changes are needed.

## Provide a First Draft Before Finalizing
- For complex work, generate a **draft version** before completing the full implementation.
"""
    }
}

# Generate the rule files
for filename, rule in rules.items():
    filepath = os.path.join(rules_dir, filename)
    with open(filepath, "w") as f:
        f.write(f"Rule Type: {rule['rule_type']}\n\n")
        if "file_patterns" in rule:
            f.write(f"File Pattern Matches: {', '.join(rule['file_patterns'])}\n\n")
        if "description" in rule:
            f.write(f"Description: {rule['description']}\n\n")
        f.write(rule["content"])

print(f"✅ Successfully created rule files in {rules_dir}") 