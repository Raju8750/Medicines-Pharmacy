const medicineTableBody = document.getElementById("medicineTableBody");
const salesTableBody = document.getElementById("salesTableBody");
const searchInput = document.getElementById("searchInput");
const message = document.getElementById("message");
const addPanel = document.getElementById("addMedicinePanel");
const medicineForm = document.getElementById("medicineForm");


//Search Functionality strat
const searchSuggestions = document.getElementById("searchSuggestions");

searchInput.addEventListener("input", async function () {

    const searchText = this.value.trim();

    if (searchText.length < 3) {
        searchSuggestions.innerHTML = "";
        searchSuggestions.style.display = "none";
        return;
    }

    try {
        const response = await fetch(
            `/api/medicines?search=${encodeURIComponent(searchText)}`
        );

        const medicines = await response.json();

        if (medicines.length === 0) {
            searchSuggestions.innerHTML =
                `<div class="no-result">No medicine found</div>`;
        }
        else {
            searchSuggestions.innerHTML = medicines.map(medicine =>
                `<div class="suggestion-item"
                      data-name="${medicine.fullName}">
                    ${medicine.fullName}
                </div>`
            ).join("");
        }

        searchSuggestions.style.display = "block";

    } catch (error) {
        console.error(error);
    }
});

//Search Functionality end




document.getElementById("openAddBtn").addEventListener("click", () => {
    addPanel.classList.remove("hidden");
});

function closeAddPanel() {
    addPanel.classList.add("hidden");
    medicineForm.reset();
}

document.getElementById("closeAddBtn").addEventListener("click", closeAddPanel);
document.getElementById("cancelAddBtn").addEventListener("click", closeAddPanel);

document.getElementById("searchBtn").addEventListener("click", loadMedicines);
document.getElementById("clearSearchBtn").addEventListener("click", () => {
    searchInput.value = "";
    loadMedicines();
});

searchInput.addEventListener("keyup", e => {
    if (e.key === "Enter") loadMedicines();
});

document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".nav-btn").forEach(x => x.classList.remove("active"));
        btn.classList.add("active");

        document.querySelectorAll(".section").forEach(x => x.classList.add("hidden"));
        document.getElementById(btn.dataset.target).classList.remove("hidden");

        if (btn.dataset.target === "salesSection") loadSales();
        else loadMedicines();
    });
});

medicineForm.addEventListener("submit", async event => {
    event.preventDefault();

    const formData = new FormData(medicineForm);

    const medicine = {
        fullName: formData.get("fullName"),
        notes: formData.get("notes"),
        expiryDate: formData.get("expiryDate"),
        quantity: Number(formData.get("quantity")),
        price: Number(formData.get("price")),
        brand: formData.get("brand")
    };

    try {
        const response = await fetch("/api/medicines", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(medicine)
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        closeAddPanel();
        showMessage("Medicine added successfully.", "success");
        await loadMedicines();
    } catch (error) {
        showMessage(error.message, "error");
    }
});

async function loadMedicines() {
    try {
        const search = encodeURIComponent(searchInput.value.trim());
        const response = await fetch(`/api/medicines?search=${search}`);

        if (!response.ok) throw new Error("Unable to load medicines.");

        const medicines = await response.json();

        medicineTableBody.innerHTML = "";

        if (medicines.length === 0) {
            medicineTableBody.innerHTML =
                `<tr><td colspan="6">No medicines found.</td></tr>`;
            return;
        }

        medicines.forEach(medicine => {
            const row = document.createElement("tr");

            const expiry = new Date(medicine.expiryDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const daysToExpiry = Math.ceil(
                (expiry - today) / (1000 * 60 * 60 * 24)
            );

            if (daysToExpiry < 30) {
                row.classList.add("expiring");
            } else if (medicine.quantity < 10) {
                row.classList.add("low-stock");
            }

            row.innerHTML = `
                <td>${escapeHtml(medicine.fullName)}</td>
                <td>${escapeHtml(medicine.brand)}</td>
                <td>${formatDate(medicine.expiryDate)}</td>
                <td>${medicine.quantity}</td>
                <td>${Number(medicine.price).toFixed(2)}</td>
                <td>
                    <button class="sell-btn"
                            onclick="sellMedicine(${medicine.id}, '${escapeJs(medicine.fullName)}', ${medicine.quantity})">
                        Sell
                    </button>
                </td>
            `;

            medicineTableBody.appendChild(row);
        });
    } catch (error) {
        showMessage(error.message, "error");
    }
}

async function sellMedicine(id, name, availableQuantity) {
    const input = prompt(
        `Medicine: ${name}\nAvailable stock: ${availableQuantity}\nEnter quantity sold:`
    );

    if (input === null) return;

    const quantity = Number(input);

    if (!Number.isInteger(quantity) || quantity <= 0) {
        showMessage("Enter a valid whole-number sale quantity.", "error");
        return;
    }

    try {
        const response = await fetch(`/api/medicines/${id}/sell`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity })
        });

        if (!response.ok) throw new Error(await response.text());

        const sale = await response.json();

        showMessage(
            `Sale recorded. Total amount: ${Number(sale.totalAmount).toFixed(2)}`,
            "success"
        );

        await loadMedicines();
    } catch (error) {
        showMessage(error.message, "error");
    }
}

async function loadSales() {
    try {
        const response = await fetch("/api/sales");
        if (!response.ok) throw new Error("Unable to load sales.");

        const sales = await response.json();
        salesTableBody.innerHTML = "";

        if (sales.length === 0) {
            salesTableBody.innerHTML =
                `<tr><td colspan="5">No sales recorded.</td></tr>`;
            return;
        }

        sales.forEach(sale => {
            salesTableBody.innerHTML += `
                <tr>
                    <td>${new Date(sale.saleDate).toLocaleString()}</td>
                    <td>${escapeHtml(sale.medicineName)}</td>
                    <td>${sale.quantitySold}</td>
                    <td>${Number(sale.unitPrice).toFixed(2)}</td>
                    <td>${Number(sale.totalAmount).toFixed(2)}</td>
                </tr>
            `;
        });
    } catch (error) {
        showMessage(error.message, "error");
    }
}

function formatDate(value) {
    return new Date(value).toLocaleDateString();
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeJs(value) {
    return String(value).replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;

    setTimeout(() => {
        message.textContent = "";
        message.className = "message";
    }, 4000);
}

loadMedicines();
