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
  <div style="font-weight:700; margin-bottom:6px;">Order Placed!</div>
  <div style="color:gray; font-size:14px;">We received your order and it's being processed.</div>
  <button id="closeSuccess" style="margin-top:12px; padding:8px 12px; cursor:pointer;">Close</button>
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
    payButton.textContent = "Processing";
    payButton.appendChild(document.querySelector(".spinner"));
}

function hideProcessing() {
    payButton.classList.remove("processing");
    payButton.disabled = false;
    // remove spinner
    const sp = payButton.querySelector(".spinner");
    if (sp) sp.remove();
    payButton.textContent = "Checkout!";
}

function showSuccess() {
    successNode.classList.add("show");
    // optionally hide payment box
    productContainer.style.display = "none";
}

// click handler
payButton.addEventListener("click", async (e) => {
    e.preventDefault();
    productContainer.classList.remove("error");

    if (!validateInputs()) {
        productContainer.classList.add("error");
        setTimeout(() => productContainer.classList.remove("error"), 500);
        return;
    }

    showProcessing();

    // collect order info from form and current product
    const name = document.querySelector('input[placeholder="John Doe"]')?.value.trim();
    const phone = document.querySelector('input[placeholder="+1 234 5678"]')?.value.trim();
    const address = document.querySelector('input[placeholder="Elton St 21 22-145"]')?.value.trim();

    // Create order for each cart item
    const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

    const orderPayload = {
        name,
        phone,
        address,
        items: cart,  // send all cart items
        totalPrice: cartTotal,
        cartCount: cart.length
    };

    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to place order');
        }

        hideProcessing();
        showSuccess();
    } catch (err) {
        console.error('Order error:', err);
        hideProcessing();
        // show a simple message to the user
        alert('There was an error placing your order. Please try again later.');
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
        productContainer.style.display = "none";
    }
});

// Initialize cart UI on page load
updateCartUI();
