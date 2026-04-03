// State
let transactions = [];
let currentSortOrder = "default";

// Constants
const CATEGORY_COLORS = {
  Food:      "#FF6384",
  Transport: "#36A2EB",
  Fun:       "#FFCE56"
};

const VALID_CATEGORIES = Object.keys(CATEGORY_COLORS);

const CUSTOM_CATEGORY_PALETTE = [
  "#4BC0C0", "#9966FF", "#FF9F40", "#C9CBCF",
  "#7BC8A4", "#E7E9ED", "#F67019", "#00A8B5"
];

// Custom categories state
let customCategories = [];

// --- Derived helpers ---

/**
 * Returns all categories: built-in + custom.
 * @returns {string[]}
 */
function getAllCategories() {
  return [...VALID_CATEGORIES, ...customCategories];
}

/**
 * Returns the color for a category.
 * Built-in categories use CATEGORY_COLORS; custom categories use CUSTOM_CATEGORY_PALETTE by index.
 * @param {string} category
 * @returns {string}
 */
function getCategoryColor(category) {
  if (CATEGORY_COLORS[category]) {
    return CATEGORY_COLORS[category];
  }
  var idx = customCategories.indexOf(category);
  return CUSTOM_CATEGORY_PALETTE[idx % CUSTOM_CATEGORY_PALETTE.length];
}

/**
 * Validates a custom category name.
 * Rejects empty or case-insensitive duplicate against getAllCategories().
 * @param {string} name
 * @returns {{ valid: boolean, error: string }}
 */
function validateCustomCategory(name) {
  if (!name || String(name).trim() === "") {
    return { valid: false, error: "Category name is required." };
  }
  var trimmed = String(name).trim().toLowerCase();
  var exists = getAllCategories().some(function (c) {
    return c.toLowerCase() === trimmed;
  });
  if (exists) {
    return { valid: false, error: "Category already exists." };
  }
  return { valid: true, error: "" };
}

/**
 * Adds a new custom category to the customCategories array.
 * @param {string} name
 */
function addCustomCategory(name) {
  customCategories.push(String(name).trim());
}

/**
 * Removes a custom category by name and deletes any transactions using it.
 * @param {string} name
 */
function deleteCustomCategory(name) {
  customCategories = customCategories.filter(function (c) { return c !== name; });
  transactions = transactions.filter(function (t) { return t.category !== name; });
}

// --- Core mutations ---

/**
 * Adds a new transaction to the transactions array.
 * @param {string} name
 * @param {number} amount
 * @param {string} category
 */
function addTransaction(name, amount, category) {
  var now = new Date();
  var date = now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");
  transactions.push({
    id: Date.now(),
    name: name,
    amount: Number(amount),
    category: category,
    date: date
  });
}

/**
 * Filters transactions to only those whose date falls in the given year/month.
 * @param {Array} txns
 * @param {number} year
 * @param {number} month - 1-indexed (1=January)
 * @returns {Array}
 */
function filterTransactionsByMonth(txns, year, month) {
  return txns.filter(function (t) {
    if (!t.date) return false;
    var parts = t.date.split("-");
    return Number(parts[0]) === year && Number(parts[1]) === month;
  });
}

/**
 * Returns a sorted copy of txns according to the given order.
 * Never mutates the source array.
 * @param {Array} txns
 * @param {string} order - "default" | "amount-asc" | "amount-desc" | "category-asc" | "category-desc"
 * @returns {Array}
 */
function sortTransactions(txns, order) {
  var copy = txns.slice();
  if (order === "amount-asc") {
    copy.sort(function (a, b) { return a.amount - b.amount; });
  } else if (order === "amount-desc") {
    copy.sort(function (a, b) { return b.amount - a.amount; });
  } else if (order === "category-asc") {
    copy.sort(function (a, b) { return a.category.localeCompare(b.category); });
  } else if (order === "category-desc") {
    copy.sort(function (a, b) { return b.category.localeCompare(a.category); });
  }
  // "default" returns insertion order (no sort)
  return copy;
}

/**
 * Removes the transaction with the given id from the transactions array.
 * @param {number} id
 */
function deleteTransaction(id) {
  transactions = transactions.filter(function (t) { return t.id !== id; });
}

// --- Validation ---

/**
 * Validates the expense form inputs.
 * @param {string} name
 * @param {string|number} amount
 * @param {string} category
 * @returns {{ valid: boolean, errors: { name?: string, amount?: string, category?: string } }}
 */
