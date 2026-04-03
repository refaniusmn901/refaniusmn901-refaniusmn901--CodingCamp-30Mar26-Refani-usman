# Requirements Document

## Introduction

The Expense & Budget Visualizer is a client-side web application built with HTML, CSS, and Vanilla JavaScript. It allows users to log expenses by category, view a running total balance, and visualize spending through a pie chart — all held in memory for the current session. No backend, build tools, or data persistence are required.

## Glossary

- **App**: The Expense & Budget Visualizer web application
- **Transaction**: A single spending record with an item name, amount, and category
- **Category**: A label grouping related transactions; either a built-in category (Food, Transport, Fun) or a Custom_Category
- **Custom_Category**: A user-defined category name created at runtime and stored in memory for the current session
- **Expense_Form**: The UI form used to add a new transaction
- **Transaction_List**: The scrollable UI component displaying all logged transactions
- **Total_Balance**: The sum of all transaction amounts displayed at the top of the App
- **Chart**: A pie chart rendered on an HTML canvas element showing spending distribution by category
- **Monthly_Summary**: An aggregated view showing total spending per category for a selected calendar month
- **Month_Selector**: A UI control that allows the user to choose which calendar month to display in the Monthly_Summary
- **Sort_Order**: The current ordering applied to the Transaction_List; one of: Amount_Ascending, Amount_Descending, Category_Ascending, Category_Descending, or Default (insertion order)
- **Sort_Control**: A UI control that allows the user to select the active Sort_Order for the Transaction_List

## Requirements

### Requirement 1: Add a Transaction

**User Story:** As a user, I want to log a transaction with an item name, amount, and category, so that I can keep a record of my spending.

#### Acceptance Criteria

1. THE Expense_Form SHALL include the following required fields: item name (text), amount (numeric), and category (one of: Food, Transport, Fun, or any existing Custom_Category)
2. WHEN the user submits the Expense_Form with all fields filled and a valid positive amount, THE App SHALL add the transaction to the Transaction_List and update the Total_Balance and Chart
3. IF the user submits the Expense_Form with any field empty or an invalid amount, THEN THE Expense_Form SHALL display an inline validation error for each invalid field
4. WHEN a transaction is successfully added, THE Expense_Form SHALL reset to its empty default state

---

### Requirement 2: View Transaction List

**User Story:** As a user, I want to see all my logged transactions in a list, so that I can review my spending.

#### Acceptance Criteria

1. THE Transaction_List SHALL display all transactions added during the current session
2. THE Transaction_List SHALL show the item name, amount, and category for each transaction entry
3. WHEN the Transaction_List contains no entries, THE App SHALL display a placeholder message indicating no transactions have been logged
4. THE Transaction_List SHALL be scrollable when the number of entries exceeds the visible area

---

### Requirement 3: Delete a Transaction

**User Story:** As a user, I want to delete a transaction, so that I can correct mistakes.

#### Acceptance Criteria

1. THE Transaction_List SHALL display a delete button for each transaction entry
2. WHEN the user clicks the delete button on a transaction entry, THE App SHALL remove that transaction from the Transaction_List and immediately update the Total_Balance and Chart

---

### Requirement 4: Total Balance Display

**User Story:** As a user, I want to see the total of all my expenses at the top of the page, so that I know how much I have spent in total.

#### Acceptance Criteria

1. THE App SHALL display the Total_Balance at the top of the page
2. WHEN a transaction is added or deleted, THE App SHALL recalculate and re-render the Total_Balance immediately
3. WHEN no transactions exist, THE App SHALL display a Total_Balance of zero

---

### Requirement 5: Spending Pie Chart

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can quickly identify where my money is going.

#### Acceptance Criteria

1. THE Chart SHALL render a pie chart showing the proportion of total spending for each category (Food, Transport, Fun)
2. THE Chart SHALL use a distinct color for each category to ensure visual differentiation
3. WHEN expenses are added or deleted, THE Chart SHALL re-render to reflect the current data without requiring a page reload
4. WHEN no transactions exist, THE Chart SHALL display an empty state message instead of a blank canvas
5. WHERE a charting library is used, THE App SHALL use Chart.js or an equivalent client-side charting library

---

### Requirement 6: Custom Categories

**User Story:** As a user, I want to create my own spending categories, so that I can organize transactions in a way that fits my personal budget.

#### Acceptance Criteria

1. THE App SHALL provide a dedicated input field and submit control for creating a new Custom_Category
2. WHEN the user submits a non-empty, unique name via the Custom_Category input, THE App SHALL add the Custom_Category to the category list and make it immediately available in the Expense_Form category selector
3. IF the user submits a Custom_Category name that is empty or already exists (case-insensitive), THEN THE App SHALL display an inline validation error and SHALL NOT add a duplicate entry
4. WHEN a Custom_Category exists, THE Chart SHALL assign it a distinct color and include it in the spending distribution alongside the built-in categories
5. THE App SHALL persist all Custom_Categories in memory for the duration of the current session

---

### Requirement 7: Monthly Summary View

**User Story:** As a user, I want to see a summary of my spending grouped by category for a specific month, so that I can understand my monthly budget patterns.

#### Acceptance Criteria

1. THE App SHALL display a Monthly_Summary section showing total spending per category for the selected month
2. THE App SHALL provide a Month_Selector control that allows the user to choose a calendar month and year
3. WHEN the user changes the selected month via the Month_Selector, THE App SHALL recalculate and re-render the Monthly_Summary immediately to reflect only transactions from that month
4. THE Monthly_Summary SHALL display each category that has at least one transaction in the selected month, along with its total amount
5. WHEN no transactions exist for the selected month, THE App SHALL display a message indicating no spending data is available for that period
6. THE Monthly_Summary SHALL default to displaying the current calendar month on initial load

---

### Requirement 8: Sort Transactions

**User Story:** As a user, I want to sort my transaction list by amount or category, so that I can quickly find and compare entries.

#### Acceptance Criteria

1. THE App SHALL provide a Sort_Control that allows the user to select a Sort_Order for the Transaction_List
2. THE Sort_Control SHALL offer the following Sort_Order options: amount ascending, amount descending, category ascending (A–Z), and category descending (Z–A)
3. WHEN the user selects a Sort_Order via the Sort_Control, THE App SHALL re-render the Transaction_List in the chosen order immediately without modifying the underlying stored transaction data
4. WHEN a new transaction is added or deleted, THE App SHALL maintain the currently active Sort_Order in the re-rendered Transaction_List
5. THE App SHALL apply Default (insertion order) Sort_Order on initial load
