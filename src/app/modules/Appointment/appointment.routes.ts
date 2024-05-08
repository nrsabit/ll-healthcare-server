import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { AppointmentControllers } from "./appointment.controllers";

const router = express.Router();

router.get(
  "/my-appointments",
  auth(UserRole.PATIENT, UserRole.DOCTOR),
  AppointmentControllers.getMyAppointmentsController
);

// TODO: create a zod validation schema for appointment creation.
// TODO: get all appointments with filtering, not searching, accessable only by admin and super admin

router.post(
  "/",
  auth(UserRole.PATIENT),
  AppointmentControllers.createAppointmentController
);

router.patch(
  "/status/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
  AppointmentControllers.updateStatusController
);

export const AppointmentRoutes = router;
