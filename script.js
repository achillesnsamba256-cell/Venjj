// ===== Constants =====
const ADMIN_USER = "Achilles";
const ADMIN_PASS = "NSA2002mba";
const CART_KEY = "checkoutCart";
const PRODUCTS_KEY = "productsStorage";
const ORDERS_KEY = "orders";

// ===== State =====
let isAdmin = false;
let cartItems = JSON.parse(localStorage.getItem(CART_KEY)) || [];
let products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
let orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];

// ===== DOM Elements =====
const productGrid = document.getElementById("product-grid");
const cartCountElem = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalElem = document.getElementById("cart-total");
const cartModal = document.getElementById("cartModal");
const adminContent = document.getElementById("adminContent");
const addProductForm = document.getElementById("addProductForm");
const dashboardLink = document.getElementById("adminDashboardLink");

// ===== Initialization =====
document.addEventListener("DOMContentLoaded", () => {
    const adminLoggedIn = sessionStorage.getItem("isAdminLoggedIn") === "true";
    if (adminLoggedIn) activateAdmin();

    const toggleBtn = document.getElementById("adminToggleBtn");
    toggleBtn?.addEventListener("click", () => {
        adminContent.style.display = adminContent.style.display === "block" ? "none" : "block";
    });

    renderProducts();
    updateCartDisplay();
});

// ===== Render Products =====
function renderProducts(category = null) {
    productGrid.innerHTML = "";
    const filtered = category ? products.filter(p => p.category === category) : products;
    filtered.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>UGX ${item.price.toLocaleString()}</p>
            <button onclick="addToCart(${index})">Add to Cart</button>
        `;
        if (isAdmin) {
            const adminDiv = document.createElement("div");
            adminDiv.style.marginTop = "10px";
            adminDiv.innerHTML = `
                <input type="text" value="${item.name}" id="editName${index}" placeholder="Product Name">
                <input type="number" value="${item.price}" id="editPrice${index}" placeholder="Price UGX">
                <input type="file" id="editImgFile${index}" accept="image/*">
                <button onclick="editProduct(${index})">Save</button>
                <button onclick="removeProduct(${index})">Remove</button>
            `;
            card.appendChild(adminDiv);
        }
        productGrid.appendChild(card);
    });
    updateCartDisplay();
}

// ===== Cart Functions =====
function addToCart(index) {
    cartItems.push({...products[index]});
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    updateCartDisplay();
}

function updateCartDisplay() {
    cartCountElem.textContent = cartItems.length;
    cartItemsContainer.innerHTML = "";
    let total = 0;
    cartItems.forEach((item, idx) => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `<span>${item.name}</span><span>UGX ${item.price.toLocaleString()}</span><button onclick="removeFromCart(${idx})">X</button>`;
        cartItemsContainer.appendChild(div);
        total += Number(item.price);
    });
    cartTotalElem.textContent = total.toLocaleString();
}

function removeFromCart(idx) {
    cartItems.splice(idx, 1);
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    updateCartDisplay();
}

function openCart() { cartModal.style.display = "block"; }
function closeCart() { cartModal.style.display = "none"; }

// ===== Checkout =====
function goToCheckout() {
    if(cartItems.length === 0){ alert("Your cart is empty!"); return; }
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    window.location.href = "checkout.html";
}

function placeOrder() {
    if(cartItems.length === 0){ alert("Your cart is empty!"); return; }
    const total = cartItems.reduce((sum,i)=>sum+i.price,0);
    const order = {
        id: Date.now(),
        customer: "Customer",
        items: cartItems.map(i=>i.name),
        total,
        status: "Pending"
    };
    orders.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

    let message = "Hello! I would like to place an order:\n";
    cartItems.forEach((item,idx)=> message += `${idx+1}. ${item.name} - UGX ${item.price.toLocaleString()}\n`);
    message += `Total: UGX ${total.toLocaleString()}`;
    window.open(`https://wa.me/256793880471?text=${encodeURIComponent(message)}`, "_blank");

    cartItems=[];
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    updateCartDisplay();
}

// ===== Search & Filter =====
function filterCategory(cat) { renderProducts(cat); document.getElementById("dropdownContent").style.display = "none"; }

function searchProducts() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    renderProducts();
    if(query){
        productGrid.innerHTML = "";
        const filtered = products.filter(p=>p.name.toLowerCase().includes(query));
        filtered.forEach((item, index)=>{
            const card = document.createElement("div");
            card.className="product-card";
            card.innerHTML=`<img src="${item.img}" alt="${item.name}"><h3>${item.name}</h3><p>UGX ${item.price.toLocaleString()}</p><button onclick="addToCart(${index})">Add to Cart</button>`;
            productGrid.appendChild(card);
        });
    }
}

// ===== Admin Functions =====
function loginAdmin() {
    const username=document.getElementById("adminUser").value;
    const password=document.getElementById("adminPass").value;
    if(username===ADMIN_USER && password===ADMIN_PASS){
        sessionStorage.setItem("isAdminLoggedIn","true");
        activateAdmin();
        alert("Admin logged in!");
    } else alert("Invalid credentials!");
}

function logoutAdmin(){
    sessionStorage.removeItem("isAdminLoggedIn");
    isAdmin=false;
    adminContent.style.display="block";
    addProductForm.style.display="none";
    dashboardLink.style.display="none";
    renderProducts();
}

function activateAdmin(){
    isAdmin=true;
    adminContent.style.display="none";
    addProductForm.style.display="block";
    dashboardLink.style.display="block";
    renderProducts();
}

function addProduct(){
    const name=document.getElementById("newName").value.trim();
    const price=parseInt(document.getElementById("newPrice").value);
    const category=document.getElementById("newCategory").value.trim().toLowerCase();
    const fileInput=document.getElementById("newImgFile");
    if(name && price && category && fileInput.files.length>0){
        const reader=new FileReader();
        reader.onload=e=>{
            products.push({name,price,img:e.target.result,category});
            localStorage.setItem(PRODUCTS_KEY,JSON.stringify(products));
            renderProducts();
            document.getElementById("newName").value="";
            document.getElementById("newPrice").value="";
            document.getElementById("newCategory").value="";
            fileInput.value="";
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else alert("Fill all fields and select an image");
}

function editProduct(index){
    const newName=document.getElementById(`editName${index}`).value.trim();
    const newPrice=parseInt(document.getElementById(`editPrice${index}`).value);
    const fileInput=document.getElementById(`editImgFile${index}`);
    if(newName && newPrice){
        if(fileInput.files.length>0){
            const reader=new FileReader();
            reader.onload=e=>{
                products[index]={...products[index],name:newName,price:newPrice,img:e.target.result};
                localStorage.setItem(PRODUCTS_KEY,JSON.stringify(products));
                renderProducts();
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            products[index]={...products[index],name:newName,price:newPrice};
            localStorage.setItem(PRODUCTS_KEY,JSON.stringify(products));
            renderProducts();
        }
    } else alert("Name and Price cannot be empty!");
}

function removeProduct(index){
    if(confirm("Are you sure you want to remove this product?")){
        products.splice(index,1);
        localStorage.setItem(PRODUCTS_KEY,JSON.stringify(products));
        renderProducts();
    }
}