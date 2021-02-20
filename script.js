const Modal = {
    toggle(){
        //adicionar e remover a classe active do modal
        document.querySelector('.modal-overlay').classList.toggle('active')
    }
}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("transactionsStorage")) || []
    },

    set(transactions){
        localStorage.setItem("transactionsStorage",JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),
    
    add(transactions){
        Transaction.all.push(transactions)
        App.reload()
    },

    remove(index){
        Transaction.all.splice(index, 1)
        App.reload()
    },

    incomes(){
        //sum incomes
        let income = 0
        //if each value from transactions
        //be higher than 0 we'll add them in the incomes display  
        Transaction.all.forEach(transactions => {
            if(transactions.amount > 0){
                income+= transactions.amount
            }
        })

        return income
    },
    expenses(){
        //sum expenses
        let expense = 0
        //if each value from transactions
        //be lower than 0 we'll add them in the expenses display  
        Transaction.all.forEach(transactions => {
            if(transactions.amount < 0){
                expense += transactions.amount
            }
        })

        return expense
    },
    total(){
        //incomes - expenses
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransactions(transactions, index){

        //pegar todas as transações e substituir pra js
        const tr  = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLtb(transactions,index)

        tr.dataset.index = index
        DOM.transactionsContainer.appendChild(tr)

    },
    innerHTMLtb(transactions, index){

        //mudar a classe do amount de acordo com seu valor
        const CSSclass = transactions.amount > 0 ? "income" : "expense"

        //formatar o amount pra real
        const amount = Format.formatCurrency(transactions.amount)

        //tabela
        const html = `
       
            <td class="description">${transactions.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transactions.date}</td>
            <td class="removeIcon">
                <img onclick="Transaction.remove(${index})" src="./img/remove-icon.svg" alt="">
            </td>
      

        `
        return html
    },

    //atualizar os dados da balança para o JS
    //para mudarmos os valores o quanto quisermos
    UpdateBalance(){
        document.getElementById('incomeDisplay')
        .innerHTML = Format.formatCurrency(Transaction.incomes())

        document.getElementById('expenseDisplay')
        .innerHTML = Format.formatCurrency(Transaction.expenses())

        document.getElementById('totalDisplay')
        .innerHTML = Format.formatCurrency(Transaction.total())
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }

}

const Format = {
    formatAmount(value){
        value = String(value.replace(/\,\./g, "")) * 100

        return value
    },

    formatDate(value){
        const splitDate = value.split("-")
        return `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`
    },
    formatCurrency(value){
        const sign = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value)/100

        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: "BRL"
        })

        

        return sign + value
    }
}

const Form = {
    description: document.getElementById('description'),
    amount: document.getElementById('amount'),
    date: document.getElementById('date'),

    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },

    validateFields(){
        //destrutura um objeto
        //codigo limpo
        //ao invés de usar Form.getValues().description 3 vezes
        //é só usar isso:
        const {description, amount, date} = Form.getValues()

        if(description === "" || amount === "", date === ""){
            throw  new Error("preencha todos os campos")
        }
    },

    formatValues(){
        let {description, amount, date} = Form.getValues()

        amount = Format.formatAmount(amount)
        date = Format.formatDate(date)
    
        return {
            //quando o objeto vai retornar ele mesmo, não é necessário usar o ':', 
            //por exemplo "description:description == description"
            description,
            amount,
            date
        }
    },

    saveTransaction(newTransaction){
        Transaction.add(newTransaction)
    },
    
    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event){
        event.preventDefault()

        //pegar os dados do form e transferir pro Transactions
        try {
            Form.validateFields()
            const newTransaction = Form.formatValues()

            Form.saveTransaction(newTransaction)

            Form.clearFields()

            Modal.toggle()

            console.log(Transaction.all);
            
        } catch (error) {
            alert(error.message)
        }

        //quando salvar os dados, fechar a janela
        //atualizar a aplicação
    }
}

const App = {
    init(){
        Transaction.all.forEach((transactions, index)=>{
            DOM.addTransactions(transactions, index)
        })  
        
        //atualizar a balança após adicionar uma transação
        DOM.UpdateBalance()

        Storage.set(Transaction.all)
    },
    reload(){
        DOM.clearTransactions()
        App.init()
    }
}

App.init()

