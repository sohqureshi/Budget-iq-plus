"# Budget-iq-plus"

Converted Angular project scaffold.

To run:

1. Install dependencies:

```bash
npm install
```

2. Start dev server (requires local Angular CLI):

```bash
npm run start
```

Notes:
- The original `monthly-expences.html`, `manifest.webmanifest`, and `monthly-expense-sw.js` were migrated under `src/` and `src/assets/`.
- The `icons` folder is referenced from the workspace root and is included in `angular.json` assets so it will be copied to the build output.
- The component preserves the original DOM-based logic inside `MonthlyExpensesComponent` for parity; it can be refactored to idiomatic Angular later.
