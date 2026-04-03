# Design Document: Expense & Budget Visualizer

## Overview

A single-page, client-side web application that lets users log expenses by category, track a running total balance, and visualize spending via a Chart.js pie chart. All data lives in memory for the current session — no backend, no build tools, no persistence.

The app is a single `index.html` file that loads one CSS file (`css/styles.css`) and one JavaScript file (`js/app.js`). Chart.js is loaded via CDN.

## Architecture

The app follows a simple MVC-like pattern entirely within `js/app.js`:

- **State**: A plain in-memory array of transaction objects
- **Render**: Pure functions that read state and update the DOM
- **Events**: DOM event listeners that mutate state then call render

```
User Action → Event Listener → Mutate State → render()
                                                  ├── renderBalance()
                                                  ├── renderList()
                                                  └── renderChart()
```

No module system, no bundler. All logic is in one IIFE or top-level scope in `js/app.js`.

## Components and Interfaces

### HTML Structure (`index.html`)

```
<body>
  <header>          <!-- Total Balance display -->
  <main>
    <section>       <!-- Expense_Form: name, amount, category select, submit -->
    <section>       <!-- Custom_Category_Form: name input, add button, error msg -->
    <section>       <!-- Sort_Control: dropdown for Sort_Order selection -->
    <section>       <!-- Transaction_List: scrollable ul, empty-state p -->
    <section>       <!-- Monthly_Summary: Month_Selector, per-category totals, empty-state -->
    <section>       <!-- Chart: canvas + empty-state message -->
  </main>
</body>
```

### JavaScript API (internal, `js/app.js`)

```js
// State
let transactions = [];        // Transaction[]
let customCategories = [];    // string[] — user-defined category names
let currentSortOrder = "default"; // Sort_Order

// Core mutations
function addTransaction(name, amount, category)       // → void
function deleteTransaction(id)                        // → void
function addCustomCategory(name)                      // → void

// Derived helpers
function getAllCategories()                            // → string[] (built-in + custom)
function getCategoryColor(category)                   // → string (hex color)
function sortTransactions(txns, order)                // → Transaction[] (sorted copy)
function filterTransactionsByMonth(txns, year, month) // → Transaction[]

// Render functions (read state, update DOM)
function renderBalance()          // updates #balance text
function renderList()             // rebuilds #transaction-list ul, applies currentSortOrder
function renderChart()            // updates/creates Chart.js instance
function renderCategorySelector() // rebuilds <select> options in Expense_Form
function renderMonthlySummary()   // renders per-category totals for selected month

// Validation
function validateForm(name, amount, category)         // → { valid: bool, errors: {} }
function validateCustomCategory(name)                 // → { valid: bool, error: string }
```

### Chart.js Integration

A single `Chart` instance is created on first render and updated via `chart.data.datasets[0].data = [...]` + `chart.update()` on subsequent renders. When no transactions exist, the canvas is hidden and an empty-state `<p>` is shown instead. When custom categories are added, the chart labels and colors arrays are rebuilt from `getAllCategories()` and `getCategoryColor()` before calling `chart.update()`.

## Data Models

### Transaction

```js
{
  id: number,        // Date.now() — unique enough for in-memory use
  name: string,      // item name, non-empty
  amount: number,    // positive float, in currency units
  category: string   // "Food" | "Transport" | "Fun" | <Custom_Category>
}
```

### Category Totals (derived, not stored)

```js
// Computed on each render from transactions[] for a given set of categories
{
  [categoryName]: number   // sum of amounts for that category
}
```

### Chart Colors

```js
// Built-in colors (constant)
const CATEGORY_COLORS = {
  Food:      "#FF6384",
  Transport: "#36A2EB",
  Fun:       "#FFCE56"
};

// Dynamic color palette for custom categories (assigned in order)
const CUSTOM_CATEGORY_PALETTE = [
  "#4BC0C0", "#9966FF", "#FF9F40", "#C9CBCF",
  "#7BC8A4", "#E7E9ED", "#F67019", "#00A8B5"
];
// getCategoryColor(name) returns CATEGORY_COLORS[name] if built-in,
// otherwise assigns the next available color from CUSTOM_CATEGORY_PALETTE
// based on the index of the category in customCategories[].
```

