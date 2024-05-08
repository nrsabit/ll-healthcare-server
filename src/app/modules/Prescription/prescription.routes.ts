import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { PrescriptionControllers } from "./prescription.controller";

const router = express.Router();

router.get(
  "/my-prescriptions",
  auth(UserRole.PATIENT),
  PrescriptionControllers.getMyPrescriptionsController
);

router.post(
  "/",
  auth(UserRole.DOCTOR),
  PrescriptionControllers.createPrescriptionController
);

export const PrescriptionRoutes = router;
