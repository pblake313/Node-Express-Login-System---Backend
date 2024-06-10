import app from "./src/app"; // Corrected import to match ES module syntax
import debug from "debug";
import http from "http";

const nodeDebug = debug("node-angular");

const normalizePort = (val: string | number): string | number | false => {
  let port = parseInt(val.toString(), 10);

  if (isNaN(port)) {
    // Named pipe
    return val;
  }

  if (port >= 0) {
    // Port number
    return port;
  }

  return false;
};

const onError = (error: NodeJS.ErrnoException): void => {
  const port = normalizePort(process.env.PORT || "8080");
  const bind = typeof port === "string" ? `pipe ${port}` : `port ${port}`;
  if (error.syscall !== "listen") {
    throw error;
  }
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = (): void => {
  const port = normalizePort(process.env.PORT || "8080");
  const bind = typeof port === "string" ? `pipe ${port}` : `port ${port}`;
  nodeDebug(`Listening on ${bind}`);
};

const port = normalizePort(process.env.PORT || "8080");
app.set("port", port);

const server = http.createServer(app);
server.on("error", onError);
server.on("listening", onListening);
server.listen(port, () => console.log(`Success! Listening on http://localhost:${port}`));
