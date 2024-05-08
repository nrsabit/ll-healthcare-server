import express, { Application, Request, Response } from "express";
import cors from "cors";
import router from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFoundError from "./app/middlewares/notFoundError";
import cookieParser from "cookie-parser";
import { AppointmentServices } from "./app/modules/Appointment/appointment.services";
import cron from "node-cron";

const app: Application = express();

// middlewarse
app.use(cors());
app.use(cookieParser());

cron.schedule("* * * * *", () => {
  try {
    AppointmentServices.cancelUnpaidAppointments();
  } catch (err) {
    console.error(err);
  }
});

// parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// function that will run on the root page
app.get("/", (req: Request, res: Response) => {
  res.send("Lifeline Healthcare Server is Running...");
});

// routes.
app.use("/api", router);

// global error handler
app.use(globalErrorHandler);

// not found error, it will always reamain at the bottom
app.use(notFoundError);

export default app;
