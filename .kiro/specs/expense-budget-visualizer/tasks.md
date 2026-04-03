# Tasks

## Task List

- [x] 1. Project scaffold
  - [x] 1.1 Create `index.html` with semantic structure: header (balance), form section, transaction list section, chart section; link `css/styles.css` and `js/app.js`; add Chart.js CDN script tag
  - [x] 1.2 Create `css/styles.css` with base layout styles: flexbox/grid page layout, scrollable transaction list container, form field and error styles, empty-state styles, chart section styles

- [x] 2. In-memory state and core logic (`js/app.js`)
  - [x] 2.1 Define `transactions` array and `CATEGORY_COLORS` constant; implement `addTransaction(name, amount, category)` and `deleteTransaction(id)` functions
  - [x] 2.2 Implement `validateForm(name, amount, category)` returning `{ valid, errors }` — rejects empty name, non-positive/non-numeric amount, missing category

- [x] 3. Render functions
  - [x] 3.1 Implement `renderBalance()` — reads `transactions`, sums amounts, updates `#balance` text content; shows `$0.00` when empty
  - [x] 3.2 Implement `renderList()` — rebuilds the transaction list `<ul>`; shows each entry with name, amount, category, and a delete button; shows empty-state `<p>` when list is empty
  - [x] 3.3 Implement `renderChart()` — computes category totals from `transactions`; creates Chart.js pie chart instance on first call and calls `chart.update()` on subsequent calls; hides canvas and shows empty-state message when no transactions exist

- [x] 4. Event wiring
  - [x] 4.1 Wire form submit event: call `validateForm`, display inline errors on failure, call `addTransaction` + reset form + `render()` on success
  - [x] 4.2 Wire delete button clicks (event delegation on list container): call `deleteTransaction(id)` + `render()`
  - [x] 4.3 Implement top-level `render()` that calls `renderBalance()`, `renderList()`, and `renderChart()` in sequence; call `render()` once on page load

- [x] 6. Custom Categories (`js/app.js` + `index.html` + `css/styles.css`)
  - [x] 6.1 Add `customCategories` array to state; implement `addCustomCategory(name)` and `validateCustomCategory(name)` (rejects empty or case-insensitive duplicate against `getAllCategories()`); implement `getAllCategories()` returning `[...VALID_CATEGORIES, ...customCategories]`
    - _Requirements: 6.2, 6.3, 6.5_
  - [x] 6.2 Implement `getCategoryColor(category)` — returns `CATEGORY_COLORS[name]` for built-in categories, otherwise assigns the next color from `CUSTOM_CATEGORY_PALETTE` based on index in `customCategories`
    - _Requirements: 6.4_
  - [x] 6.3 Implement `renderCategorySelector()` — rebuilds `<select>` options in Expense_Form from `getAllCategories()`; call it from `render()` and after `addCustomCategory`
    - _Requirements: 6.2, 6.5_
  - [x] 6.4 Add `Custom_Category_Form` section to `index.html`: text input for category name, submit button, inline error message element; add corresponding CSS styles to `css/styles.css`
    - _Requirements: 6.1, 6.3_
  - [x] 6.5 Wire Custom_Category_Form submit event: call `validateCustomCategory`, display inline error on failure, call `addCustomCategory` + clear input + `renderCategorySelector()` on success
    - _Requirements: 6.2, 6.3_

- [x] 7. Monthly Summary View (`js/app.js` + `index.html` + `css/styles.css`)
  - [x] 7.1 Add `date` field (ISO string `"YYYY-MM-DD"`) to the Transaction model inside `addTransaction()`; implement `filterTransactionsByMonth(txns, year, month)` filtering by that field
    - _Requirements: 7.3, 7.4_
  - [x] 7.2 Implement `renderMonthlySummary()` — reads the Month_Selector value, calls `filterTransactionsByMonth`, computes per-category totals, renders category rows; shows "No spending data for this period" when filtered list is empty
    - _Requirements: 7.1, 7.4, 7.5_
  - [x] 7.3 Add `Monthly_Summary` section to `index.html`: `Month_Selector` `<input type="month">` defaulting to current year/month, per-category totals container, empty-state message element; add corresponding CSS styles to `css/styles.css`
    - _Requirements: 7.2, 7.6_
  - [x] 7.4 Wire Month_Selector `change` event to call `renderMonthlySummary()`; call `renderMonthlySummary()` from `render()` so it updates on every add/delete
    - _Requirements: 7.3_

