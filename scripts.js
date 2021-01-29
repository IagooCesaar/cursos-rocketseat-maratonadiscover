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

const transactions = [
  {
    id: 1,
    description: "Luz",
    amount: -500000,
    date: "23/01/2021",
  },
  {
    id: 2,
    description: "Criação website",
    amount: 5000000,
    date: "23/01/2021",
  },
  {
    id: 3,
    description: "Internet",
    amount: -200000,
    date: "23/01/2021",
  },
];

const Transcation = {
  incomes() {
    // obter total de todas as entradas
  },
  expenses() {
    // obter o total de todas as saídas
  },
  total() {
    // obter o total (entradas - saídas)
    return Transcation.incomes() - Transcation.expenses();
  },
};

const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),

  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransaction(transaction);

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction) {
    const amount = Utils.formatCurrency(transaction.amount);

    const html = `      
      <td class="description">${transaction.description}</td>
      
      <td class="${
        transaction.amount > 0 ? "income" : "expense"
      }">${amount}</td>
      
      <td class="date">${transaction.date}</td>

      <td><img src="./assets/minus.svg" alt="Remover transação"></td>
    `;
    return html;
  },
};

const Utils = {
  formatCurrency(value) {
    const signal = Number(value) > 0 ? "+" : "-";
    return value;
  },
};

transactions.forEach((transaction, index) =>
  DOM.addTransaction(transaction, index)
);
