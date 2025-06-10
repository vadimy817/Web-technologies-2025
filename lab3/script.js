document.addEventListener('DOMContentLoaded', () => {
    const firstColumn = document.querySelector('.column:first-child');
    const secondColumn = document.querySelector('.column:last-child');

    const inputGroup = firstColumn.querySelector('.input-group');

    secondColumn.innerHTML = '';

    const remainingHeader = document.createElement('h3');
    remainingHeader.textContent = 'Залишилося';
    secondColumn.appendChild(remainingHeader);

    const remainingItemsSection = document.createElement('div');
    remainingItemsSection.classList.add('summary-section');
    secondColumn.appendChild(remainingItemsSection);

    const boughtHeader = document.createElement('h3');
    boughtHeader.textContent = 'Куплено';
    secondColumn.appendChild(boughtHeader);

    const boughtItemsSection = document.createElement('div');
    boughtItemsSection.classList.add('summary-section');
    secondColumn.appendChild(boughtItemsSection);

    let items = [];

    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    function saveItemsToLocalStorage() {
        localStorage.setItem('shoppingCartItems', JSON.stringify(items));
    }

    function loadItemsFromLocalStorage() {
        const storedItems = localStorage.getItem('shoppingCartItems');
        if (storedItems) {
            try {
                items = JSON.parse(storedItems);
                items = items.map(item => {
                    if (!item.id) {
                        item.id = generateUniqueId();
                    }
                    return item;
                });
            } catch (e) {
                console.error("Помилка при парсингу даних з localStorage:", e);
                items = [];
            }
        } else {
            items = [];
        }
    }

    function renderAllItems() {
        
        while (firstColumn.children.length > 1) {
            firstColumn.removeChild(firstColumn.lastChild);
        }

        items.forEach(itemData => {
            const newItemDOMElement = createItemDOMElement(itemData);
            firstColumn.appendChild(newItemDOMElement);
        });

        updateSummary();
        saveItemsToLocalStorage();
    }

    function createItemDOMElement(item) {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');
        itemDiv.dataset.id = item.id;

        const nameSpan = document.createElement('span');
        nameSpan.textContent = item.name;
        if (item.bought) {
            nameSpan.classList.add('crossed');
        }

        const nameEditInput = document.createElement('input');
        nameEditInput.type = 'text';
        nameEditInput.classList.add('item-edit-input');
        nameEditInput.style.display = 'none';

        nameSpan.addEventListener('click', () => {
            if (!item.bought) {
                nameSpan.style.display = 'none';
                nameEditInput.value = item.name;
                nameEditInput.style.display = '';
                itemDiv.insertBefore(nameEditInput, nameSpan);
                nameEditInput.focus();

                
            }
        });

        nameEditInput.addEventListener('blur', () => {
            const newName = nameEditInput.value.trim();
            if (newName !== '' && newName !== item.name) {
                const itemIndex = items.findIndex(i => i.id === item.id);
                if (itemIndex !== -1) {
                    items[itemIndex].name = newName;
                    renderAllItems();
                }
            } else {
                nameEditInput.style.display = 'none';
                nameSpan.style.display = '';
                
            }
            if (nameEditInput.parentNode === itemDiv) {
                itemDiv.removeChild(nameEditInput);
            }
        });

        nameEditInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                nameEditInput.blur();
            }
        });

        const amountControlsDiv = document.createElement('div');
        amountControlsDiv.classList.add('amount-controls');

        const removeButton = document.createElement('button');
        removeButton.classList.add('remove');
        removeButton.setAttribute('data-tooltip', 'Зменшити кількість');
        removeButton.textContent = '-';

        const amountSpan = document.createElement('span');
        amountSpan.classList.add('amount');
        amountSpan.textContent = item.amount;

        const addButton = document.createElement('button');
        addButton.classList.add('add');
        addButton.setAttribute('data-tooltip', 'Збільшити кількість');
        addButton.textContent = '+';

        function updateAmountButtonsState() {
            let currentAmount = parseInt(amountSpan.textContent);
            if (currentAmount <= 1) {
                removeButton.disabled = true;
                removeButton.style.opacity = '0.5';
                removeButton.style.cursor = 'not-allowed';
            } else {
                removeButton.disabled = false;
                removeButton.style.opacity = '1';
                removeButton.style.cursor = 'pointer';
            }
        }

        removeButton.addEventListener('click', () => {
            const itemIndex = items.findIndex(i => i.id === item.id);
            if (itemIndex !== -1 && items[itemIndex].amount > 1) {
                items[itemIndex].amount--;
                renderAllItems();
            }
        });

        addButton.addEventListener('click', () => {
            const itemIndex = items.findIndex(i => i.id === item.id);
            if (itemIndex !== -1) {
                items[itemIndex].amount++;
                renderAllItems();
            }
        });

        amountControlsDiv.appendChild(removeButton);
        amountControlsDiv.appendChild(amountSpan);
        amountControlsDiv.appendChild(addButton);

        const statusButton = document.createElement('button');
        statusButton.classList.add('status');

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.setAttribute('data-tooltip', 'Видалити товар');
        deleteButton.textContent = 'X';

        deleteButton.addEventListener('click', () => {
            items = items.filter(i => i.id !== item.id);
            renderAllItems();
        });

        function updateItemDisplayState(boughtStatus) {
            const itemIndex = items.findIndex(i => i.id === item.id);
            if (itemIndex !== -1) {
                items[itemIndex].bought = boughtStatus;
            }

            if (boughtStatus) {
                nameSpan.classList.add('crossed');
                statusButton.classList.add('bought');
                statusButton.textContent = 'Куплено';
                statusButton.setAttribute('data-tooltip', 'Позначити як не куплено');
                amountControlsDiv.style.display = 'none'; 
                deleteButton.style.display = 'none';     
                nameEditInput.style.display = 'none';
                nameSpan.style.display = '';
            } else {
                nameSpan.classList.remove('crossed');
                statusButton.classList.remove('bought');
                statusButton.textContent = 'Не куплено';
                statusButton.setAttribute('data-tooltip', 'Позначити як куплено');
                amountControlsDiv.style.display = ''; 
                deleteButton.style.display = '';     
                nameEditInput.style.display = 'none';
                nameSpan.style.display = '';
            }
        }

        statusButton.addEventListener('click', () => {
            const currentItem = items.find(i => i.id === item.id);
            if (currentItem) {
                updateItemDisplayState(!currentItem.bought);
                renderAllItems();
            }
        });

        itemDiv.appendChild(nameSpan);
        itemDiv.appendChild(amountControlsDiv);
        itemDiv.appendChild(statusButton);
        itemDiv.appendChild(deleteButton);

        updateItemDisplayState(item.bought);
        updateAmountButtonsState();

        return itemDiv;
    }

    function updateSummary() {
        remainingItemsSection.innerHTML = '';
        boughtItemsSection.innerHTML = '';

        const remaining = {};
        const bought = {};

        items.forEach(item => {
            if (!item.name || item.name.trim() === '' || (item.amount <= 0 && !item.bought)) {
                return;
            }

            if (item.bought) {
                bought[item.name] = (bought[item.name] || 0) + item.amount;
            } else {
                remaining[item.name] = (remaining[item.name] || 0) + item.amount;
            }
        });

        for (const name in remaining) {
            const itemSummaryDiv = document.createElement('div');
            itemSummaryDiv.classList.add('item');
            itemSummaryDiv.innerHTML = `<span>${name}</span><span class="summary-amount">${remaining[name]}</span>`;
            remainingItemsSection.appendChild(itemSummaryDiv);
        }

        for (const name in bought) {
            const itemSummaryDiv = document.createElement('div');
            itemSummaryDiv.classList.add('item');
            itemSummaryDiv.innerHTML = `<span class="crossed">${name}</span><span class="summary-amount">${bought[name]}</span>`;
            boughtItemsSection.appendChild(itemSummaryDiv);
        }
    }

    function addItemFromInput() {
        const itemInput = firstColumn.querySelector('.input-group input[type="text"]');
        const itemName = itemInput.value.trim();
        if (itemName !== '') {
            const newItem = {
                id: generateUniqueId(),
                name: itemName,
                amount: 1,
                bought: false
            };
            items.unshift(newItem);
            itemInput.value = '';
            itemInput.focus();
            renderAllItems();
        }
    }

    loadItemsFromLocalStorage();

    if (items.length === 0) {
        const initialItems = [
            { id: generateUniqueId(), name: 'Молоко', amount: 1, bought: false },
            { id: generateUniqueId(), name: 'Хліб', amount: 1, bought: true },
            { id: generateUniqueId(), name: 'Яйця', amount: 12, bought: false },
            { id: generateUniqueId(), name: 'Кава', amount: 1, bought: false },
            { id: generateUniqueId(), name: 'Цукор', amount: 2, bought: true }
        ];
        items = initialItems;
        saveItemsToLocalStorage();
    }

    renderAllItems();

    if (inputGroup.parentNode !== firstColumn) {
        firstColumn.insertBefore(inputGroup, firstColumn.firstChild);
    } else if (firstColumn.firstChild !== inputGroup) {
        firstColumn.insertBefore(inputGroup, firstColumn.firstChild);
    }

    const itemInput = inputGroup.querySelector('input[type="text"]');
    const addItemButton = inputGroup.querySelector('.add-item-button');

    addItemButton.addEventListener('click', addItemFromInput);
    itemInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addItemFromInput();
        }
    });
});