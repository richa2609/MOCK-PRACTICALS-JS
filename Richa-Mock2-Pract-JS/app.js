let items = [];

let editIndex = -1;


function saveToLocalStorage() {
    localStorage.setItem("inventoryItems", JSON.stringify(items));
}


function loadData() {

    let storedData = localStorage.getItem("inventoryItems");

    try {

        if (storedData) {

            let data = JSON.parse(storedData);

            if (
                Array.isArray(data) &&
                data.length > 0 &&
                data.every(function(item) {
                    return (
                        item.name !== undefined &&
                        item.quantity !== undefined &&
                        item.price !== undefined
                    );
                })
            ) {

                items = data;

                return;
            }
        }

    } catch (error) {

        console.log("Old data removed.");

    }


    items = [
        {
            name: "Notebooks",
            category: "Stationery",
            quantity: 40,
            price: 1200
        },
        {
            name: "Ball Pens",
            category: "Stationery",
            quantity: 6,
            price: 300
        },
        {
            name: "Cables",
            category: "Electronics",
            quantity: 25,
            price: 4500
        },
        {
            name: "Whiteboards",
            category: "Office",
            quantity: 2,
            price: 8000
        }
    ];

    saveToLocalStorage();
}


function showPage(pageName, clickedMenu) {

    let pages = document.querySelectorAll(".page");

    pages.forEach(function(page) {
        page.classList.add("hide");
    });

    let page = document.getElementById(pageName);

    if (page) {
        page.classList.remove("hide");
    }


    let menus = document.querySelectorAll(".menu");

    menus.forEach(function(menu) {
        menu.classList.remove("active");
    });

    if (clickedMenu) {
        clickedMenu.classList.add("active");
    }


    updateSummary();

    displayDashboardItems();

    if (pageName === "items") {
        displayItems();
    }

    if (pageName === "reports") {
        generateReport();
    }
}


function updateSummary() {

    let total = 0;

    let value = 0;

    let low = 0;


    items.forEach(function(item) {

        total =
            total + Number(item.quantity);

        value =
            value +
            Number(item.quantity) *
            Number(item.price);

        if (Number(item.quantity) <= 10) {
            low++;
        }

    });


    let totalItems =
        document.getElementById("totalItems");

    let stockValue =
        document.getElementById("stockValue");

    let lowStock =
        document.getElementById("lowStock");


    if (totalItems) {
        totalItems.innerText = total;
    }

    if (stockValue) {
        stockValue.innerText =
            "₹" + value.toLocaleString("en-IN");
    }

    if (lowStock) {
        lowStock.innerText =
            low + " items";
    }
}


function createItemHTML(item, index) {

    let status =
        Number(item.quantity) <= 10
            ? "Low Stock"
            : "In Stock";


    let statusClass =
        Number(item.quantity) <= 10
            ? "low-stock"
            : "in-stock";


    return `

        <div class="item">

            <div class="item-info">

                <h3>${item.name}</h3>

                <p>
                    Quantity: ${item.quantity}
                </p>

                <p class="item-category">
                    Category: ${item.category}
                </p>

                <span class="status ${statusClass}">
                    ${status}
                </span>

            </div>


            <div class="price">
                ₹${Number(item.price).toLocaleString("en-IN")}
            </div>


            <div class="actions">

                <button
                    class="edit"
                    onclick="editItem(${index})">
                    Edit
                </button>

                <button
                    class="delete"
                    onclick="deleteItem(${index})">
                    Delete
                </button>

            </div>

        </div>

    `;
}


function displayItems() {

    let list =
        document.getElementById("itemsList");


    if (!list) {

        console.log("itemsList not found in HTML");

        return;
    }


    let searchInput =
        document.getElementById("searchInput");

    let filterSelect =
        document.getElementById("filterSelect");

    let sortSelect =
        document.getElementById("sortSelect");


    let search =
        searchInput
            ? searchInput.value.toLowerCase()
            : "";


    let filter =
        filterSelect
            ? filterSelect.value
            : "all";


    let sort =
        sortSelect
            ? sortSelect.value
            : "name";


    let newItems =
        items.filter(function(item) {

            return (
                item.name
                    .toLowerCase()
                    .includes(search)
                ||
                item.category
                    .toLowerCase()
                    .includes(search)
            );

        });


    if (filter === "stock") {

        newItems =
            newItems.filter(function(item) {

                return Number(item.quantity) > 10;

            });

    }


    if (filter === "low") {

        newItems =
            newItems.filter(function(item) {

                return Number(item.quantity) <= 10;

            });

    }


    if (sort === "name") {

        newItems.sort(function(a, b) {

            return a.name.localeCompare(b.name);

        });

    }


    if (sort === "quantity") {

        newItems.sort(function(a, b) {

            return Number(a.quantity) -
                Number(b.quantity);

        });

    }


    if (sort === "price") {

        newItems.sort(function(a, b) {

            return Number(a.price) -
                Number(b.price);

        });

    }


    list.innerHTML = "";


    if (newItems.length === 0) {

        list.innerHTML =
            "<p class='no-items'>No items found.</p>";

        return;
    }


    newItems.forEach(function(item) {

        let index =
            items.indexOf(item);


        list.innerHTML +=
            createItemHTML(item, index);

    });

}


