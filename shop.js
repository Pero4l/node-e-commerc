const chalk = require("chalk");
const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const FILE_PATH = "./data.json";

// === Helpers ===
function readItems() {
  try {
    if (!fs.existsSync(FILE_PATH)) return { products: [], orders: [] };
    const data = fs.readFileSync(FILE_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading file:", err);
    return { products: [], orders: [] };
  }
}

function writeItems(data) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing file:", err);
  }
}

const featuredProducts = () => {
  const db = readItems(); // use helper
  const products = db.products;

  console.log(chalk.bold.bgCyan.black("\n FEATURED PRODUCTS \n"));

  console.log(
    chalk.bold.magenta("ID".padEnd(5)) +
    chalk.bold.blue("Name".padEnd(25)) +
    chalk.bold.blue("Price".padEnd(25)) +
    chalk.bold.yellow("Stock".padEnd(7)) +
    chalk.bold.green("Description\n")
  );

 
  const pageItems = products.slice(0, 10);

  pageItems.forEach((p) => {
    console.log(
      chalk.magenta(String(p.id).padEnd(5)) +
      chalk.blue(p.name.padEnd(25)) +
      chalk.red(p.price.padEnd(25)) +
      chalk.yellow(String(p.instock).padEnd(7)) +
      chalk.green(p.description)
    );
  });

  console.log("\n");
};


function seeNotifications() {
  const db = readItems();
  const user = db.users.find((u) => u.name === currentUser.name);

  if (!user || !user.notifications || user.notifications.length === 0) {
    console.log(chalk.yellow("\n🔔 No notifications found.\n"));
  } else {
    console.log(chalk.bold.bgMagenta.black("\n YOUR NOTIFICATIONS \n"));
    user.notifications.forEach((note, index) => {
      console.log(chalk.cyan(`#${index + 1}: `) + note);
    });
  }

  console.log("\n");
  shopMenu();
}



// === ADMIN MENU ====

// === 1. Add Product ===
function addProduct() {
  const db = readItems();
  const id = db.products.length + 1;

  rl.question("Enter product name: ", (name) => {
    if (!name.trim()) {
      console.log(chalk.red("Product name cannot be empty."));
      return adminMenu();
    }

    rl.question("Enter product description: ", (description) => {
      rl.question("Enter product stock: ", (instock) => {
        db.products.push({ id, name, description, instock });
        writeItems(db);
        console.log(chalk.green(`Product '${name}' added successfully!`));
        adminMenu();
      });
    });
  });
}

// === 2. See all Product ===

function seeAllProducts() {
  const db = readItems();

  if (db.products.length === 0) {
    console.log(chalk.yellow("⚠️ No products found."));
  } else {
    console.log(chalk.green("\n All Products:"));
    db.products.forEach((p, index) => {
      console.log(chalk.cyan(`\n#${index + 1}`));
      console.log(`ID: ${p.id}`);
      console.log(`Name: ${p.name}`);
      console.log(`Description: ${p.description}`);
      console.log(`Stock: ${p.instock}`);
    });
  }

  adminMenu();
}


// === 3. Edit a Product ===
function editProduct() {
  const db = readItems();
  rl.question("Enter product ID to edit: ", (id) => {
    const product = db.products.find((p) => p.id == id);
    if (!product) {
      console.log(chalk.red("❌ Product not found."));
      return adminMenu();
    }

    rl.question(`Enter new name (${product.name}): `, (name) => {
      rl.question(`Enter new description (${product.des}): `, (des) => {
        rl.question(`Enter new stock (${product.stock}): `, (stock) => {
          product.name = name || product.name;
          product.des = des || product.des;
          product.stock = stock || product.stock;
          writeItems(db);
          console.log(chalk.green("Product updated successfully!"));
          adminMenu();
        });
      });
    });
  });
}

// === 4. See All Orders ===
function seeAllOrders() {
  const db = readItems();
  if (db.orders.length === 0) {
    console.log(chalk.yellow("No orders found."));
  } else {
    console.log(chalk.green("\n All Orders:"));
    console.log(db.orders);
  }
  adminMenu();
}

// === 5. Process an Order ===
function processOrder() {
  const db = readItems();
  rl.question("Enter order ID to process: ", (id) => {
    const order = db.orders.find((o) => o.id == id);
    if (!order) {
      console.log(chalk.red(" Order not found."));
    } else {
      order.status = "processed";
      writeItems(db);
      console.log(chalk.green(` Order ${id} processed successfully!`));
    }
    adminMenu();
  });
}


// ==== USER MENU ====

