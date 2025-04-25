const participants = [];
const items = [];
const payments = [];
const splitConfigs = {};
const extras = { tip: 0, tax: 0, customFee: 0 };
let chartInstance = null;
let chatState = { step: 'name', currentParticipant: null, currentItem: null };
let groupMode = false;
let sessionId = null;
let broadcastChannel = null;
const colors = ['#00ddeb', '#40c4ff', '#b3e5fc', '#80deea', '#4dd0e1', '#26c6da'];

// Generate unique session ID
function generateSessionId() {
  return 'xxxxxx'.replace(/[x]/g, () => Math.random().toString(36)[2]).toUpperCase();
}

// Initialize group mode
function toggleGroupMode() {
  try {
    groupMode = !groupMode;
    const toggleButton = document.getElementById('group-mode-toggle');
    toggleButton.textContent = `Group Mode: ${groupMode ? 'On' : 'Off'}`;
    const joinSection = document.getElementById('join-section');
    const participantSection = document.getElementById('participants');

    if (groupMode) {
      sessionId = generateSessionId();
      try {
        broadcastChannel = new BroadcastChannel(`split_${sessionId}`);
        broadcastChannel.onmessage = handleBroadcastMessage;
      } catch (e) {
        console.error('BroadcastChannel not supported:', e);
        alert('Group Mode requires a modern browser. Try sharing the session link manually.');
      }
      localStorage.setItem(`split_${sessionId}`, JSON.stringify({ participants, items, payments, extras }));
      showQRModal();
      const urlParams = new URLSearchParams(window.location.search);
      if (!urlParams.has('session')) {
        joinSection.style.display = 'none';
        participantSection.style.display = 'block';
      } else {
        joinSection.style.display = 'block';
        participantSection.style.display = 'none';
        document.getElementById('items').style.display = 'block';
        document.getElementById('extras').style.display = 'none';
        document.getElementById('payments').style.display = 'none';
        document.getElementById('split-options').style.display = 'none';
      }
    } else {
      if (broadcastChannel) {
        broadcastChannel.close();
        broadcastChannel = null;
      }
      localStorage.removeItem(`split_${sessionId}`);
      sessionId = null;
      joinSection.style.display = 'none';
      participantSection.style.display = 'block';
      document.getElementById('items').style.display = 'block';
      document.getElementById('extras').style.display = 'block';
      document.getElementById('payments').style.display = 'block';
      document.getElementById('split-options').style.display = 'block';
    }
    updateUI();
  } catch (e) {
    console.error('Error in toggleGroupMode:', e);
    alert('An error occurred. Please check the Console for details.');
  }
}

// Handle broadcast messages
function handleBroadcastMessage(event) {
  try {
    const { type, data } = event.data;
    if (type === 'sync') {
      participants.length = 0;
      participants.push(...data.participants);
      items.length = 0;
      items.push(...data.items);
      payments.length = 0;
      payments.push(...data.payments);
      Object.assign(extras, data.extras);
      updateParticipantList();
      updateItemList();
      updatePaymentList();
      updateItemAssignedSelect();
      updatePaymentPersonSelect();
      updateSplitConfig();
      document.getElementById('tip-percent').value = extras.tip;
      document.getElementById('tax-percent').value = extras.tax;
      document.getElementById('custom-fee').value = extras.customFee;
    }
  } catch (e) {
    console.error('Error in handleBroadcastMessage:', e);
  }
}

// Sync data to all tabs
function syncData() {
  if (groupMode && broadcastChannel) {
    try {
      const data = { participants, items, payments, extras };
      localStorage.setItem(`split_${sessionId}`, JSON.stringify(data));
      broadcastChannel.postMessage({ type: 'sync', data });
    } catch (e) {
      console.error('Error in syncData:', e);
    }
  }
}

// Show QR code modal
function showQRModal() {
  try {
    const modal = document.getElementById('qr-modal');
    const qrContainer = document.getElementById('qr-code');
    qrContainer.innerHTML = '';
    const sessionUrl = `${window.location.origin}${window.location.pathname}?session=${sessionId}`;
    QRCode.toCanvas(sessionUrl, { width: 200, color: { dark: '#0a0a1f', light: '#e0f7ff' } }, (err, canvas) => {
      if (err) {
        console.error('QR code generation failed:', err);
        qrContainer.textContent = `QR code generation failed. Share this link: ${sessionUrl}`;
      } else {
        qrContainer.appendChild(canvas);
      }
    });
    modal.classList.add('active');
  } catch (e) {
    console.error('Error in showQRModal:', e);
    alert('Failed to generate QR code. Check the Console for details.');
  }
}

