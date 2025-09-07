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
    chalk.bold.yellow("Stock".padEnd(10)) +
    chalk.bold.green("Description\n")
  );

  // Show only first 3 products
  const pageItems = products.slice(0, 10);

  pageItems.forEach((p) => {
    console.log(
      chalk.magenta(String(p.id).padEnd(5)) +
      chalk.blue(p.name.padEnd(25)) +
      chalk.yellow(String(p.instock).padEnd(10)) +
      chalk.green(p.description)
    );
  });

  console.log("\n");
};


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




// === Shop Menu ===
function shopMenu() {
    console.log(chalk.cyan("Welcome to the best SHOP"));

    featuredProducts()
    
  console.log(
    chalk.yellow(`
===== SHOP MENU =====
1: Register
2: Login
3: See product bought
4: Search for order
5: Exit
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
        featuredProducts()
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
shopMenu()