function register() {
  console.log(
    chalk.yellow(`
===== REGISTER =====
1: Register as an admin
2: Register as a user
  `)
  );

  rl.question("Choose an option: ", (choice) => {
    switch (choice.trim()) {
      case "1":
        registerAdmin();
        break;
      case "2":
        registerUser();
        break;
      default:
        console.log(chalk.red("Invalid choice."));
        register();
    }
  });
}

function registerAdmin() {
  const db = readItems();

  rl.question("Enter admin name: ", (name) => {
    rl.question("Enter a PIN: ", (pin) => {
      db.users = db.users || [];
      db.users.push({ role: "admin", name, pin });
      writeItems(db);
      console.log(chalk.green(`Admin '${name}' registered successfully!`));
      shopMenu()
    });
  });
}

function registerUser() {
  const db = readItems();

  rl.question("Enter username: ", (name) => {
    rl.question("Enter a PIN: ", (pin) => {
      db.users = db.users || [];
      db.users.push({ role: "user", name, pin, notifications: [] });
      writeItems(db);
      console.log(chalk.green(`User '${name}' registered successfully!`));
      shopMenu();
    });
  });
}

function seeSingleProduct() {
  const db = readItems();

  rl.question("Enter product ID: ", (id) => {
    const product = db.products.find((p) => p.id == id);

    if (!product) {
      console.log(chalk.red("❌ Product not found."));
      return shopMenu();
    }

    console.log(chalk.bold.bgGreen.black("\n PRODUCT DETAILS \n"));

    console.log(chalk.cyan(`ID: ${product.id}`));
    console.log(chalk.blue(`Name: ${product.name}`));
    console.log(chalk.yellow(`Stock: ${product.instock}`));
    console.log(chalk.red(`Price: ${product.price ?? "$0"}`));
    console.log(chalk.green(`Description: ${product.description}`));

    console.log("\n");
    shopMenu(); 
  });
}


function buyProduct() {
  const db = readItems();

  rl.question("Enter product ID to buy: ", (id) => {
    const product = db.products.find((p) => p.id == id);

    if (!product) {
      console.log(chalk.red("❌ Product not found."));
      return shopMenu();
    }

    console.log(chalk.green(`\nSelected: ${product.name} - ${product.price}`));

    rl.question("Enter quantity: ", (qty) => {
      qty = parseInt(qty);

      if (isNaN(qty) || qty <= 0) {
        console.log(chalk.red("❌ Invalid quantity."));
        return shopMenu();
      }

      if (qty > product.instock) {
        console.log(chalk.red("❌ Not enough stock available."));
        return shopMenu();
      }

      // reduce stock
      product.instock -= qty;

      // create new order
      const orderId = db.orders.length + 1;
      const order = {
        id: orderId,
        productId: product.id,
        productName: product.name,
        quantity: qty,
        price: product.price,
        total: qty * parseFloat(product.price.replace("$", "")),
        status: "pending",
        buyer: currentUser ? currentUser.name : "guest",
        date: new Date().toISOString(),
      };

      db.orders.push(order);

      const now = new Date().toLocaleString();

      // add notification for current user
      if (currentUser && currentUser.role === "user") {
        const user = db.users.find((u) => u.name === currentUser.name);
        if (user) {
          user.notifications.push(
            `🛒 You purchased ${qty} ${product.name}(s) on ${now}`
          );
        }
      }

      // add notification for all admins
      db.users
        .filter((u) => u.role === "admin")
        .forEach((admin) => {
          if (!admin.notifications) admin.notifications = [];
          admin.notifications.push(
            `📢 User ${currentUser ? currentUser.name : "guest"} bought ${qty} ${product.name}(s) on ${now}`
          );
        });

      writeItems(db);

      console.log(
        chalk.green(
          `✅ Order placed! You bought ${qty} ${product.name}(s) for ${order.total} USD.`
        )
      );

      shopMenu();
    });
  });
}

function seeProductsBought() {
  const db = readItems();

  if (!currentUser || currentUser.role !== "user") {
    console.log(chalk.red("❌ Only users can see their purchased products."));
    return shopMenu();
  }

  const myOrders = db.orders.filter((o) => o.buyer === currentUser.name);

  if (myOrders.length === 0) {
    console.log(chalk.yellow("\n🛒 You have not bought any products yet.\n"));
  } else {
    console.log(chalk.bold.bgBlue.white("\n YOUR PURCHASED PRODUCTS \n"));

    myOrders.forEach((order, index) => {
      console.log(chalk.cyan(`#${index + 1}`));
      console.log(`Product: ${order.productName}`);
      console.log(`Quantity: ${order.quantity}`);
      console.log(`Total: $${order.total}`);
      console.log(`Status: ${order.status}`);
      console.log(`Date: ${order.date}\n`);
    });
  }

  shopMenu();
}