- [x] 8. Sort Transactions (`js/app.js` + `index.html` + `css/styles.css`)
  - [x] 8.1 Add `currentSortOrder` state (default `"default"`); implement `sortTransactions(txns, order)` returning a sorted copy for all five Sort_Order values without mutating the source array
    - _Requirements: 8.3, 8.5_
  - [x] 8.2 Update `renderList()` to apply `sortTransactions(transactions, currentSortOrder)` before building the `<ul>` entries
    - _Requirements: 8.3, 8.4_
  - [x] 8.3 Add `Sort_Control` section to `index.html`: `<select>` with options for default, amount-asc, amount-desc, category-asc, category-desc; add corresponding CSS styles to `css/styles.css`
    - _Requirements: 8.1, 8.2, 8.5_
  - [x] 8.4 Wire Sort_Control `change` event: update `currentSortOrder` and call `renderList()`
    - _Requirements: 8.3, 8.4_

- [-] 9. Tests
  - [x] 9.1 Unit test — DOM structure: verify form fields, balance element, canvas, empty-state elements, custom category input, sort control, and monthly summary section exist on load
  - [ ] 9.2 Unit test — empty state: balance shows `$0.00`, list shows placeholder message, chart canvas is hidden, monthly summary shows no-data message for empty month on load
  - [ ] 9.3 Unit test — category colors: verify `CATEGORY_COLORS` has distinct values for Food, Transport, Fun
  - [ ] 9.4 Unit test — Month_Selector default: selector value matches current calendar month and year on load
  - [ ] 9.5 Unit test — Sort_Control default: sort control shows "default" option and list is in insertion order on load
  - [ ] 9.6 Unit test — custom category UI: after `addCustomCategory`, the new `<option>` appears in the Expense_Form selector
  - [ ] 9.7 Unit test — Sort_Control options: dropdown contains exactly the four required Sort_Order options plus default
  - [ ]* 9.8 Property test — Property 1: for any valid transaction, adding it increases list length by 1 and the entry is present
  - [ ]* 9.9 Property test — Property 2: for any invalid input combination, list remains unchanged and validation errors are shown
  - [ ]* 9.10 Property test — Property 3: for any valid transaction submission, all form fields are cleared afterward
  - [ ]* 9.11 Property test — Property 4: for any transaction in the list, its rendered entry contains name, amount, category, and a delete button
  - [ ]* 9.12 Property test — Property 5: for any sequence of adds and deletes, displayed balance equals sum of remaining transaction amounts
  - [ ]* 9.13 Property test — Property 6: for any transaction list state, chart dataset values equal category-grouped sums
  - [ ]* 9.14 Property test — Property 7: for any list and target id, deleting that id removes exactly that transaction and no others
  - [ ]* 9.15 Property test — Property 8: for any unique category name, after `addCustomCategory` it appears in `getAllCategories()` and the selector, and persists through subsequent mutations
  - [ ]* 9.16 Property test — Property 9: for any existing category name with random casing, `validateCustomCategory` rejects it and `customCategories` is unchanged
  - [ ]* 9.17 Property test — Property 10: for any set of custom categories, all assigned colors are distinct from each other and from built-in colors
  - [ ]* 9.18 Property test — Property 11: for any transactions across multiple months, `filterTransactionsByMonth` returns only the correct month's transactions and totals match
  - [ ]* 9.19 Property test — Property 12: for any transaction list and Sort_Order, `sortTransactions` returns a correctly ordered copy and the source array is unchanged
  - [ ]* 9.20 Property test — Property 13: for any active Sort_Order, after adding or deleting a transaction the re-rendered list remains in the correct order
