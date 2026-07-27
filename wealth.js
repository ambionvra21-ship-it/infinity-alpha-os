const Wealth = {

    income: 0,

    expenses: 0,

    investments: 0,

    savings: 0,

    get cashFlow() {
        return this.income - this.expenses;
    }

};

window.Wealth = Wealth;
