import express from "express";
import { DoctorControllers } from "./doctor.controllers";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { DoctorValidation } from "./doctor.validations";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get("/", DoctorControllers.getAllDoctorsController);

router.get("/:id", DoctorControllers.getSingleDoctorController);

router.patch(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
  validateRequest(DoctorValidation.updateDoctorSchema),
  DoctorControllers.updateDoctorController
);

router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  DoctorControllers.deleteDoctorController
);

router.delete(
  "/soft/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  DoctorControllers.softDeleteController
);

export const DoctorRoutes = router;
