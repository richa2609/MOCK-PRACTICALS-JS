const STORAGE_KEY = 'budget-tracker-system-data';
const categories = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Health',
  'Entertainment',
  'Travel',
  'Other'
];

const defaultExpenses = [
  { id: crypto.randomUUID(), date: '2026-09-01', category: 'Food', description: 'Groceries', amount: 120.45 },
  { id: crypto.randomUUID(), date: '2026-09-05', category: 'Transport', description: 'Fuel refill', amount: 60.2 },
  { id: crypto.randomUUID(), date: '2026-09-10', category: 'Bills', description: 'Internet bill', amount: 45 },
  { id: crypto.randomUUID(), date: '2026-09-12', category: 'Entertainment', description: 'Movie night', amount: 28.75 },
  { id: crypto.randomUUID(), date: '2026-09-17', category: 'Shopping', description: 'Office supplies', amount: 84.99 }
];

const form = document.getElementById('expenseForm');
const expenseIdInput = document.getElementById('expenseId');
const dateInput = document.getElementById('expenseDate');
const categoryInput = document.getElementById('expenseCategory');
const descriptionInput = document.getElementById('expenseDescription');
const amountInput = document.getElementById('expenseAmount');
const formMessage = document.getElementById('formMessage');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const formTitle = document.getElementById('formTitle');
const categoryFilter = document.getElementById('categoryFilter');
const sortOrder = document.getElementById('sortOrder');
const expenseTableBody = document.getElementById('expenseTableBody');
const totalSpentEl = document.getElementById('totalSpent');
const monthlySpentEl = document.getElementById('monthlySpent');
const largestExpenseEl = document.getElementById('largestExpense');
const transactionCountEl = document.getElementById('transactionCount');
const chartContainer = document.getElementById('chartContainer');
const exportBtn = document.getElementById('exportBtn');

let expenses = loadExpenses();

function loadExpenses() {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultExpenses));
      return [...defaultExpenses];
    }

    const parsed = JSON.parse(storedData);
    return Array.isArray(parsed) ? parsed : [...defaultExpenses];
  } catch (error) {
    console.error('Unable to parse stored budget data.', error);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultExpenses));
    return [...defaultExpenses];
  }
}

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
}

function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

function setFormMessage(message, type = '') {
  formMessage.textContent = message;
  formMessage.className = 'form-message';
  if (type) {
    formMessage.classList.add(type);
  }
}

function populateCategoryFilter() {
  const currentValue = categoryFilter.value || 'All';
  categoryFilter.innerHTML = '<option value="All">All categories</option>';

  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  categoryFilter.value = categories.includes(currentValue) ? currentValue : 'All';
}

function getFilteredExpenses() {
  const selectedCategory = categoryFilter.value;
  const sortValue = sortOrder.value;

  const filtered = expenses.filter((expense) => {
    return selectedCategory === 'All' || expense.category === selectedCategory;
  });

  filtered.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    switch (sortValue) {
      case 'date-asc':
        return dateA - dateB;
      case 'amount-desc':
        return b.amount - a.amount;
      case 'amount-asc':
        return a.amount - b.amount;
      case 'date-desc':
      default:
        return dateB - dateA;
    }
  });

  return filtered;
}