### Custom Categories (in-memory state)

```js
let customCategories = [];  // string[] — names added by the user this session
// getAllCategories() returns [...VALID_CATEGORIES, ...customCategories]
```

### Sort Order (in-memory state)

```js
let currentSortOrder = "default";
// Valid values: "default" | "amount-asc" | "amount-desc" | "category-asc" | "category-desc"
// sortTransactions(txns, order) returns a sorted copy; never mutates the source array.
```

### Monthly Summary (derived, not stored)

```js
// filterTransactionsByMonth(txns, year, month) → Transaction[]
//   year: number (e.g. 2024), month: number (1–12)
//   Filters by matching transaction id timestamp to year/month.
//   Note: transactions store a Date.now() id; month filtering derives
//   the date from a separate `date` field added at creation time:
{
  id: number,
  name: string,
  amount: number,
  category: string,
  date: string   // ISO date string "YYYY-MM-DD", set at addTransaction time
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Valid transaction grows the list

*For any* valid transaction (non-empty name, positive amount, valid category), adding it to the app should increase the transaction list length by exactly one and the new entry should be present in the list.

**Validates: Requirements 1.2, 2.1**

### Property 2: Invalid inputs are rejected

*For any* form submission where at least one field is empty or the amount is not a positive number, the transaction list should remain unchanged and at least one validation error should be displayed.

**Validates: Requirements 1.3**

### Property 3: Form resets after successful add

*For any* valid transaction submission, after the transaction is added all form fields should be cleared to their default empty/unselected state.

**Validates: Requirements 1.4**

### Property 4: Transaction entry renders all required fields

*For any* transaction in the list, its rendered DOM entry should contain the item name, the amount, the category label, and a delete button.

**Validates: Requirements 2.2, 3.1**

### Property 5: Balance invariant

*For any* sequence of add and delete operations, the displayed Total_Balance should always equal the arithmetic sum of the amounts of all currently stored transactions (including the edge case of zero when the list is empty).

**Validates: Requirements 4.2, 4.3, 1.2, 3.2**

### Property 6: Chart data matches current transactions

*For any* state of the transaction list, the pie chart's dataset values should equal the sum of amounts grouped by category for the current transactions, and re-render correctly after every add or delete without a page reload.

**Validates: Requirements 5.1, 5.3**

### Property 7: Delete removes exactly the target transaction

*For any* list of transactions, deleting a transaction by its id should result in a list that contains all original transactions except the deleted one, with the balance and chart updated accordingly.

**Validates: Requirements 3.2**

### Property 8: Custom category round-trip availability

*For any* non-empty, unique category name, after calling `addCustomCategory` the name should appear in `getAllCategories()` and as an `<option>` in the Expense_Form category selector, and should remain there after subsequent add/delete transaction operations.

**Validates: Requirements 6.2, 6.5**

### Property 9: Duplicate custom categories are rejected

*For any* category name that already exists in the full category list (case-insensitive comparison), attempting to add it again should leave `customCategories` unchanged and return a validation error.

**Validates: Requirements 6.3**

### Property 10: Custom category colors are distinct

*For any* set of custom categories added to the app, each category should be assigned a color that is distinct from all other category colors (both built-in and custom).

**Validates: Requirements 6.4**

### Property 11: Monthly summary filters and totals correctly

*For any* set of transactions spanning multiple months and any selected year/month, `filterTransactionsByMonth` should return only transactions whose date falls in that month, and `renderMonthlySummary` should display exactly those categories present in the filtered set with their correct summed totals.

**Validates: Requirements 7.3, 7.4**

### Property 12: Sort produces correctly ordered list without mutating state

*For any* list of transactions and any Sort_Order, `sortTransactions` should return a list ordered according to that Sort_Order, and the original `transactions` array should remain in its original insertion order.

**Validates: Requirements 8.3**

### Property 13: Sort order is maintained after add or delete

*For any* active Sort_Order, after adding or deleting a transaction the re-rendered Transaction_List should still be ordered according to that Sort_Order.

**Validates: Requirements 8.4**

## Error Handling

| Scenario | Behavior |
|---|---|
| Empty item name | Inline error shown below name field; submission blocked |
| Amount ≤ 0 or non-numeric | Inline error shown below amount field; submission blocked |
| No category selected | Inline error shown below category field; submission blocked |
| No transactions (balance) | Display `$0.00` |
| No transactions (chart) | Hide canvas, show empty-state message |
| Chart.js CDN unavailable | Chart section shows a fallback error message |
| Empty custom category name | Inline error shown below custom category input; not added |
| Duplicate custom category name (case-insensitive) | Inline error shown; existing category list unchanged |
| No transactions in selected month | Monthly_Summary shows "No spending data for this period" message |

Validation runs on submit only (not on every keystroke) to keep the implementation minimal.

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are required for comprehensive coverage. Unit tests catch concrete bugs at specific examples and edge cases; property-based tests verify general correctness across the full input space.

### Unit Tests

Focus on:
- DOM structure: form fields exist, balance element exists, canvas exists, custom category input exists, sort control exists, monthly summary section exists
- Empty state: placeholder message shown when list is empty, balance shows `$0.00`, chart canvas hidden, monthly summary shows no-data message for empty month
- Category colors: each built-in category maps to a distinct hex color
- Chart.js initialization: chart instance is created on first render
- Month_Selector default: on load, the selector value matches the current calendar month and year
- Sort_Control default: on load, the sort control shows the "default" option and list is in insertion order
- Custom category UI: after adding a custom category, the new `<option>` appears in the Expense_Form selector
- Sort_Control options: the dropdown contains exactly the four required Sort_Order options

### Property-Based Tests

Use **fast-check** (npm in the test environment).

Each property test must run a minimum of **100 iterations**.

Each test must include a comment tag in the format:
`// Feature: expense-budget-visualizer, Property N: <property_text>`

