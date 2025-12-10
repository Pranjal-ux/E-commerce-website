const wrapper = document.querySelector(".sliderWrapper");
const menuItems = document.querySelectorAll(".menuItem");

// === CART MANAGEMENT ===
let cart = JSON.parse(localStorage.getItem('ecom_cart')) || [];

function saveCart() {
    localStorage.setItem('ecom_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const count = cart.length;
    document.getElementById('cart-count').textContent = count;

    const itemsList = document.getElementById('cart-items-list');
    if (count === 0) {
        itemsList.innerHTML = '<p style="text-align:center;color:#999;">Your cart is empty</p>';
    } else {
        itemsList.innerHTML = cart.map((item, idx) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.title}</div>
          <div class="cart-item-size">Size: ${item.size}</div>
        </div>
        <div class="cart-item-price">$${item.price}</div>
        <button class="cart-item-remove" onclick="removeFromCart(${idx})">Remove</button>
      </div>
    `).join('');
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('cart-total').textContent = total.toFixed(2);
}

function removeFromCart(idx) {
    cart.splice(idx, 1);
    saveCart();
}

function addToCart() {
    const selectedSize = Array.from(document.querySelectorAll('.size')).find(s => s.style.backgroundColor === 'black');
    if (!selectedSize) {
        alert('Please select a size');
        return;
    }

    const item = {
        id: choosenProduct.id,
        title: choosenProduct.title,
        price: choosenProduct.price,
        size: selectedSize.textContent,
        color: '', // you can enhance this later
        timestamp: Date.now()
    };

    cart.push(item);
    saveCart();
    alert(`${choosenProduct.title} added to cart!`);

    // Open cart sidebar
    document.getElementById('cart-sidebar').classList.add('open');
}

// Cart icon click
document.getElementById('cart-icon').addEventListener('click', () => {
    document.getElementById('cart-sidebar').classList.add('open');
});

// Cart close
document.querySelector('.cart-close').addEventListener('click', () => {
    document.getElementById('cart-sidebar').classList.remove('open');
});

// Cart checkout button - open payment modal
document.getElementById('cart-checkout-btn').addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    document.getElementById('cart-sidebar').classList.remove('open');
    document.querySelector('.payment').style.display = 'flex';
});

const products = [
    {
        id: 1,
        title: "Air Force",
        price: 119,
        colors: [
            {
                code: "black",
                img: "./img/air.png",
            },
            {
                code: "darkblue",
                img: "./img/air2.png",
            },
        ],
    },
    {
        id: 2,
        title: "Air Jordan",
        price: 149,
        colors: [
            {
                code: "lightgray",
                img: "./img/jordan.png",
            },
            {
                code: "green",
                img: "./img/jordan2.png",
            },
        ],
    },
    {
        id: 3,
        title: "Blazer",
        price: 109,
        colors: [
            {
                code: "lightgray",
                img: "./img/blazer.png",
            },
            {
                code: "green",
                img: "./img/blazer2.png",
            },
        ],
    },
    {
        id: 4,
        title: "Crater",
        price: 129,
        colors: [
            {
                code: "black",
                img: "./img/crater.png",
            },
            {
                code: "lightgray",
                img: "./img/crater2.png",
            },
        ],
    },
    {
        id: 5,
        title: "Hippie",
        price: 99,
        colors: [
            {
                code: "gray",
                img: "./img/hippie.png",
            },
            {
                code: "black",
                img: "./img/hippie2.png",
            },
        ],
    },
];

let choosenProduct = products[0];

const currentProductImg = document.querySelector(".productImg");
const currentProductTitle = document.querySelector(".productTitle");
const currentProductPrice = document.querySelector(".productPrice");
const currentProductColors = document.querySelectorAll(".color");
const currentProductSizes = document.querySelectorAll(".size");

menuItems.forEach((item, index) => {
    item.addEventListener("click", () => {
        //change the current slide
        wrapper.style.transform = `translateX(${-100 * index}vw)`;

        //change the choosen product
        choosenProduct = products[index];

        //change texts of currentProduct
        currentProductTitle.textContent = choosenProduct.title;
        currentProductPrice.textContent = "$" + choosenProduct.price;
        currentProductImg.src = choosenProduct.colors[0].img;

        //assing new colors
        currentProductColors.forEach((color, index) => {
            color.style.backgroundColor = choosenProduct.colors[index].code;
        });
    });
});

currentProductColors.forEach((color, index) => {
    color.addEventListener("click", () => {
        currentProductImg.src = choosenProduct.colors[index].img;
    });
});

currentProductSizes.forEach((size, index) => {
    size.addEventListener("click", () => {
        currentProductSizes.forEach((size) => {
            size.style.backgroundColor = "white";
            size.style.color = "black";
        });
        size.style.backgroundColor = "black";
        size.style.color = "white";
    });
});

const productButton = document.getElementById("add-to-cart-btn");
const payment = document.querySelector(".payment");
const close = document.querySelector(".close");

productButton.addEventListener("click", addToCart);

close.addEventListener("click", () => {
    payment.style.display = "none";
});
// ---- Checkout behaviour: validation + processing + success ----
const payButton = document.querySelector(".payButton");
const payInputs = Array.from(document.querySelectorAll(".payInput"));
const productContainer = document.querySelector(".payment"); // the white box
// create and append success node (hidden)
const successNode = document.createElement("div");
successNode.className = "order-success";
successNode.innerHTML = `
    <div style="font-size:36px; color:#369e62; margin-bottom:8px;">✔</div>
    <div style="font-weight:700; margin-bottom:6px;">Payment Successful!</div>
    <div id="order-message" style="color:gray; font-size:14px;">Thank you — your payment was successful.</div>
    <div id="order-id" style="color:#333; font-size:13px; margin-top:6px;"></div>
    <button id="closeSuccess" style="margin-top:12px; padding:8px 12px; cursor:pointer;">OK</button>
`;
document.body.appendChild(successNode);

function validateInputs() {
    // basic validation: non-empty fields; card number length >=12; mm, yyyy, cvv numeric
    let valid = true;
    // clear previous invalid marks
    payInputs.forEach(i => i.classList.remove("invalid"));
    // check name, phone, address, card number
    const name = document.querySelector('input[placeholder="John Doe"]');
    const phone = document.querySelector('input[placeholder="+1 234 5678"]');
    const address = document.querySelector('input[placeholder="Elton St 21 22-145"]');
    const card = document.querySelector('input[placeholder="Card Number"]');
    const mm = document.querySelector('input[placeholder="mm"]');
    const yyyy = document.querySelector('input[placeholder="yyyy"]');
    const cvv = document.querySelector('input[placeholder="cvv"]');

    if (!name || !name.value.trim()) { name && name.classList.add("invalid"); valid = false; }
    if (!phone || !phone.value.trim()) { phone && phone.classList.add("invalid"); valid = false; }
    if (!address || !address.value.trim()) { address && address.classList.add("invalid"); valid = false; }
    if (!card || card.value.replace(/\s/g, '').length < 12) { card && card.classList.add("invalid"); valid = false; }
    if (!mm || !/^\d{1,2}$/.test(mm.value)) { mm && mm.classList.add("invalid"); valid = false; }
    if (!yyyy || !/^\d{4}$/.test(yyyy.value)) { yyyy && yyyy.classList.add("invalid"); valid = false; }
    if (!cvv || !/^\d{3,4}$/.test(cvv.value)) { cvv && cvv.classList.add("invalid"); valid = false; }

    // ensure a size is selected
    const selectedSize = Array.from(document.querySelectorAll(".size")).some(s => s.style.backgroundColor === "black");
    if (!selectedSize) {
        // flash sizes
        document.querySelectorAll(".size").forEach(s => s.classList.add("invalid"));
        setTimeout(() => document.querySelectorAll(".size").forEach(s => s.classList.remove("invalid")), 900);
        valid = false;
    }

    return valid;
}

function showProcessing() {
    payButton.classList.add("processing");
    payButton.disabled = true;
    // append spinner markup if not present
    if (!payButton.querySelector(".spinner")) {
        const spinner = document.createElement("span");
        spinner.className = "spinner";
        payButton.appendChild(spinner);
    }
    // set label and keep spinner inside the button
    payButton.textContent = "Processing";
    const sp = payButton.querySelector('.spinner');
    if (sp) payButton.appendChild(sp);
}

function hideProcessing() {
    payButton.classList.remove("processing");
    payButton.disabled = false;
    // remove spinner
    const sp = payButton.querySelector(".spinner");
    if (sp) sp.remove();
    payButton.textContent = "Checkout";
}

function showSuccess(order) {
    // display order info if present
    try {
        const idEl = successNode.querySelector('#order-id');
        const msgEl = successNode.querySelector('#order-message');
        if (order) {
            idEl.textContent = `Order ID: ${order._id || order.id || ''} — Total: $${(order.totalPrice || order.price || 0).toFixed ? (order.totalPrice || order.price).toFixed(2) : (order.totalPrice || order.price)}`;
            msgEl.textContent = 'We received your payment and your order is being processed.';
        } else {
            idEl.textContent = '';
            msgEl.textContent = 'We received your payment and your order is being processed.';
        }
    } catch (err) {
        // ignore
    }
    successNode.classList.add("show");
    // hide payment box
    productContainer.style.display = "none";

    // clear cart and update UI
    cart = [];
    saveCart();
}

// click handler - use form submission
const checkoutForm = document.getElementById('checkout-form');
checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    productContainer.classList.remove("error");

    // Get form values
    const formData = new FormData(checkoutForm);
    const name = formData.get('name')?.trim();
    const phone = formData.get('phone')?.trim();
    const address = formData.get('address')?.trim();

    // Basic validation
    if (!name || !phone || !address) {
        productContainer.classList.add("error");
        setTimeout(() => productContainer.classList.remove("error"), 500);
        alert('Please fill in all fields');
        return;
    }

    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }

    showProcessing();

    // Create order payload
    const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
    const orderPayload = {
        name,
        phone,
        address,
        items: cart,
        totalPrice: cartTotal,
        cartCount: cart.length
    };

    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.error || 'Failed to place order');
        }

        hideProcessing();
        showSuccess(data.order || data);
    } catch (err) {
        console.error('Order error:', err);
        hideProcessing();
        // Show offline-friendly success popup even if backend is down
        const offlineOrder = {
            _id: 'LOCAL-' + Date.now(),
            totalPrice: orderPayload.totalPrice || 0,
            offline: true
        };
        showSuccess(offlineOrder);
    }
});

// close success handler
document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "closeSuccess") {
        successNode.classList.remove("show");
        // clear cart after successful order
        cart = [];
        saveCart();
        // reset form and show payment again so user can try new order
        payInputs.forEach(i => i.value = "");
        // keep payment hidden by default after success; user can re-open via cart
        productContainer.style.display = "none";
    }
});

// Initialize cart UI on page load
updateCartUI();
