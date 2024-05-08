import express, { NextFunction, Request, Response } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../utils/fileUploader";
import { SpecialtyControllers } from "./specialties.controllers";
import { SpecialtiesValidations } from "./specialties.validations";

const router = express.Router();

router.get("/", SpecialtyControllers.getAllSpecialtiesController);

router.post(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
  fileUploader.upload.single("file"),
  // change teh request body because we are sending the parsed body
  (req: Request, res: Response, next: NextFunction) => {
    req.body = SpecialtiesValidations.createSpecialtySchema.parse(
      JSON.parse(req.body.data)
    );
    return SpecialtyControllers.createSpecialtyController(req, res, next);
  }
);

router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  SpecialtyControllers.deleteSpecialtyController
);

export const SpecialtiesRoutes = router;