// Close QR modal
function closeQRModal() {
  try {
    document.getElementById('qr-modal').classList.remove('active');
  } catch (e) {
    console.error('Error in closeQRModal:', e);
  }
}

// Join session
function joinSession() {
  try {
    const nameInput = document.getElementById('join-name');
    const name = nameInput.value.trim();
    if (name && !participants.includes(name)) {
      participants.push(name);
      splitConfigs[name] = { type: 'items', value: 0 };
      nameInput.value = '';
      syncData();
      updateParticipantList();
      updateItemAssignedSelect();
      updatePaymentPersonSelect();
      updateSplitConfig();
      document.getElementById('join-section').style.display = 'none';
      document.getElementById('items').style.display = 'block';
    } else {
      alert('Please enter a unique name.');
    }
  } catch (e) {
    console.error('Error in joinSession:', e);
    alert('An error occurred. Please check the Console for details.');
  }
}

// Core Functionality
function addParticipant() {
  try {
    const nameInput = document.getElementById('participant-name');
    const name = nameInput.value.trim();
    if (name && !participants.includes(name)) {
      participants.push(name);
      splitConfigs[name] = { type: 'items', value: 0 };
      nameInput.value = '';
      syncData();
      updateParticipantList();
      updateItemAssignedSelect();
      updatePaymentPersonSelect();
      updateSplitConfig();
    } else {
      alert('Please enter a unique name.');
    }
  } catch (e) {
    console.error('Error in addParticipant:', e);
  }
}

