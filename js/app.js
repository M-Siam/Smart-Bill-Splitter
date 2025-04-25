let members = [];
let items = [];
let fees = [];
let payments = [];
let splitType = 'equal';
const history = JSON.parse(localStorage.getItem('billHistory')) || [];

document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    loadHistory();
    updateMemberSelects();
});

function addMember() {
    const name = document.getElementById('member-name').value.trim();
    if (name && !members.includes(name)) {
        members.push(name);
        updateMemberList();
        updateMemberSelects();
        document.getElementById('member-name').value = '';
    }
}

function updateMemberList() {
    const list = document.getElementById('member-list');
    list.innerHTML = members.map(name => `<li>${name} <button onclick="removeMember('${name}')">Remove</button></li>`).join('');
}

function removeMember(name) {
    members = members.filter(m => m !== name);
    items = items.filter(i => i.member !== name);
    fees = fees.filter(f => f.member !== name);
    payments = payments.filter(p => p.payer !== name);
    updateMemberList();
    updateItemsList();
    updateFeesList();
    updatePaymentsList();
    updateMemberSelects();
}

function addItem() {
    const member = document.getElementById('item-member').value;
    const name = document.getElementById('item-name').value.trim();
    const cost = parseFloat(document.getElementById('item-cost').value);
    if (member && name && cost > 0) {
        items.push({ member, name, cost });
        updateItemsList();
        document.getElementById('item-name').value = '';
        document.getElementById('item-cost').value = '';
    }
}

function updateItemsList() {
    const list = document.getElementById('items-list');
    list.innerHTML = items.map(item => `<div class="card">${item.member}: ${item.name} - $${item.cost.toFixed(2)}</div>`).join('');
}

function addCustomFee() {
    const name = document.getElementById('custom-fee-name').value.trim();
    const amount = parseFloat(document.getElementById('custom-fee-amount').value);
    const split = document.getElementById('custom-fee-split').value;
    const member = document.getElementById('custom-fee-member').value;
    if (name && amount > 0) {
        fees.push({ name, amount, split, member });
        update couvre
        updateFeesList();
        document.getElementById('custom-fee-name').value = '';
        document.getElementById('custom-fee-amount').value = '';
    }
}

function updateFeesList() {
    const list = document.getElementById('fees-list');
    list.innerHTML = fees.map(fee => `<div class="card">${fee.name}: $${fee.amount.toFixed(2)} (${fee.split === 'equal' ? 'Equal' : fee.member})</div>`).join('');
}

function addPayment() {
    const payer = document.getElementById('payer').value;
    const amount = parseFloat(document.getElementById('paid-amount').value);
    if (payer && amount > 0) {
        payments.push({ payer, amount });
        updatePaymentsList();
        document.getElementById('paid-amount').value = '';
    }
}

function updatePaymentsList() {
    const list = document.getElementById('payments-list');
    list.innerHTML = payments.map(p => `<div class="card">${p.payer} paid $${p.amount.toFixed(2)}</div>`).join('');
}

function updateMemberSelects() {
    const selects = ['item-member', 'custom-fee-member', 'payer'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        select.innerHTML = members.map(m => `<option value="${m}">${m}</option>`).join('');
    });
}

function calculateSplit() {
    const tip = parseFloat(document.getElementById('tip').value) || 0;
    const tax = parseFloat(document.getElementById('tax').value) || 0;
    splitType = document.getElementById('split-type').value;

    const results = members.map(member => {
        const memberItems = items.filter(i => i.member === member);
        const subtotal = memberItems.reduce((sum, i) => sum + i.cost, 0);
        let extra = 0;

        fees.forEach(fee => {
            if (fee.split === 'equal') {
                extra += fee.amount / members.length;
            } else if (fee.member === member) {
                extra += fee.amount;
            }
        });

        const memberTip = (subtotal * tip) / 100;
        const memberTax = (subtotal * tax) / 100;
        const total = subtotal + memberTip + memberTax + extra;

        return { member, items: memberItems, subtotal, tip: memberTip, tax: memberTax, extra, total };
    });

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const settlements = calculateSettlements(results, payments);

    displayResults(results, settlements);
    saveHistory(results, settlements);
    updateChart(results);
}

function calculateSettlements(results, payments) {
    const balances = {};
    results.forEach(r => balances[r.member] = -r.total);
    payments.forEach(p => balances[p.payer] = (balances[p.payer] || 0) + p.amount);

    const settlements = [];
    Object.entries(balances).forEach(([member, balance]) => {
        if (balance > 0) {
            settlements.push(`${member} should receive $${balance.toFixed(2)}`);
        } else if (balance < 0) {
            settlements.push(`${member} owes $${Math.abs(balance).toFixed(2)}`);
        }
    });
    return settlements;
}

function displayResults(results, settlements) {
    const resultCards = document.getElementById('result-cards');
    resultCards.innerHTML = results.map(r => `
        <div class="card">
            <h3>${r.member}</h3>
            <p>Items: ${r.items.map(i => `${i.name} ($${i.cost.toFixed(2)})`).join(', ')}</p>
            <p>Subtotal: $${r.subtotal.toFixed(2)}</p>
            <p>Tip: $${r.tip.toFixed(2)}</p>
            <p>Tax: $${r.tax.toFixed(2)}</p>
            <p>Extra: $${r.extra.toFixed(2)}</p>
            <p><strong>Total: $${r.total.toFixed(2)}</strong></p>
        </div>
    `).join('');

    resultCards.innerHTML += `<div class="card"><h3>Settlements</h3><p>${settlements.join('<br>')}</p></div>`;
}

function saveHistory(results, settlements) {
    history.push({ date: new Date(), results, settlements });
    localStorage.setItem('billHistory', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = history.map((entry, index) => `
        <div class="card">
            <p>${entry.date.toLocaleString()}</p>
            <button onclick="restoreHistory(${index})">Restore</button>
            <button onclick="deleteHistory(${index})">Delete</button>
        </div>
    `).join('');
}

function restoreHistory(index) {
    const entry = history[index];
    members = entry.results.map(r => r.member);
    items = entry.results.flatMap(r => r.items.map(i => ({ member: r.member, name: i.name, cost: i.cost })));
    updateMemberList();
    updateItemsList();
    updateMemberSelects();
    calculateSplit();
}

function deleteHistory(index) {
    history.splice(index, 1);
    localStorage.setItem('billHistory', JSON.stringify(history));
    loadHistory();
}

function initializeTheme() {
    const hour = new Date().getHours();
    const isDark = hour >= 19 || hour < 6;
    document.body.classList.add(isDark ? 'dark' : 'light');

    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('dark');
        document.body.classList.toggle('light');
    });
}
