// ==========================================
// SUPABASE CONNECTION
// ==========================================

const SUPABASE_URL =
    "https://tohphrujrnfmffkpvyuu.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_iQ0yLcTBwlyepEz1R1zJ6A_mGKjMhjt";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ==========================================
// SHOPPING CART
// ==========================================

let cart = [];


// ==========================================
// ADD ITEM TO CART
// ==========================================

function addToCart(itemName, price) {

    const existingItem = cart.find(
        item => item.name === itemName
    );

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: itemName,
            price: price,
            quantity: 1
        });
    }

    updateCart();

    document.getElementById("order").scrollIntoView({
        behavior: "smooth"
    });
}


// ==========================================
// INCREASE QUANTITY
// ==========================================

function increaseQuantity(itemName) {

    const item = cart.find(
        item => item.name === itemName
    );

    if (item) {
        item.quantity += 1;
    }

    updateCart();
}


// ==========================================
// DECREASE QUANTITY
// ==========================================

function decreaseQuantity(itemName) {

    const item = cart.find(
        item => item.name === itemName
    );

    if (!item) {
        return;
    }

    item.quantity -= 1;

    if (item.quantity <= 0) {
        cart = cart.filter(
            item => item.name !== itemName
        );
    }

    updateCart();
}


// ==========================================
// REMOVE ITEM
// ==========================================

function removeItem(itemName) {

    cart = cart.filter(
        item => item.name !== itemName
    );

    updateCart();
}


// ==========================================
// UPDATE CART
// ==========================================

function updateCart() {

    const cartItems =
        document.getElementById("cart-items");

    const cartTotal =
        document.getElementById("cart-total");

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartItems.innerHTML =
            '<p class="empty-cart">Your cart is empty.</p>';

        cartTotal.textContent = "0";

        return;
    }

    let total = 0;

    cart.forEach(item => {

        const itemTotal =
            item.price * item.quantity;

        total += itemTotal;

        const itemElement =
            document.createElement("div");

        itemElement.className = "cart-item";

        itemElement.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <p>₹${item.price} each</p>
            </div>

            <div class="quantity-controls">

                <button
                    onclick="decreaseQuantity('${item.name}')">
                    −
                </button>

                <span>${item.quantity}</span>

                <button
                    onclick="increaseQuantity('${item.name}')">
                    +
                </button>

            </div>

            <strong>₹${itemTotal}</strong>

            <button
                class="remove-btn"
                onclick="removeItem('${item.name}')">
                Remove
            </button>
        `;

        cartItems.appendChild(itemElement);
    });

    cartTotal.textContent = total;
}


// ==========================================
// PLACE ORDER
// ==========================================

async function placeOrder() {

    if (cart.length === 0) {

        alert(
            "Please add something to your order first."
        );

        return;
    }

    const tableNumber =
        document.getElementById("table-number").value.trim();

    const customerName =
        document.getElementById("customer-name").value.trim();

    const specialInstructions =
        document.getElementById("special-instructions").value.trim();


    if (tableNumber === "") {

        alert("Please enter your table number.");

        return;
    }


    if (customerName === "") {

        alert("Please enter your name.");

        return;
    }


    let total = 0;

    cart.forEach(item => {

        total +=
            item.price * item.quantity;

    });


    // ==========================================
    // SAVE ORDER TO SUPABASE
    // ==========================================

    const { error } = await supabaseClient
        .from("Orders")
        .insert([
            {
                customer_name: customerName,
                table_number: tableNumber,
                items: cart,
                total: total,
                special_instructions: specialInstructions,
                status: "New"
            }
        ]);


    if (error) {

        console.error(
            "Supabase order error:",
            error
        );

        alert(
            "Sorry, your order could not be placed.\n\n" +
            "Please try again."
        );

        return;
    }


    // ==========================================
    // CUSTOM ORDER SUCCESS POPUP
    // ==========================================

    const popup =
        document.getElementById("order-popup");

    const popupMessage =
        document.getElementById("order-popup-message");

    popupMessage.innerHTML =
        "<strong>Thank you, " +
        customerName +
        "!</strong><br><br>" +
        "Table: " +
        tableNumber +
        "<br>" +
        "Total: ₹" +
        total +
        "<br><br>" +
        "Payment: Pay at cashier";

    popup.classList.add("show");


    // ==========================================
    // CLEAR CART
    // ==========================================

    cart = [];

    updateCart();


    // ==========================================
    // CLEAR CUSTOMER DETAILS
    // ==========================================

    document.getElementById("table-number").value = "";

    document.getElementById("customer-name").value = "";

    document.getElementById("special-instructions").value = "";
}


// ==========================================
// CLOSE ORDER POPUP
// ==========================================

function closeOrderPopup() {

    const popup =
        document.getElementById("order-popup");

    popup.classList.remove("show");
}
