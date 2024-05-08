import express from "express";
import { PatientControllers } from "./patient.controllers";

const router = express.Router();

router.get("/", PatientControllers.getAllPatientsController);

router.get("/:id", PatientControllers.getSinglePatientController);

router.patch("/:id", PatientControllers.updatePatientController);

router.delete("/:id", PatientControllers.deletePatientController);

router.delete("/soft/:id", PatientControllers.softDeletePatientController);

export const PatientRoutes = router;