function searchOrder() {
  const db = readItems();

  if (!currentUser || currentUser.role !== "user") {
    console.log(chalk.red("❌ Only users can search their orders."));
    return shopMenu();
  }

  rl.question("Enter order ID to search: ", (id) => {
    const order = db.orders.find(
      (o) => o.id == id && o.buyer === currentUser.name
    );

    if (!order) {
      console.log(chalk.yellow("⚠️ No order found with that ID."));
    } else {
      console.log(chalk.bold.bgMagenta.white("\n ORDER DETAILS \n"));
      console.log(`Order ID: ${order.id}`);
      console.log(`Product: ${order.productName}`);
      console.log(`Quantity: ${order.quantity}`);
      console.log(`Total: $${order.total}`);
      console.log(`Status: ${order.status}`);
      console.log(`Date: ${order.date}\n`);
    }

    shopMenu();
  });
}





// === LOGIN ===
function login() {
  console.log(
    chalk.yellow(`
===== LOGIN =====
1: Login as an admin
2: Login as a user
  `)
  );

  rl.question("Choose an option: ", (choice) => {
    const db = readItems();

    rl.question("Enter your name: ", (name) => {
      rl.question("Enter your PIN: ", (pin) => {
        const user = (db.users || []).find(
          (u) => u.name === name && u.pin === pin
        );

        if (!user) {
          console.log(chalk.red("❌ Invalid login. Try again."));
          return login(); // retry
        }

        
        if (choice.trim() === "1" && user.role !== "admin") {
          console.log(chalk.red("❌ You are not registered as an admin."));
          return login(); // go back to login
        }
        if (choice.trim() === "2" && user.role !== "user") {
          console.log(chalk.red("❌ You are not registered as a user."));
          return login(); // go back to login
        }

        
        currentUser = user;
        console.log(
          chalk.green(
            `✅ Logged in as ${user.name} (${user.role}). Notifications: ${
              user.notifications ? user.notifications.length : 0
            }`
          )
        );

        // Redirect to the correct menu
        if (user.role === "admin") {
          adminMenu();
        } else {
          shopMenu();
        }
      });
    });
  });
}



// ===  Menu ===
function menu() {
    console.log(chalk.cyan.bgWhite("WELCOME TO THE BEST SHOP"));

    featuredProducts()
    
  console.log(
    chalk.yellow(`
===== SHOP MENU =====
1: Register
2: Login
3: Exit
  `)
  );

  

  rl.question("Choose an option: ", (choice) => {
    switch (choice.trim()) {
      case "1":
        register();
        break;
      case "2":
        login();
        break;
      case "3":
        console.log(chalk.green("Goodbye!"));
        rl.close();
        break;
      default:
        console.log(chalk.red("Invalid choice."));
        adminMenu();
    }
  });
}






// === Shop Menu ===
function shopMenu() {
    

    featuredProducts()
    
  console.log(
    chalk.yellow(`
===== SHOP MENU =====
1: See all products
2: See single product
3: Buy product
4: See product bought
5: Search for order
6: See notification
7: Exit
  `)
  );

  

  rl.question("Choose an option: ", (choice) => {
    switch (choice.trim()) {
      case "1":
        seeAllProducts();
        break;
      case "2":
        seeSingleProduct();
        break;
      case "3":
        buyProduct();
        break;
      case "4":
        seeProductsBought();
        break;
         case "5":
        searchOrder();
        break;
      case "6":
        seeNotifications();
        break;
      case "7":
        console.log(chalk.green("Goodbye!"));
        rl.close();
        break;
      default:
        console.log(chalk.red("Invalid choice."));
        adminMenu();
    }
  });
}



// === Admin Menu ===
function adminMenu() {
  featuredProducts()
  console.log(
    chalk.yellow(`
===== ADMIN MENU =====
1: Add product
2: See all product
3: Edit a product
4: See all orders
5: Process an order
6: Exit
  `)
  );

  rl.question("Choose an option: ", (choice) => {
    switch (choice.trim()) {
      case "1":
        addProduct();
        break;
      case "2":
        seeAllProducts();
        break;
      case "3":
        editProduct();
        break;
      case "4":
        seeAllOrders();
        break;
      case "5":
        processOrder();
        break;
      case "6":
        console.log(chalk.green("Goodbye!"));
        rl.close();
        break;
      default:
        console.log(chalk.red("Invalid choice."));
        adminMenu();
    }
  });
}

// Start App
// adminMenu();
menu()
