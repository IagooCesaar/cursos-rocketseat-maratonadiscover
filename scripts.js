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
  formatAmount(value) {
    value = Number(value) * 100;
    return Math.round(value);
  },
  formatDateToStringDate(date) {
    const splittedDate = date.split("-");
    return splittedDate[2] + "/" + splittedDate[1] + "/" + splittedDate[0];
  },
  formatStringDateToDate(stringDate) {
    const splittedDate = stringDate.split("/");
    return `${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}`;
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

const LoginModal = {
  form: document.querySelector("#login-form"),
  open() {
    LoginModal.form.classList.add("active");
  },
  close() {
    LoginModal.form.classList.remove("active");
  },
};

const LoginForm = {
  user: document.querySelector("input#user"),

  getValues() {
    return {
      user: LoginForm.user.value,
    };
  },

  cancel() {
    LoginModal.close();
  },
  submit(event) {
    event.preventDefault();
    console.log("aqui...");
    const { user } = LoginForm.getValues();
    App.user = user;

    App.init();
  },
};

const Modal = {
  form: document.querySelector("#transactions-form"),
  open(transactionID = "") {
    Modal.form.classList.add("active");

    if (transactionID) {
      transactionID = Number(transactionID);
      const [transaction] = Transaction.all.filter((transaction) => {
        return transaction.id == transactionID;
      });
      Form.setValues(
        transaction.description,
        transaction.amount / 100,
        Utils.formatStringDateToDate(transaction.date),
        transaction.id
      );
    }
  },
  close() {
    Modal.form.classList.remove("active");
  },
};

const Transaction = {
  all: StorageTransactions.get(),

  add(transaction) {
    const index = Transaction.all.findIndex((item, index) => {
      return item.id == transaction.id;
    });
    if (index > -1) {
      Transaction.all.splice(index, 1, transaction);
    } else {
      Transaction.all.push(transaction);
    }
    App.reload();
  },
  remove(transactionID) {
    const index = Transaction.all.findIndex((transaction, index) => {
      return transaction.id == transactionID;
    });

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
  id: document.querySelector("input#id"),

  getValues() {
    return {
      id: Form.id.value,
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },
  setValues(description, amount, date, id) {
    Form.description.value = description;
    Form.amount.value = amount;
    Form.date.value = date;
    Form.id.value = id;
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
    let { id, description, amount, date } = Form.getValues();
    amount = Utils.formatAmount(amount);
    date = Utils.formatDateToStringDate(date);
    description = description.trim();
    if (id) {
      id = Number(id);
    } else {
      id = Number(new Date().getTime());
    }
    return {
      id,
      description,
      amount,
      date,
    };
  },
  clearFields() {
    Form.setValues("", "", new Date().toISOString().substr(0, 10), "");

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
  cancel() {
    Form.clearFields();
    Modal.close();
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

      <td>
      
      <img onClick="Modal.open(${
        transaction.id
      })" src="./assets/edit.svg" alt="Editar transação" title="Editar transação">

      <img onClick="Transaction.remove(${
        transaction.id
      })" src="./assets/minus.svg" alt="Remover transação" title="Remover transação">
      
      </td>
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
  user: "",
  init() {
    // Transaction.all.forEach((transaction, index) =>
    //   DOM.addTransaction(transaction, index)
    // );
    LoginModal.close();
    if (App.user) {
      Transaction.all.forEach(DOM.addTransaction);
      DOM.updateBalance();
      Form.clearFields();

      StorageTransactions.set(Transaction.all);
    } else {
      LoginModal.open();
    }
  },
  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();
