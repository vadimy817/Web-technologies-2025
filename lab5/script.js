

let pizzasData = [];
let cart = [];

// Завантаження піц з JSON і рендер карток у lab4-стилі

document.addEventListener('DOMContentLoaded', () => {
    fetch('pizzas.json')
        .then(res => res.json())
        .then(pizzas => {
            pizzasData = pizzas;
            renderPizzaList(pizzasData);
            loadCart();
            renderCart();
            renderFilters();
        });

    // Додаємо делегування для кнопок "Купити"
    document.querySelector('.pizza-menu').addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart-button')) {
            const id = +e.target.dataset.id;
            addToCart(id);
        }
    });

    // Делегування для кошика (збільшення/зменшення/видалення)
    document.getElementById('cart').addEventListener('click', function(e) {
        if (e.target.classList.contains('quantity-button')) {
            const id = +e.target.closest('.order-item').dataset.id;
            if (e.target.classList.contains('increase-qty')) {
                changeQty(id, 1);
            } else if (e.target.classList.contains('decrease-qty')) {
                changeQty(id, -1);
            }
        }
        if (e.target.classList.contains('remove-button')) {
            const id = +e.target.closest('.order-item').dataset.id;
            removeFromCart(id);
        }
    });

    // Очищення кошика
    document.querySelector('.clear-order').addEventListener('click', function() {
        cart = [];
        saveCart();
        renderCart();
    });

    // Фільтри
    document.querySelector('.nav-list').addEventListener('click', function(e) {
        if (e.target.classList.contains('nav-link')) {
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            e.target.classList.add('active');
            const filter = e.target.dataset.filter;
            filterPizzas(filter);
        }
    });
});

function renderPizzaList(pizzas) {
    // Сортування: нові -> популярні -> інші
    pizzas = [...pizzas].sort((a, b) => {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;
        return 0;
    });
    let pizzaList = document.querySelector('.pizza-list');
    if (!pizzaList) {
        pizzaList = document.createElement('ul');
        pizzaList.className = 'pizza-list';
        const pizzaMenu = document.querySelector('.pizza-menu');
        pizzaMenu.innerHTML = '';
        pizzaMenu.appendChild(pizzaList);
    } else {
        pizzaList.innerHTML = '';
    }
    pizzas.forEach(pizza => {
        const li = document.createElement('li');
        li.className = 'pizza-item';
        let badgeHtml = '';
        if (pizza.isNew) {
            badgeHtml = '<div class="badge">Нова</div>';
        } else if (pizza.isPopular) {
            badgeHtml = '<div class="badge badge-popular">Популярна</div>';
        }
        li.innerHTML = `
            <div class="pizza-card" style="position:relative;">
                <div class="pizza-image">
                    <img src="${pizza.img}" alt="${pizza.name}">
                    ${badgeHtml}
                </div>
                <div class="pizza-info">
                    <h3 class="pizza-name">${pizza.name}</h3>
                    <p class="pizza-description">${pizza.description}</p>
                    <div class="pizza-actions">
                        <div class="price-options">
                            <span class="current-price">${pizza.price} грн</span>
                            <button class="add-to-cart-button" data-id="${pizza.id}">Купити</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        pizzaList.appendChild(li);
    });
}

// Кошик
function addToCart(id) {
    const pizza = pizzasData.find(p => p.id === id);
    const idx = cart.findIndex(item => item.id === id);
    if (idx > -1) {
        cart[idx].qty++;
    } else {
        cart.push({ id: pizza.id, name: pizza.name, price: pizza.price, img: pizza.img, qty: 1 });
    }
    saveCart();
    renderCart();
}

function changeQty(id, delta) {
    const idx = cart.findIndex(item => item.id === id);
    if (idx > -1) {
        cart[idx].qty += delta;
        if (cart[idx].qty <= 0) {
            cart.splice(idx, 1);
        }
        saveCart();
        renderCart();
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
}

function renderCart() {
    let cartList = document.querySelector('.order-list');
    if (!cartList) {
        cartList = document.createElement('ul');
        cartList.className = 'order-list';
        document.getElementById('cart').innerHTML = '';
        document.getElementById('cart').appendChild(cartList);
    } else {
        cartList.innerHTML = '';
    }
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.qty;
        const li = document.createElement('li');
        li.className = 'order-item';
        li.dataset.id = item.id;
        li.innerHTML = `
            <div class="order-details-group">
                <div class="order-details">
                    <h4 class="order-name">${item.name}</h4>
                </div>
                <div class="order-actions">
                    <span class="order-price">${item.price * item.qty} грн</span>
                    <div class="quantity-controls">
                        <button class="quantity-button decrease-qty">-</button>
                        <span class="quantity">${item.qty}</span>
                        <button class="quantity-button increase-qty">+</button>
                    </div>
                    <button class="remove-button">×</button>
                </div>
            </div>
            <div class="order-image-wrapper">
                <img src="${item.img}" alt="${item.name}" class="order-item-image">
            </div>
        `;
        cartList.appendChild(li);
    });
    document.querySelector('.total-price').textContent = total + ' грн';
    document.querySelector('.order-count').textContent = cart.length;
}

function saveCart() {
    localStorage.setItem('pizza_cart', JSON.stringify(cart));
}

function loadCart() {
    const data = localStorage.getItem('pizza_cart');
    if (data) {
        cart = JSON.parse(data);
    }
}

// Фільтри
function renderFilters() {
    const navList = document.querySelector('.nav-list');
    if (!navList) return;
    // Додаємо data-filter для кожної кнопки
    navList.querySelectorAll('.nav-link').forEach(link => {
        const text = link.textContent.trim();
        if (text === 'Усі піци') link.dataset.filter = 'all';
        if (text === 'М\'ясна' || text === 'Мясна') link.dataset.filter = 'meat';
        if (text === 'З ананасами') link.dataset.filter = 'pineapple';
        if (text === 'З грибами') link.dataset.filter = 'mushroom';
        if (text === 'З морепродуктами') link.dataset.filter = 'seafood';
        if (text === 'Вега') link.dataset.filter = 'vega';
        if (text === 'Нова') link.dataset.filter = 'new';
        if (text === 'Популярна') link.dataset.filter = 'popular';
    });
}

function filterPizzas(filter) {
    if (!filter || filter === 'all') {
        renderPizzaList(pizzasData);
    } else if (filter === 'new') {
        renderPizzaList(pizzasData.filter(pizza => pizza.isNew));
    } else if (filter === 'popular') {
        renderPizzaList(pizzasData.filter(pizza => pizza.isPopular));
    } else {
        renderPizzaList(pizzasData.filter(pizza => pizza.type && pizza.type.includes(filter)));
    }
} 