// ==========================================
// SUPABASE CONNECTION
// ==========================================

const SUPABASE_URL =
    "https://tohphrujrnfmffkpvyuu.supabase.co";

// Use the SAME publishable key you used in script.js.
// Do NOT use the sb_secret_ key.
const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_iQ0yLcTBwlyepEz1R1zJ6A_mGKjMhjt";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ==========================================
// LOAD ORDERS
// ==========================================

async function loadOrders() {

    const ordersContainer =
        document.getElementById("orders-container");

    ordersContainer.innerHTML =
        "<p>Loading orders...</p>";


    const { data: orders, error } =
        await supabaseClient
            .from("Orders")
            .select("*")
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(
            "Error loading orders:",
            error
        );

        ordersContainer.innerHTML =
            "<p>Unable to load orders.</p>";

        return;
    }


    displayOrders(orders);
}


// ==========================================
// DISPLAY ORDERS
// ==========================================

function displayOrders(orders) {

    const ordersContainer =
        document.getElementById("orders-container");

    const orderCount =
        document.getElementById("order-count");


    ordersContainer.innerHTML = "";


    if (!orders || orders.length === 0) {

        ordersContainer.innerHTML = `
            <div class="order-card">
                <h3>No orders yet</h3>
                <p>New customer orders will appear here.</p>
            </div>
        `;

        orderCount.textContent = "0";

        return;
    }


    // Count orders that are not Ready
    const activeOrders =
        orders.filter(
            order => order.status !== "Ready"
        );

    orderCount.textContent =
        activeOrders.length;


    orders.forEach(order => {

        const orderCard =
            document.createElement("div");

        orderCard.className = "order-card";

        orderCard.dataset.orderId =
            order.id;


        // ------------------------------------------
        // ITEMS
        // ------------------------------------------

        let itemsHTML = "";

        if (Array.isArray(order.items)) {

            order.items.forEach(item => {

                const itemTotal =
                    item.price * item.quantity;

                itemsHTML += `
                    <div class="order-item">
                        <span>
                            ${item.name} × ${item.quantity}
                        </span>

                        <strong>
                            ₹${itemTotal}
                        </strong>
                    </div>
                `;
            });

        }


        // ------------------------------------------
        // STATUS
        // ------------------------------------------

        const status =
            order.status || "New";


        // ------------------------------------------
        // SPECIAL INSTRUCTIONS
        // ------------------------------------------

        let specialHTML = "";

        if (order.special_instructions) {

            specialHTML = `
                <div class="special-note">
                    <strong>
                        Special Instructions:
                    </strong>

                    ${order.special_instructions}
                </div>
            `;
        }


        // ------------------------------------------
        // BUTTONS
        // ------------------------------------------

        let buttonsHTML = "";


        if (status === "New") {

            buttonsHTML = `
                <button
                    class="accept-btn"
                    onclick="updateStatus(
                        ${order.id},
                        'Preparing'
                    )">
                    Accept
                </button>

                <button
                    class="complete-btn"
                    onclick="updateStatus(
                        ${order.id},
                        'Ready'
                    )">
                    Mark Ready
                </button>
            `;

        } else if (status === "Preparing") {

            buttonsHTML = `
                <button
                    class="accept-btn"
                    disabled>
                    Preparing
                </button>

                <button
                    class="complete-btn"
                    onclick="updateStatus(
                        ${order.id},
                        'Ready'
                    )">
                    Mark Ready
                </button>
            `;

        } else {

            buttonsHTML = `
                <button
                    class="complete-btn"
                    disabled>
                    Ready
                </button>
            `;
        }


        // ------------------------------------------
        // CREATE CARD
        // ------------------------------------------

        orderCard.innerHTML = `

            <div class="order-top">

                <div>

                    <span class="order-number">
                        Order #${order.id}
                    </span>

                    <h3>
                        Table ${order.table_number}
                    </h3>

                </div>

                <span
                    class="order-status ${status.toLowerCase()}">

                    ${status.toUpperCase()}

                </span>

            </div>


            <div class="customer-info">

                <strong>Customer:</strong>

                ${order.customer_name}

            </div>


            <div class="order-items">

                ${itemsHTML}

            </div>


            ${specialHTML}


            <div class="order-bottom">

                <strong class="total">

                    Total: ₹${order.total}

                </strong>


                <div class="order-actions">

                    ${buttonsHTML}

                </div>

            </div>
        `;


        ordersContainer.appendChild(orderCard);
    });
}


// ==========================================
// UPDATE ORDER STATUS
// ==========================================

async function updateStatus(orderId, newStatus) {

    const { error } =
        await supabaseClient
            .from("Orders")
            .update({
                status: newStatus
            })
            .eq("id", orderId);


    if (error) {

        console.error(
            "Error updating order:",
            error
        );

        alert(
            "Could not update the order status."
        );

        return;
    }


    // Reload orders from Supabase
    loadOrders();
}


// ==========================================
// INITIAL LOAD
// ==========================================

loadOrders();