function validateForm(name, amount, category) {
  var errors = {};

  if (!name || String(name).trim() === "") {
    errors.name = "Item name is required.";
  }

  var numAmount = Number(amount);
  if (amount === "" || amount === null || amount === undefined || isNaN(numAmount) || numAmount <= 0) {
    errors.amount = "Amount must be a positive number.";
  }

  if (!category || !getAllCategories().includes(category)) {
    errors.category = "Please select a valid category.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: errors
  };
}

// --- Render functions ---

/**
 * Rebuilds the <select> options in Expense_Form from getAllCategories().
 * Preserves the current selection if still valid.
 */
function renderCategorySelector() {
  var select = document.getElementById("category");
  var current = select.value;
  select.innerHTML = '<option value="">-- Select category --</option>';
  getAllCategories().forEach(function (cat) {
    var opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    if (cat === current) opt.selected = true;
    select.appendChild(opt);
  });

  // Render the list of custom categories with delete buttons
  var list = document.getElementById("custom-category-list");
  list.innerHTML = "";
  if (customCategories.length === 0) {
    var empty = document.createElement("p");
    empty.className = "custom-cat-empty";
    empty.textContent = "No custom categories yet.";
    list.appendChild(empty);
    return;
  }
  customCategories.forEach(function (cat) {
    var li = document.createElement("li");
    li.className = "custom-cat-item";
    var dot = document.createElement("span");
    dot.className = "custom-cat-dot";
    dot.style.background = getCategoryColor(cat);
    var label = document.createElement("span");
    label.className = "custom-cat-label";
    label.textContent = cat;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "custom-cat-delete-btn";
    btn.dataset.cat = cat;
    btn.setAttribute("aria-label", "Delete category " + cat);
    btn.textContent = "Delete";
    li.appendChild(dot);
    li.appendChild(label);
    li.appendChild(btn);
    list.appendChild(li);
  });
}

/**
 * Reads transactions, sums amounts, updates #balance text content.
 * Shows $0.00 when empty.
 */
function renderBalance() {
  var total = transactions.reduce(function (sum, t) { return sum + t.amount; }, 0);
  document.getElementById("balance").textContent = "$" + total.toFixed(2);
}

/**
 * Rebuilds the transaction list <ul>.
 * Shows each entry with name, amount, category, and a delete button.
 * Shows empty-state <p> when list is empty.
 */
function renderList() {
  var ul = document.getElementById("transaction-list");
  var empty = document.getElementById("list-empty");

  ul.innerHTML = "";

  if (transactions.length === 0) {
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  var sorted = sortTransactions(transactions, currentSortOrder);
  sorted.forEach(function (t) {
    var li = document.createElement("li");
    li.className = "transaction-item";
    li.dataset.id = t.id;
    li.innerHTML =
      '<span class="t-name">' + t.name + '</span>' +
      '<span class="t-amount">$' + t.amount.toFixed(2) + '</span>' +
      '<span class="t-category">' + t.category + '</span>' +
      '<button class="delete-btn" data-id="' + t.id + '" aria-label="Delete ' + t.name + '">Delete</button>';
    ul.appendChild(li);
  });
}

/**
 * Reads the Month_Selector value, filters transactions by that month,
 * computes per-category totals, and renders category rows.
 * Shows "No spending data for this period" when filtered list is empty.
 */
function renderMonthlySummary() {
  var selector = document.getElementById("month-selector");
  var totalsContainer = document.getElementById("monthly-totals");
  var emptyMsg = document.getElementById("monthly-empty");

  if (!selector || !totalsContainer || !emptyMsg) return;

  var value = selector.value; // "YYYY-MM"
  var year, month;
  if (value) {
    var parts = value.split("-");
    year = Number(parts[0]);
    month = Number(parts[1]);
  } else {
    var now = new Date();
    year = now.getFullYear();
    month = now.getMonth() + 1;
  }

  var filtered = filterTransactionsByMonth(transactions, year, month);

  totalsContainer.innerHTML = "";

  if (filtered.length === 0) {
    emptyMsg.style.display = "block";
    return;
  }

  emptyMsg.style.display = "none";

  // Compute per-category totals
  var totals = {};
  filtered.forEach(function (t) {
    if (!totals[t.category]) totals[t.category] = 0;
    totals[t.category] += t.amount;
  });

  Object.keys(totals).forEach(function (cat) {
    var row = document.createElement("div");
    row.className = "monthly-row";
    row.innerHTML =
      '<span class="monthly-category">' + cat + '</span>' +
      '<span class="monthly-amount">$' + totals[cat].toFixed(2) + '</span>';
    totalsContainer.appendChild(row);
  });
}

// --- Top-level render ---

/**
 * Calls renderBalance(), renderList(), renderChart(), renderCategorySelector(), and renderMonthlySummary() in sequence.
 */
function render() {
  renderBalance();
  renderList();
  renderChart();
  renderCategorySelector();
  renderMonthlySummary();
}

// Chart.js instance (created once, updated on subsequent renders)
var chartInstance = null;

/**
 * Computes category totals from transactions.
 * Creates Chart.js pie chart instance on first call, calls chart.update() on subsequent calls.
 * Hides canvas and shows empty-state message when no transactions exist.
 */
function renderChart() {
  var canvas = document.getElementById("spending-chart");
  var empty = document.getElementById("chart-empty");

  if (transactions.length === 0) {
    canvas.style.display = "none";
    empty.style.display = "block";
    return;
  }

  canvas.style.display = "block";
  empty.style.display = "none";

  // Compute category totals dynamically from all categories
  var allCats = getAllCategories();
  var totals = {};
  allCats.forEach(function (cat) { totals[cat] = 0; });
  transactions.forEach(function (t) {
    if (totals[t.category] !== undefined) {
      totals[t.category] += t.amount;
    }
  });

  // Only include categories that have spending
  var labels = allCats.filter(function (cat) { return totals[cat] > 0; });
  var data = labels.map(function (cat) { return totals[cat]; });
  var colors = labels.map(function (cat) { return getCategoryColor(cat); });

  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.data.datasets[0].backgroundColor = colors;
    chartInstance.update();
  } else {
    chartInstance = new Chart(canvas, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors
        }]
      },
      options: {
        responsive: false
      }
    });
  }
}

