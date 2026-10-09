const form = document.getElementById("transaction-form");

const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");

const transactionList = document.getElementById("transaction-list");

// Load saved transactions from Local Storage
let transactions = [];

try {
    const savedTransactions = JSON.parse(
        localStorage.getItem("transactions") || "[]"
    );

    if (Array.isArray(savedTransactions)) {
        transactions = savedTransactions.filter((transaction) =>
            transaction &&
            typeof transaction.id === "string" &&
            typeof transaction.description === "string" &&
            Number.isFinite(transaction.amount) &&
            transaction.amount > 0 &&
            ["income", "expense"].includes(transaction.type)
        );
    }
} catch {
    transactions = [];
}

// Format amounts as Indian Rupees
function formatCurrency(amount) {
    return amount.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR"
    });
}

// Update the balance, income, and expense totals
function updateSummary() {

    const income = transactions
        .filter(transaction => transaction.type === "income")
        .reduce((total, transaction) => total + transaction.amount, 0);

    const expense = transactions
        .filter(transaction => transaction.type === "expense")
        .reduce((total, transaction) => total + transaction.amount, 0);

    const balance = income - expense;

    balanceElement.textContent = formatCurrency(balance);
    incomeElement.textContent = formatCurrency(income);
    expenseElement.textContent = formatCurrency(expense);
}

// Save transactions in Local Storage
function saveTransactions() {
    try {
        localStorage.setItem(
            "transactions",
            JSON.stringify(transactions)
        );
    } catch {
        alert("Unable to save data in this browser.");
    }
}

// Display transactions on the webpage
function displayTransactions() {

    transactionList.replaceChildren();

    if (transactions.length === 0) {
        const message = document.createElement("li");
        message.className = "empty-message";
        message.textContent = "No transactions yet. Add your first transaction!";
        transactionList.appendChild(message);
        return;
    }

    transactions.forEach(transaction => {

        const listItem = document.createElement("li");
        listItem.className = "transaction";

        const info = document.createElement("div");
        info.className = "transaction-info";

        const description = document.createElement("strong");
        description.textContent = transaction.description;

        const date = document.createElement("small");
        date.textContent = transaction.date;

        info.append(description, date);

        const actions = document.createElement("div");
        actions.className = "transaction-actions";

        const amount = document.createElement("span");

        amount.className =
            "transaction-amount " +
            (transaction.type === "income" ? "income-text" : "expense-text");

        const sign = transaction.type === "income" ? "+" : "-";

        amount.textContent =
            sign + formatCurrency(transaction.amount);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", function () {
            deleteTransaction(transaction.id);
        });

        actions.append(amount, deleteButton);
        listItem.append(info, actions);

        transactionList.appendChild(listItem);
    });
}

// Add a new transaction
form.addEventListener("submit", function (event) {

    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeInput.value;

    if (
        !description ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !["income", "expense"].includes(type)
    ) {
        alert("Please enter a valid description and positive amount.");
        return;
    }

    const transaction = {
        id: crypto.randomUUID(),
        description: description,
        amount: amount,
        type: type,
        date: new Date().toLocaleDateString("en-IN")
    };

    transactions.push(transaction);

    saveTransactions();
    displayTransactions();
    updateSummary();

    form.reset();
});

// Delete a transaction
function deleteTransaction(id) {

    transactions = transactions.filter(
        transaction => transaction.id !== id
    );

    saveTransactions();
    displayTransactions();
    updateSummary();
}

// Initialize the application
displayTransactions();
updateSummary();