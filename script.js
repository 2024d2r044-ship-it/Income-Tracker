/* =====================================================
   Expense Tracker Pro
   script.js - Part 1
===================================================== */

// ----------------------------
// Local Storage
// ----------------------------

let transactions =
JSON.parse(localStorage.getItem("transactions")) || [];

// Chart instance
let expenseChart = null;

// ----------------------------
// DOM Elements
// ----------------------------

const description =
document.getElementById("description");

const amount =
document.getElementById("amount");

const type =
document.getElementById("type");

const category =
document.getElementById("category");

const date =
document.getElementById("date");

const addBtn =
document.getElementById("addBtn");

const transactionList =
document.getElementById("transactionList");

const incomeElement =
document.getElementById("income");

const expenseElement =
document.getElementById("expense");

const balanceElement =
document.getElementById("balance");

const searchInput =
document.getElementById("search");

const monthFilter =
document.getElementById("monthFilter");

// ----------------------------
// Add Transaction
// ----------------------------

addBtn.addEventListener("click", addTransaction);

function addTransaction() {

    const desc = description.value.trim();

    const amt = Number(amount.value);

    const transType = type.value;

    const transCategory = category.value;

    const transDate = date.value;

    if (
        desc === "" ||
        amt <= 0 ||
        transDate === ""
    ) {
        showToast("Please fill all fields.");
        return;
    }

    const transaction = {

        id: Date.now(),

        description: desc,

        amount: amt,

        type: transType,

        category: transCategory,

        date: transDate

    };

    transactions.push(transaction);

    saveTransactions();

    clearInputs();

    showToast("Transaction Added");

    renderTransactions();

}

// ----------------------------
// Clear Inputs
// ----------------------------

function clearInputs() {

    description.value = "";

    amount.value = "";

    date.value = "";

    type.selectedIndex = 0;

    category.selectedIndex = 0;

}

// ----------------------------
// Save Local Storage
// ----------------------------

function saveTransactions() {

    localStorage.setItem(

        "transactions",

        JSON.stringify(transactions)

    );

}

// ----------------------------
// Render Transactions
// ----------------------------

function renderTransactions() {

    transactionList.innerHTML = "";

    let filtered = [...transactions];

    // Search Filter

    const keyword =

    searchInput.value.toLowerCase();

    if (keyword !== "") {

        filtered = filtered.filter(item =>

            item.description

            .toLowerCase()

            .includes(keyword)

        );

    }

    // Month Filter

    if (monthFilter.value !== "") {

        filtered = filtered.filter(item =>

            item.date.startsWith(

                monthFilter.value

            )

        );

    }

    // Empty Table

    if (filtered.length === 0) {

        transactionList.innerHTML =

        `<tr>

            <td colspan="6">

            No Transactions Found

            </td>

        </tr>`;

        updateSummary(filtered);

        return;

    }

    filtered.forEach(item => {

        const row =

        document.createElement("tr");

        row.classList.add("scale-in");

        row.innerHTML =

        `

        <td>

        ${item.description}

        </td>

        <td>

        <span class="badge ${item.category.toLowerCase()}">

        ${item.category}

        </span>

        </td>

        <td>

        ${item.type}

        </td>

        <td class="${

            item.type === "income"

            ?

            "income-text"

            :

            "expense-text"

        }">

        ₹${item.amount}

        </td>

        <td>

        ${item.date}

        </td>

        <td>

        <button

        class="delete"

        onclick="deleteTransaction(${item.id})">

        <i class="fa-solid fa-trash"></i>

        </button>

        </td>

        `;

        transactionList.appendChild(row);

    });

    updateSummary(filtered);

    updateChart(filtered);

}

/* =====================================================
   Expense Tracker Pro
   script.js - Part 2 (A)
===================================================== */

// ----------------------------
// Delete Transaction
// ----------------------------

function deleteTransaction(id) {

    const rows = document.querySelectorAll("#transactionList tr");

    rows.forEach(row => {

        const btn = row.querySelector("button");

        if (!btn) return;

        if (btn.getAttribute("onclick") === `deleteTransaction(${id})`) {

            row.classList.add("delete-row");

            setTimeout(() => {

                transactions = transactions.filter(item => item.id !== id);

                saveTransactions();

                renderTransactions();

                showToast("Transaction Deleted");

            }, 400);

        }

    });

}

// ----------------------------
// Update Summary
// ----------------------------

