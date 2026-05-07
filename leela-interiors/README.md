# 🧠 Project Context Template

A reusable context folder template for AI-assisted development projects.
Inspired by the approach used in [ghost-ai by adrianhajdin](https://github.com/adrianhajdin/ghost-ai).

---

## 📁 Structure

```
context/
├── feature-specs/              # Numbered feature documentation
│   └── 00-feature-template.md # Copy this for each new feature
├── screenshots/                # UI mockups & design references
├── ai-workflow-rules.md        # Rules for AI coding assistants
├── architecture-context.md     # Tech stack & folder structure
├── code-standards.md           # Coding conventions
├── progress-tracker.md         # Feature progress & bugs
├── project-overview.md         # What the app does
└── ui-context.md               # Design system & colors
```

---

## 🚀 How to Use

### Starting a New Project
1. Copy the `context/` folder into your new project repo
2. Fill in `project-overview.md` first
3. Fill in `architecture-context.md` with your tech stack
4. Update `ui-context.md` with your design system
5. Customize `ai-workflow-rules.md` to your preferences
6. For each feature, duplicate `00-feature-template.md` and number it

### Adding a New Feature
1. Copy `context/feature-specs/00-feature-template.md`
2. Rename it with the next number: `e.g. 05-user-profile.md`
3. Fill in the spec before writing any code
4. Update `progress-tracker.md` to track it

### Working with AI Assistants (Cursor, Copilot, Claude)
- Point the AI to read the context files before starting
- Say: *"Read context/project-overview.md and context/architecture-context.md first, then help me build [feature]"*
- The `ai-workflow-rules.md` file sets boundaries for the AI

---

## 💡 Tips
- Keep context files up to date as the project evolves
- Add screenshots to `screenshots/` for UI reference
- Update `progress-tracker.md` at the end of each session
- The more detailed your context, the better AI assistance you get
