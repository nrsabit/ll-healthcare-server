import { Server } from "http";
import app from "./app";
import config from "./app/config";

const port = config.port;

// run the server with variable function.
async function main() {
  const server: Server = app.listen(port, () => {
    console.log("App is running on port: ", port);
  });

  const exitHandler = (message: string) => {
    if (server) {
      server.close(() => {
        console.log(message);
      });
    }
    process.exit(1);
  };

  process.on("uncaughtException", (error) => {
    console.log(error);
    exitHandler("Uncaught Exception Detected, Shutting down the server");
  });

  process.on("unhandledRejection", (error) => {
    console.log(error);
    exitHandler("Unhandled Rejection Detected, Shutting down the server");
  });
}

main();