function updateSummary(list) {

    let income = 0;

    let expense = 0;

    list.forEach(item => {

        if (item.type === "income") {

            income += item.amount;

        } else {

            expense += item.amount;

        }

    });

    const balance = income - expense;

    animateValue(incomeElement, income);

    animateValue(expenseElement, expense);

    animateValue(balanceElement, balance);

}

// ----------------------------
// Animated Numbers
// ----------------------------

function animateValue(element, value) {

    const start = Number(

        element.textContent.replace(/[₹,]/g, "")

    ) || 0;

    const duration = 500;

    const startTime = performance.now();

    function update(currentTime) {

        const progress = Math.min(

            (currentTime - startTime) / duration,

            1

        );

        const current =

            Math.floor(

                start +

                (value - start) * progress

            );

        element.textContent =

            "₹" + current.toLocaleString();

        if (progress < 1) {

            requestAnimationFrame(update);

        }

    }

    requestAnimationFrame(update);

}

// ----------------------------
// Search & Filter
// ----------------------------

searchInput.addEventListener(

    "input",

    renderTransactions

);

monthFilter.addEventListener(

    "change",

    renderTransactions

);

// ----------------------------
// Update Chart
// ----------------------------

function updateChart(list) {

    const totals = {};

    list.forEach(item => {

        if (item.type !== "expense") return;

        if (!totals[item.category]) {

            totals[item.category] = 0;

        }

        totals[item.category] += item.amount;

    });

    const labels = Object.keys(totals);

    const values = Object.values(totals);

    const colors = [

        "#3B82F6",

        "#22C55E",

        "#F59E0B",

        "#EF4444",

        "#8B5CF6",

        "#EC4899",

        "#06B6D4",

        "#6B7280"

    ];

    const ctx = document
        .getElementById("expenseChart")
        .getContext("2d");

    if (expenseChart) {

        expenseChart.destroy();

    }

    expenseChart = new Chart(ctx, {

        type: "pie",

        data: {

            labels: labels,

            datasets: [{

                data: values,

                backgroundColor: colors

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    position: "bottom"

                }

            }

        }

    });

}
/* =====================================================
   Expense Tracker Pro
   script.js - Part 2 (B)
===================================================== */

// ----------------------------
// Toast Notification
// ----------------------------

function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}

// ----------------------------
// Dark Mode
// ----------------------------

const themeToggle =
document.getElementById("themeToggle");

const savedTheme =
localStorage.getItem("theme");

if (savedTheme === "dark") {

    document.body.classList.add("dark");

    themeToggle.innerHTML =
    '<i class="fa-solid fa-sun"></i>';

}

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        localStorage.setItem("theme", "dark");

        themeToggle.innerHTML =
        '<i class="fa-solid fa-sun"></i>';

    } else {

        localStorage.setItem("theme", "light");

        themeToggle.innerHTML =
        '<i class="fa-solid fa-moon"></i>';

    }

});

// ----------------------------
// Export CSV
// ----------------------------

const exportBtn =
document.getElementById("exportCSV");

exportBtn.addEventListener("click", exportCSV);

function exportCSV() {

    if (transactions.length === 0) {

        showToast("No transactions to export");

        return;

    }

    let csv =

    "Description,Category,Type,Amount,Date\n";

    transactions.forEach(item => {

        csv +=

        `"${item.description}",` +

        `"${item.category}",` +

        `"${item.type}",` +

        `"${item.amount}",` +

        `"${item.date}"\n`;

    });

    const blob =

    new Blob([csv], {

        type: "text/csv"

    });

    const url =
    URL.createObjectURL(blob);

    const a =
    document.createElement("a");

    a.href = url;

    a.download = "Expense_Report.csv";

    a.click();

    URL.revokeObjectURL(url);

    showToast("CSV Exported");

}

// ----------------------------
// Keyboard Shortcut
// ----------------------------

document.addEventListener("keydown", e => {

    if (e.key === "Enter") {

        if (

            document.activeElement === description ||

            document.activeElement === amount ||

            document.activeElement === date

        ) {

            addTransaction();

        }

    }

});

// ----------------------------
// Initial Load
// ----------------------------

renderTransactions();

// ----------------------------
// Console Message
// ----------------------------

console.log(
"%cExpense Tracker Pro Loaded",
"color:#2563eb;font-size:16px;font-weight:bold;"
);

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker.register("service-worker.js");

    });

}