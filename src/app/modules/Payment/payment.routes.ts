import express from "express";
import { PaymentControllers } from "./payment.controller";

const router = express.Router();

router.get("/validate-payment", PaymentControllers.validatePaymentController);

router.post(
  "/init-payment/:appointmentId",
  PaymentControllers.initPaymentController
);

export const PaymentRoutes = router;
