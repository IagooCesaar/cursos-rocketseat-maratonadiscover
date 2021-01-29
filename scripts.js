const Utils = {
  formatCurrency(value) {
    const signal = Number(value) >= 0 ? "" : "-";
    /* Substituir todos os caracteres não numéricos com Regex */
    value = String(value).replace(/\D/g, "");
    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return `${signal} ${value}`;
  },
  formatAmout(value) {
    value = Number(value) * 100;
    return value;
  },
  formatDate(date) {
    const splittedDate = date.split("-");
    return splittedDate[2] + "/" + splittedDate[1] + "/" + splittedDate[0];
  },
};

const Modal = {
  open() {
    const form = document.querySelector(".modal-overlay");
    form.classList.add("active");
  },
  close() {
    const form = document.querySelector(".modal-overlay");
    form.classList.remove("active");
  },
};

const StorageTransactions = {
  storageKey: "dev.finances:transactions",
  get() {
    return (
      JSON.parse(localStorage.getItem(StorageTransactions.storageKey)) || []
    );
  },
  set(transactions) {
    localStorage.setItem(
      StorageTransactions.storageKey,
      JSON.stringify(transactions)
    );
  },
};

const Transaction = {
  all: StorageTransactions.get(),

  add(transaction) {
    Transaction.all.push(transaction);
    App.reload();
  },
  remove(index) {
    Transaction.all.splice(index, 1);
    App.reload();
  },
  incomes() {
    let income = 0;
    Transaction.all.forEach((transaction) => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    });
    return income;
  },
  expenses() {
    let expense = 0;
    Transaction.all.forEach((transaction) => {
      if (transaction.amount < 0) {
        expense += transaction.amount;
      }
    });
    return expense;
  },
  total() {
    return Transaction.incomes() + Transaction.expenses();
  },
};

const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),
  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },
  validateFields() {
    const { description, amount, date } = Form.getValues();
    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Todos os campos são obrigatórios");
    }
  },
  formatValues() {
    let { description, amount, date } = Form.getValues();
    amount = Utils.formatAmout(amount);
    date = Utils.formatDate(date);
    description = description.trim();
    return {
      description,
      amount,
      date,
    };
  },
  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = new Date().toISOString().substr(0, 10);

    return true;
  },
  submit(event) {
    event.preventDefault();
    try {
      Form.validateFields();
      const transaction = Form.formatValues();
      Transaction.add(transaction);
      Form.clearFields();
      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
};

const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),

  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const amount = Utils.formatCurrency(transaction.amount);

    const html = `      
      <td class="description">${transaction.description}</td>
      
      <td class="${
        transaction.amount > 0 ? "income" : "expense"
      }">${amount}</td>
      
      <td class="date">${transaction.date}</td>

      <td><img onClick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação"></td>
    `;
    return html;
  },

  updateBalance() {
    document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );
    document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );
    document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(
      Transaction.total()
    );
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  },
};

const App = {
  init() {
    // Transaction.all.forEach((transaction, index) =>
    //   DOM.addTransaction(transaction, index)
    // );
    Transaction.all.forEach(DOM.addTransaction);
    DOM.updateBalance();
    Form.clearFields();

    StorageTransactions.set(Transaction.all);
  },
  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();
