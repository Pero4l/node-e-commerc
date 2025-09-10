const http = require("http");
const { menu } = require("./shop");

http.createServer((req, res) => {
  let statusCode = 200;
  let response = "";
  let contentType = "text/plain"; 

  if (req.url === "/") {

    response = menu.toString();
  } else {
    statusCode = 404;
    contentType = "application/json";

    response = JSON.stringify({
      status: "failed",
      code: 404,
      message: "Page not found",
    });
  }

  res.writeHead(statusCode, { "Content-Type": contentType });
  res.end(response);
}).listen(7000, () => {
  console.log("Server is up!!");
});