function renderSummary() {
  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthTotal = expenses
    .filter((item) => {
      const date = new Date(item.date + 'T00:00:00');
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const largest = expenses.reduce((max, item) => {
    return Number(item.amount) > Number(max.amount) ? item : max;
  }, { amount: 0 });

  totalSpentEl.textContent = formatCurrency(total);
  monthlySpentEl.textContent = formatCurrency(monthTotal);
  largestExpenseEl.textContent = largest.amount ? formatCurrency(largest.amount) : '$0.00';
  transactionCountEl.textContent = String(expenses.length);
}

function renderChart() {
  const totals = categories.map((category) => ({
    category,
    total: expenses
      .filter((expense) => expense.category === category)
      .reduce((sum, item) => sum + Number(item.amount), 0)
  }));

  const maxTotal = Math.max(...totals.map((item) => item.total), 1);

  chartContainer.innerHTML = '';

  totals.forEach(({ category, total }) => {
    const row = document.createElement('div');
    row.className = 'chart-row';

    const label = document.createElement('span');
    label.className = 'bar-label';
    label.textContent = category;

    const track = document.createElement('div');
    track.className = 'bar-track';

    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    fill.style.width = `${(total / maxTotal) * 100}%`;
    track.appendChild(fill);

    const value = document.createElement('span');
    value.className = 'bar-value';
    value.textContent = formatCurrency(total);

    row.append(label, track, value);
    chartContainer.appendChild(row);
  });

  if (!expenses.length) {
    chartContainer.innerHTML = '<p class="empty-state">No expense data available yet.</p>';
  }
}

function renderTable() {
  const items = getFilteredExpenses();
  expenseTableBody.innerHTML = '';

  if (!items.length) {
    expenseTableBody.innerHTML = '<tr><td colspan="5" class="empty-state">No expenses match the current filter.</td></tr>';
    return;
  }

  items.forEach((expense) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDate(expense.date)}</td>
      <td>${expense.category}</td>
      <td>${expense.description}</td>
      <td class="amount">${formatCurrency(expense.amount)}</td>
      <td>
        <button class="action-btn edit" type="button" data-action="edit" data-id="${expense.id}">Edit</button>
        <button class="action-btn delete" type="button" data-action="delete" data-id="${expense.id}">Delete</button>
      </td>
    `;
    expenseTableBody.appendChild(row);
  });
}

function renderApp() {
  renderSummary();
  renderTable();
  renderChart();
}

function resetForm() {
  form.reset();
  expenseIdInput.value = '';
  dateInput.value = new Date().toISOString().slice(0, 10);
  categoryInput.value = 'Food';
  formTitle.textContent = 'Add expense';
  submitBtn.textContent = 'Save expense';
  cancelEditBtn.classList.add('hidden');
  setFormMessage('');
}

function startEditExpense(id) {
  const expense = expenses.find((item) => item.id === id);
  if (!expense) {
    return;
  }

  expenseIdInput.value = expense.id;
  dateInput.value = expense.date;
  categoryInput.value = expense.category;
  descriptionInput.value = expense.description;
  amountInput.value = expense.amount;

  formTitle.textContent = 'Edit expense';
  submitBtn.textContent = 'Update expense';
  cancelEditBtn.classList.remove('hidden');
  setFormMessage('Editing an existing expense.', '');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteExpense(id) {
  expenses = expenses.filter((expense) => expense.id !== id);
  saveExpenses();
  renderApp();

  if (expenseIdInput.value === id) {
    resetForm();
  }

  setFormMessage('Expense deleted successfully.', 'success');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const date = dateInput.value.trim();
  const category = categoryInput.value.trim();
  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);

  if (!date || !category || !description || !amount || amount <= 0) {
    setFormMessage('Please enter a valid date, description, and amount greater than zero.', 'error');
    return;
  }

  const expenseData = {
    id: expenseIdInput.value || crypto.randomUUID(),
    date,
    category,
    description,
    amount: Number(amount.toFixed(2))
  };

  const isEditing = Boolean(expenseIdInput.value);

  if (isEditing) {
    expenses = expenses.map((expense) => {
      return expense.id === expenseData.id ? expenseData : expense;
    });
    setFormMessage('Expense updated successfully.', 'success');
  } else {
    expenses.unshift(expenseData);
    setFormMessage('Expense added successfully.', 'success');
  }

  saveExpenses();
  renderApp();
  resetForm();
});

expenseTableBody.addEventListener('click', (event) => {
  const actionButton = event.target.closest('button[data-action]');
  if (!actionButton) {
    return;
  }

  const { action, id } = actionButton.dataset;

  if (action === 'edit') {
    startEditExpense(id);
  }

  if (action === 'delete') {
    const expense = expenses.find((item) => item.id === id);
    const confirmed = window.confirm(`Delete the expense "${expense ? expense.description : 'this item'}"?`);
    if (confirmed) {
      deleteExpense(id);
    }
  }
});

categoryFilter.addEventListener('change', renderTable);
sortOrder.addEventListener('change', renderTable);

exportBtn.addEventListener('click', () => {
  if (!expenses.length) {
    setFormMessage('There is no data to export yet.', 'error');
    return;
  }

  const rows = [
    ['Date', 'Category', 'Description', 'Amount'],
    ...expenses.map((expense) => [expense.date, expense.category, expense.description, expense.amount])
  ];

  const csvContent = rows
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'budget-tracker-export.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  setFormMessage('Expense data exported as CSV.', 'success');
});

cancelEditBtn.addEventListener('click', () => {
  resetForm();
});

populateCategoryFilter();
dateInput.value = new Date().toISOString().slice(0, 10);
renderApp();