// --- Event wiring ---

// 4.1 Form submit
document.getElementById("expense-form").addEventListener("submit", function (e) {
  e.preventDefault();

  var name     = document.getElementById("item-name").value;
  var amount   = document.getElementById("amount").value;
  var category = document.getElementById("category").value;

  var result = validateForm(name, amount, category);

  // Clear previous errors
  document.getElementById("name-error").textContent     = "";
  document.getElementById("amount-error").textContent   = "";
  document.getElementById("category-error").textContent = "";

  if (!result.valid) {
    if (result.errors.name)     document.getElementById("name-error").textContent     = result.errors.name;
    if (result.errors.amount)   document.getElementById("amount-error").textContent   = result.errors.amount;
    if (result.errors.category) document.getElementById("category-error").textContent = result.errors.category;
    return;
  }

  addTransaction(name.trim(), Number(amount), category);
  e.target.reset();
  render();
});

// 4.2 Delete via event delegation on the list container
document.querySelector(".list-container").addEventListener("click", function (e) {
  if (e.target.classList.contains("delete-btn")) {
    var id = Number(e.target.dataset.id);
    deleteTransaction(id);
    render();
  }
});

// 4.3 Initial render on page load
(function initMonthSelector() {
  var now = new Date();
  var value = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  var selector = document.getElementById("month-selector");
  if (selector) selector.value = value;
})();

render();

// 6.5 Custom category form submit
document.getElementById("custom-category-form").addEventListener("submit", function (e) {
  e.preventDefault();
  var nameInput = document.getElementById("custom-category-name");
  var errorEl   = document.getElementById("custom-category-error");
  var result = validateCustomCategory(nameInput.value);

  errorEl.textContent = "";

  if (!result.valid) {
    errorEl.textContent = result.error;
    return;
  }

  addCustomCategory(nameInput.value.trim());
  nameInput.value = "";
  renderCategorySelector();
});

// 6.6 Delete custom category via event delegation
document.getElementById("custom-category-list").addEventListener("click", function (e) {
  if (e.target.classList.contains("custom-cat-delete-btn")) {
    var cat = e.target.dataset.cat;
    deleteCustomCategory(cat);
    render();
  }
});

// 7.4 Month_Selector change event
document.getElementById("month-selector").addEventListener("change", function () {
  renderMonthlySummary();
});

// 8.4 Sort_Control change event
document.getElementById("sort-control").addEventListener("change", function () {
  currentSortOrder = this.value;
  renderList();
});