function updateParticipantList() {
  try {
    const list = document.getElementById('participant-list');
    list.innerHTML = participants.map((name, i) => `
      <div class="card">
        <p>${name}</p>
        <button onclick="removeParticipant('${name}')" class="neon-button">Remove</button>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error in updateParticipantList:', e);
  }
}

function removeParticipant(name) {
  try {
    const index = participants.indexOf(name);
    if (index > -1) {
      participants.splice(index, 1);
      delete splitConfigs[name];
      items.filter(item => item.assigned === name).forEach(item => item.assigned = '');
      syncData();
      updateParticipantList();
      updateItemAssignedSelect();
      updatePaymentPersonSelect();
      updateSplitConfig();
    }
  } catch (e) {
    console.error('Error in removeParticipant:', e);
  }
}

function addItem() {
  try {
    const nameInput = document.getElementById('item-name');
    const costInput = document.getElementById('item-cost');
    const assignedSelect = document.getElementById('item-assigned');
    const name = nameInput.value.trim();
    const cost = parseFloat(costInput.value);
    const assigned = assignedSelect.value;
    if (name && cost > 0) {
      items.push({ name, cost, assigned });
      nameInput.value = '';
      costInput.value = '';
      assignedSelect.value = '';
      syncData();
      updateItemList();
    } else {
      alert('Please enter a valid item name and cost.');
    }
  } catch (e) {
    console.error('Error in addItem:', e);
  }
}

function updateItemList() {
  try {
    const list = document.getElementById('item-list');
    list.innerHTML = items.map((item, i) => `
      <div class="card">
        <p>${item.name}: ৳${item.cost.toFixed(2)}</p>
        <p>Assigned: ${item.assigned || 'Unassigned'}</p>
        <button onclick="removeItem(${i})" class="neon-button">Remove</button>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error in updateItemList:', e);
  }
}

function removeItem(index) {
  try {
    items.splice(index, 1);
    syncData();
    updateItemList();
  } catch (e) {
    console.error('Error in removeItem:', e);
  }
}

function updateItemAssignedSelect() {
  try {
    const select = document.getElementById('item-assigned');
    select.innerHTML = `<option value="">Unassigned</option>` + participants.map(name => `
      <option value="${name}">${name}</option>
    `).join('');
  } catch (e) {
    console.error('Error in updateItemAssignedSelect:', e);
  }
}

function addPayment() {
  try {
    const personSelect = document.getElementById('payment-person');
    const amountInput = document.getElementById('payment-amount');
    const person = personSelect.value;
    const amount = parseFloat(amountInput.value);
    if (person && amount > 0) {
      payments.push({ person, amount });
      personSelect.value = '';
      amountInput.value = '';
      syncData();
      updatePaymentList();
    } else {
      alert('Please select a person and enter a valid amount.');
    }
  } catch (e) {
    console.error('Error in addPayment:', e);
  }
}

function updatePaymentList() {
  try {
    const list = document.getElementById('payment-list');
    list.innerHTML = payments.map((payment, i) => `
      <div class="card">
        <p>${payment.person}: ৳${payment.amount.toFixed(2)}</p>
        <button onclick="removePayment(${i})" class="neon-button">Remove</button>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error in updatePaymentList:', e);
  }
}

function removePayment(index) {
  try {
    payments.splice(index, 1);
    syncData();
    updatePaymentList();
  } catch (e) {
    console.error('Error in removePayment:', e);
  }
}

function updatePaymentPersonSelect() {
  try {
    const select = document.getElementById('payment-person');
    select.innerHTML = `<option value="">Select Person</option>` + participants.map(name => `
      <option value="${name}">${name}</option>
    `).join('');
  } catch (e) {
    console.error('Error in updatePaymentPersonSelect:', e);
  }
}

function updateExtras() {
  try {
    extras.tip = parseFloat(document.getElementById('tip-percent').value) || 0;
    extras.tax = parseFloat(document.getElementById('tax-percent').value) || 0;
    extras.customFee = parseFloat(document.getElementById('custom-fee').value) || 0;
    syncData();
  } catch (e) {
    console.error('Error in updateExtras:', e);
  }
}

function updateSplitConfig() {
  try {
    const configDiv = document.getElementById('split-config');
    configDiv.innerHTML = participants.map(name => `
      <div class="card">
        <p>${name}</p>
        <select onchange="updateSplitType('${name}', this.value)" class="neon-input">
          <option value="items" ${splitConfigs[name].type === 'items' ? 'selected' : ''}>Items-Based</option>
          <option value="equal" ${splitConfigs[name].type === 'equal' ? 'selected' : ''}>Equal</option>
          <option value="percent" ${splitConfigs[name].type === 'percent' ? 'selected' : ''}>Percentage</option>
          <option value="fixed" ${splitConfigs[name].type === 'fixed' ? 'selected' : ''}>Fixed</option>
        </select>
        <input type="number" value="${splitConfigs[name].value}" onchange="updateSplitValue('${name}', this.value)" ${splitConfigs[name].type === 'items' ? 'disabled' : ''} step="0.01" class="neon-input">
      </div>
    `).join('');
  } catch (e) {
    console.error('Error in updateSplitConfig:', e);
  }
}

function updateSplitType(name, type) {
  try {
    splitConfigs[name].type = type;
    syncData();
    updateSplitConfig();
  } catch (e) {
    console.error('Error in updateSplitType:', e);
  }
}

function updateSplitValue(name, value) {
  try {
    splitConfigs[name].value = parseFloat(value) || 0;
    syncData();
  } catch (e) {
    console.error('Error in updateSplitValue:', e);
  }
}

function calculateSplit() {
  try {
    const totalItems = items.reduce((sum, item) => sum + item.cost, 0);
    const tipAmount = totalItems * (extras.tip / 100);
    const taxAmount = totalItems * (extras.tax / 100);
    const total = totalItems + tipAmount + taxAmount + extras.customFee;

    const results = {};
    participants.forEach(name => {
      results[name] = { items: 0, split: 0, paid: 0, owes: 0 };
      results[name].items = items
        .filter(item => item.assigned === name)
        .reduce((sum, item) => sum + item.cost, 0);
    });

    let remaining = total;
    let fixedTotal = 0;
    let percentTotal = 0;

    participants.forEach(name => {
      const config = splitConfigs[name];
      if (config.type === 'fixed') {
        results[name].split = config.value;
        fixedTotal += config.value;
      } else if (config.type === 'percent') {
        percentTotal += config.value;
      }
    });

    remaining -= fixedTotal;
    const equalCount = participants.filter(name => splitConfigs[name].type === 'equal').length;
    const itemsCount = participants.filter(name => splitConfigs[name].type === 'items').length;

    participants.forEach(name => {
      const config = splitConfigs[name];
      if (config.type === 'equal') {
        results[name].split = remaining / (equalCount + itemsCount);
      } else if (config.type === 'percent') {
        results[name].split = total * (config.value / 100);
      } else if (config.type === 'items') {
        const itemShare = results[name].items;
        const itemProportion = totalItems > 0 ? itemShare / totalItems : 0;
        results[name].split = itemShare + (tipAmount + taxAmount) * itemProportion + extras.customFee / participants.length;
      }
    });

    payments.forEach(payment => {
      results[payment.person].paid += payment.amount;
    });

    participants.forEach(name => {
      results[name].owes = results[name].split - results[name].paid;
    });

    displayResults(results);
    updateChart(results);
    showView('summary-view');
  } catch (e) {
    console.error('Error in calculateSplit:', e);
    alert('Error calculating split. Check the Console for details.');
  }
}

function displayResults(results) {
  try {
    const list = document.getElementById('result-list');
    list.innerHTML = participants.map((name, i) => `
      <div class="card" style="border-left: 6px solid ${colors[i % colors.length]}">
        <p><strong>${name}</strong></p>
        <p>Items: ৳${results[name].items.toFixed(2)}</p>
        <p>Share: ৳${results[name].split.toFixed(2)}</p>
        <p>Paid: ৳${results[name].paid.toFixed(2)}</p>
        <p>${results[name].owes > 0 ? 'Owes' : 'Is Owed'}: ৳${Math.abs(results[name].owes).toFixed(2)}</p>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error in displayResults:', e);
  }
}

function updateChart(results) {
  try {
    const ctx = document.getElementById('result-chart').getContext('2d');
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: participants,
        datasets: [{
          data: participants.map(name => results[name].split),
          backgroundColor: colors.slice(0, participants.length),
          borderWidth: 1,
          borderColor: '#0a0a1f'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top', labels: { color: '#e0f7ff' } },
          title: { display: true, text: 'Split Distribution', color: '#e0f7ff' }
        },
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    });
  } catch (e) {
    console.error('Error in updateChart:', e);
  }
}

function saveSplit() {
  try {
    const splitData = { participants, items, payments, splitConfigs, extras };
    localStorage.setItem('smartBillSplit', JSON.stringify(splitData));
    alert('Split saved!');
  } catch (e) {
    console.error('Error in saveSplit:', e);
  }
}

function loadSplit() {
  try {
    const data = localStorage.getItem('smartBillSplit');
    if (data) {
      const splitData = JSON.parse(data);
      participants.length = 0;
      participants.push(...splitData.participants);
      items.length = 0;
      items.push(...splitData.items);
      payments.length = 0;
      payments.push(...splitData.payments);
      Object.assign(splitConfigs, splitData.splitConfigs);
      Object.assign(extras, splitData.extras);
      syncData();
      updateParticipantList();
      updateItemList();
      updatePaymentList();
      updateItemAssignedSelect();
      updatePaymentPersonSelect();
      updateSplitConfig();
      document.getElementById('tip-percent').value = extras.tip;
      document.getElementById('tax-percent').value = extras.tax;
      document.getElementById('custom-fee').value = extras.customFee;
    }
  } catch (e) {
    console.error('Error in loadSplit:', e);
  }
}

function resetApp() {
  try {
    participants.length = 0;
    items.length = 0;
    payments.length = 0;
    Object.keys(splitConfigs).forEach(key => delete splitConfigs[key]);
    extras.tip = 0;
    extras.tax = 0;
    extras.customFee = 0;
    chatState = { step: 'name', currentParticipant: null, currentItem: null };
    if (groupMode) {
      toggleGroupMode();
    }
    syncData();
    updateParticipantList();
    updateItemList();
    updatePaymentList();
    updateItemAssignedSelect();
    updatePaymentPersonSelect();
    updateSplitConfig();
    document.getElementById('tip-percent').value = '';
    document.getElementById('tax-percent').value = '';
    document.getElementById('custom-fee').value = '';
    document.getElementById('result-list').innerHTML = '';
    document.getElementById('chat-messages').innerHTML = '';
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    showView('input-view');
  } catch (e) {
    console.error('Error in resetApp:', e);
  }
}

function downloadReceipt() {
  try {
    const totalItems = items.reduce((sum, item) => sum + item.cost, 0);
    const tipAmount = totalItems * (extras.tip / 100);
    const taxAmount = totalItems * (extras.tax / 100);
    const total = totalItems + tipAmount + taxAmount + extras.customFee;

    let receipt = `Smart Bill Splitter Receipt\n`;
    receipt += `Date: ${new Date().toLocaleString()}\n\n`;
    receipt += `Items:\n`;
    items.forEach(item => {
      receipt += `- ${item.name}: ৳${item.cost.toFixed(2)} (${item.assigned || 'Unassigned'})\n`;
    });
    receipt += `\nExtras:\n`;
    receipt += `Tip (${extras.tip}%): ৳${tipAmount.toFixed(2)}\n`;
    receipt += `Tax (${extras.tax}%): ৳${taxAmount.toFixed(2)}\n`;
    receipt += `Custom Fee: ৳${extras.customFee.toFixed(2)}\n`;
    receipt += `Total: ৳${total.toFixed(2)}\n\n`;
    receipt += `Payments:\n`;
    payments.forEach(payment => {
      receipt += `- ${payment.person}: ৳${payment.amount.toFixed(2)}\n`;
    });
    receipt += `\nSplit Configuration:\n`;
    participants.forEach(name => {
      receipt += `- ${name}: ${splitConfigs[name].type} (${splitConfigs[name].type !== 'items' ? splitConfigs[name].value : 'N/A'})\n`;
    });

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Error in downloadReceipt:', e);
  }
}

// Theme Toggle
function setTheme(theme) {
  try {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    document.getElementById('theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌙';
  } catch (e) {
    console.error('Error in setTheme:', e);
  }
}

function toggleTheme() {
  try {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  } catch (e) {
    console.error('Error in toggleTheme:', e);
  }
}

function setAutoTheme() {
  try {
    const hour = new Date().getHours();
    setTheme(hour >= 18 || hour < 6 ? 'dark' : 'light');
  } catch (e) {
    console.error('Error in setAutoTheme:', e);
  }
}

// Swipe Gestures
let touchStartX = 0;
let touchEndX = 0;

function handleSwipe() {
  try {
    const swipeDistance = touchEndX - touchStartX;
    if (swipeDistance > 50) {
      showView('input-view');
    } else if (swipeDistance < -50) {
      showView('summary-view');
    }
  } catch (e) {
    console.error('Error in handleSwipe:', e);
  }
}

document.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

// View Switching
function showView(viewId) {
  try {
    document.querySelectorAll('.swipe-view').forEach(view => {
      view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
  } catch (e) {
    console.error('Error in showView:', e);
  }
}

// Chat Modal
function toggleChatModal() {
  try {
    const modal = document.getElementById('chat-modal');
    modal.classList.toggle('active');
    if (modal.classList.contains('active')) {
      addChatMessage('bot', 'Hi! Let’s split a bill. What’s the first participant’s name?');
    }
  } catch (e) {
    console.error('Error in toggleChatModal:', e);
  }
}

function addChatMessage(sender, message) {
  try {
    const messages = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;
    div.textContent = message;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  } catch (e) {
    console.error('Error in addChatMessage:', e);
  }
}

function sendChatMessage() {
  try {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    addChatMessage('user', message);
    input.value = '';

    switch (chatState.step) {
      case 'name':
        if (!participants.includes(message)) {
          participants.push(message);
          splitConfigs[message] = { type: 'items', value: 0 };
          syncData();
          updateParticipantList();
          updateItemAssignedSelect();
          updatePaymentPersonSelect();
          updateSplitConfig();
          addChatMessage('bot', `Added ${message}. Next participant’s name, or type "items" to add items.`);
        } else {
          addChatMessage('bot', 'Name already exists. Try another name.');
        }
        break;
      case 'item-name':
        chatState.currentItem = { name: message, cost: 0, assigned: '' };
        addChatMessage('bot', `What’s the cost of ${message} (in ৳)?`);
        chatState.step = 'item-cost';
        break;
      case 'item-cost':
        const cost = parseFloat(message);
        if (cost > 0) {
          chatState.currentItem.cost = cost;
          addChatMessage('bot', `Who’s this item for? (${participants.join(', ')}) or "unassigned".`);
          chatState.step = 'item-assigned';
        } else {
          addChatMessage('bot', 'Please enter a valid cost.');
        }
        break;
      case 'item-assigned':
        if (participants.includes(message) || message.toLowerCase() === 'unassigned') {
          chatState.currentItem.assigned = message.toLowerCase() === 'unassigned' ? '' : message;
          items.push(chatState.currentItem);
          syncData();
          updateItemList();
          addChatMessage('bot', `Added ${chatState.currentItem.name}. Add another item ("item") or type "extras" for tip/tax.`);
          chatState.step = 'items';
          chatState.currentItem = null;
        } else {
          addChatMessage('bot', `Please select a valid participant or "unassigned".`);
        }
        break;
      case 'extras-tip':
        extras.tip = parseFloat(message) || 0;
        addChatMessage('bot', 'Enter tax percentage (e.g., 5 for 5%).');
        chatState.step = 'extras-tax';
        syncData();
        break;
      case 'extras-tax':
        extras.tax = parseFloat(message) || 0;
        addChatMessage('bot', 'Enter custom fee (in ৳).');
        chatState.step = 'extras-fee';
        syncData();
        break;
      case 'extras-fee':
        extras.customFee = parseFloat(message) || 0;
        addChatMessage('bot', 'Extras updated. Type "payment" to add payments or "done" to finish.');
        chatState.step = 'items';
        syncData();
        break;
      case 'payment-person':
        if (participants.includes(message)) {
          chatState.currentParticipant = message;
          addChatMessage('bot', `How much did ${message} pay (in ৳)?`);
          chatState.step = 'payment-amount';
        } else {
          addChatMessage('bot', 'Please select a valid participant.');
        }
        break;
      case 'payment-amount':
        const amount = parseFloat(message);
        if (amount > 0) {
          payments.push({ person: chatState.currentParticipant, amount });
          syncData();
          updatePaymentList();
          addChatMessage('bot', `Added payment. Add another payment ("payment") or type "done".`);
          chatState.step = 'items';
          chatState.currentParticipant = null;
        } else {
          addChatMessage('bot', 'Please enter a valid amount.');
        }
        break;
    }

    if (message.toLowerCase() === 'items') {
      chatState.step = 'item-name';
      addChatMessage('bot', 'What’s the name of the first item?');
    } else if (message.toLowerCase() === 'extras') {
      chatState.step = 'extras-tip';
      addChatMessage('bot', 'Enter tip percentage (e.g., 10 for 10%).');
    } else if (message.toLowerCase() === 'payment') {
      chatState.step = 'payment-person';
      addChatMessage('bot', `Who made a payment? (${participants.join(', ')})`);
    } else if (message.toLowerCase() === 'done') {
      chatState.step = 'name';
      toggleChatModal();
    }
  } catch (e) {
    console.error('Error in sendChatMessage:', e);
  }
}

// Update UI based on group mode
function updateUI() {
  try {
    const bottomNav = document.querySelector('.bottom-nav');
    bottomNav.style.display = groupMode && new URLSearchParams(window.location.search).has('session') ? 'none' : 'flex';
  } catch (e) {
    console.error('Error in updateUI:', e);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setAutoTheme();
    }
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('chat-input').addEventListener('keypress', e => {
      if (e.key === 'Enter') sendChatMessage();
    });

    // Check for session ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('session')) {
      sessionId = urlParams.get('session');
      groupMode = true;
      try {
        broadcastChannel = new BroadcastChannel(`split_${sessionId}`);
        broadcastChannel.onmessage = handleBroadcastMessage;
      } catch (e) {
        console.error('BroadcastChannel not supported:', e);
      }
      const data = localStorage.getItem(`split_${sessionId}`);
      if (data) {
        const splitData = JSON.parse(data);
        participants.push(...splitData.participants);
        items.push(...splitData.items);
        payments.push(...splitData.payments);
        Object.assign(extras, splitData.extras);
        updateParticipantList();
        updateItemList();
        updatePaymentList();
        updateItemAssignedSelect();
        updatePaymentPersonSelect();
        updateSplitConfig();
      }
      document.getElementById('group-mode-toggle').textContent = 'Group Mode: On';
      document.getElementById('join-section').style.display = 'block';
      document.getElementById('participants').style.display = 'none';
      document.getElementById('extras').style.display = 'none';
      document.getElementById('payments').style.display = 'none';
      document.getElementById('split-options').style.display = 'none';
      updateUI();
    }
  } catch (e) {
    console.error('Error in initialization:', e);
    alert('Initialization failed. Check the Console for details.');
  }
});
