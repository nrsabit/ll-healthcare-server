import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { DoctorScheduleControllers } from "./doctorSchedule.controller";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  DoctorScheduleControllers.getAllSchedulesController
);

router.get(
  "/my-schedule",
  auth(UserRole.DOCTOR),
  DoctorScheduleControllers.getMySchedulesController
);

router.post(
  "/",
  auth(UserRole.DOCTOR),
  DoctorScheduleControllers.createDoctorScheduleController
);

router.delete(
  "/:id",
  auth(UserRole.DOCTOR),
  DoctorScheduleControllers.deleteDoctorSchedulesController
);

export const DoctorScheduleRoutes = router;