function displayDashboardItems() {

    let container =
        document.getElementById("dashboardItems");


    if (!container) {
        return;
    }


    container.innerHTML = "";


    items.forEach(function(item) {

        let index =
            items.indexOf(item);


        container.innerHTML +=
            createItemHTML(item, index);

    });

}


function searchItems() {
    displayItems();
}


function openForm() {

    editIndex = -1;


    document.getElementById("formTitle").innerText =
        "Add New Item";


    document.getElementById("itemName").value = "";

    document.getElementById("itemCategory").value = "";

    document.getElementById("itemQuantity").value = "";

    document.getElementById("itemPrice").value = "";


    document.getElementById("formBox").style.display =
        "flex";

}


function closeForm() {

    document.getElementById("formBox").style.display =
        "none";

}


function saveItem() {

    let name =
        document.getElementById("itemName")
            .value.trim();


    let category =
        document.getElementById("itemCategory")
            .value.trim();


    let quantity =
        Number(
            document.getElementById("itemQuantity")
                .value
        );


    let price =
        Number(
            document.getElementById("itemPrice")
                .value
        );


    if (
        name === "" ||
        category === "" ||
        isNaN(quantity) ||
        isNaN(price)
    ) {

        alert("Please fill all fields.");

        return;
    }


    if (quantity < 0 || price < 0) {

        alert(
            "Quantity and price cannot be negative."
        );

        return;
    }


    let newItem = {

        name: name,

        category: category,

        quantity: quantity,

        price: price

    };


    if (editIndex === -1) {

        items.push(newItem);

        alert("Item added successfully.");

    } else {

        items[editIndex] = newItem;

        alert("Item updated successfully.");

    }


    saveToLocalStorage();

    closeForm();

    displayItems();

    displayDashboardItems();

    updateSummary();

}


function editItem(index) {

    let item =
        items[index];


    if (!item) {
        return;
    }


    editIndex = index;


    document.getElementById("formTitle").innerText =
        "Edit Item";


    document.getElementById("itemName").value =
        item.name;


    document.getElementById("itemCategory").value =
        item.category;


    document.getElementById("itemQuantity").value =
        item.quantity;


    document.getElementById("itemPrice").value =
        item.price;


    document.getElementById("formBox").style.display =
        "flex";

}


function deleteItem(index) {

    let answer =
        confirm(
            "Are you sure you want to delete this item?"
        );


    if (!answer) {
        return;
    }


    items.splice(index, 1);

    saveToLocalStorage();

    displayItems();

    displayDashboardItems();

    updateSummary();

}


function generateReport() {

    let report =
        document.getElementById("reportContent");


    if (!report) {
        return;
    }


    let total = 0;

    let value = 0;

    let low = 0;


    items.forEach(function(item) {

        total +=
            Number(item.quantity);

        value +=
            Number(item.quantity) *
            Number(item.price);

        if (Number(item.quantity) <= 10) {
            low++;
        }

    });


    report.innerHTML = `

        <h3>Inventory Report</h3>

        <div class="report-row">
            <span>Total Products</span>
            <strong>${items.length}</strong>
        </div>

        <div class="report-row">
            <span>Total Quantity</span>
            <strong>${total}</strong>
        </div>

        <div class="report-row">
            <span>Total Stock Value</span>
            <strong>
                ₹${value.toLocaleString("en-IN")}
            </strong>
        </div>

        <div class="report-row">
            <span>Low Stock Items</span>
            <strong>${low}</strong>
        </div>

    `;

}


function exportData() {

    let data =
        JSON.stringify(items, null, 2);


    let blob =
        new Blob(
            [data],
            {
                type: "application/json"
            }
        );


    let url =
        URL.createObjectURL(blob);


    let link =
        document.createElement("a");


    link.href = url;

    link.download =
        "inventory-data.json";


    link.click();


    URL.revokeObjectURL(url);

}


function importData(event) {

    let file =
        event.target.files[0];


    if (!file) {
        return;
    }


    let reader =
        new FileReader();


    reader.onload = function(e) {

        try {

            let data =
                JSON.parse(e.target.result);


            if (!Array.isArray(data)) {

                alert("Invalid JSON file.");

                return;
            }


            items = data;

            saveToLocalStorage();

            displayItems();

            displayDashboardItems();

            updateSummary();

            alert("Data imported successfully.");

        } catch(error) {

            alert("Invalid JSON file.");

        }

    };
    reader.readAsText(file);
}
function resetData() {

    let answer =
        confirm(
            "Reset inventory to default data?"
        );


    if (!answer) {
        return;
    }


    localStorage.removeItem(
        "inventoryItems"
    );


    loadData();

    displayItems();

    displayDashboardItems();

    updateSummary();

    alert("Inventory has been reset.");

}


loadData();

updateSummary();

displayDashboardItems();

displayItems();