| Property | Test Description |
|---|---|
| Property 1 | Generate random valid transactions; verify list length increases by 1 and entry is present |
| Property 2 | Generate invalid inputs (empty name, non-positive amount, missing category); verify list unchanged and errors shown |
| Property 3 | Generate random valid transactions; verify all form fields are empty after submission |
| Property 4 | Generate random transactions; verify each rendered entry contains name, amount, category, and delete button |
| Property 5 | Generate random sequences of adds/deletes; verify displayed balance always equals sum of remaining amounts |
| Property 6 | Generate random transactions; verify chart dataset values equal category-grouped sums |
| Property 7 | Generate a list of transactions and a random target; verify delete removes exactly that one entry |
| Property 8 | Generate random unique category names; verify each appears in `getAllCategories()` and the selector after `addCustomCategory`, and persists through subsequent mutations |
| Property 9 | Generate existing category names with random casing variations; verify `validateCustomCategory` rejects all of them and `customCategories` is unchanged |
| Property 10 | Generate multiple custom categories; verify all assigned colors are distinct from each other and from built-in colors |
| Property 11 | Generate random transactions across multiple months; verify `filterTransactionsByMonth` returns only the correct month's transactions and totals match |
| Property 12 | Generate random transactions and a Sort_Order; verify `sortTransactions` returns correctly ordered copy and source array is unchanged |
| Property 13 | Generate random transactions with an active Sort_Order; add or delete a transaction and verify the re-rendered list remains in the correct order |

### Test Environment Note

Since this is a no-build vanilla JS app, tests run in a jsdom environment via Jest + jsdom with Chart.js mocked. fast-check is installed as a dev dependency.
