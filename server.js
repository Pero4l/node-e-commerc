const http = require("http");
  
const products = require("./data.json")

function renderPage(res, title, content) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #f5f7fa;
          padding: 30px;
          text-align: center;
        }
        h1 { color: #333; }
        h2 { margin-bottom: 20px; }
        .btn-group a {
          display: inline-block;
          background: #ff4800ff;
          color: white;
          text-decoration: none;
          padding: 12px 20px;
          margin: 5px;
          border-radius: 8px;
          font-size: 16px;
          transition: 0.3s;
        }
        .btn-group a:hover {
          background: #b30c00ff;
          transform: translateY(-2px);
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          padding: 20px;
          margin-top: 30px;
        }
        .product {
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 8px;
          background: #fff;
          text-align: center;
          transition: 0.3s;
        }
        .product:hover {
          background: #eef6ff;
          transform: translateY(-3px);
          box-shadow: 0 3px 6px rgba(0,0,0,0.1);
        }
        .product-title {
          font-weight: bold;
          margin-bottom: 10px;
          color: #333;
        }
        .product-price {
          color: #ff0400ff;
          font-size: 18px;
          margin-bottom: 5px;
        }
        .product-id {
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `);
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    let productsHTML = `
  <div class="products-grid">
    ${products.products
      .map(
        (p) => `
        <div class="product">
          <div class="product-title">${p.name}</div>
          <div class="product-price">${p.price}</div>
          <div class="product-id">ID: ${p.id}</div>
        </div>`
      )
      .join("")}
  </div>
`;

if (!products.products.length) productsHTML = "<p>No products available</p>";


    renderPage(
      res,
      "Home",
      `
      <h2>Welcome to PTB E-Commerce Shop</h2>
      <div class="btn-group">
        <a href="/register">Register</a>
        <a href="/login">Login</a>
      </div>
      ${productsHTML}
      `
    );
  } else {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("<h1>404 Not Found</h1>");
  }
});

server.listen(7000, () => {
  console.log(`🚀 Server running at http://localhost:7000`);
});