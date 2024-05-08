import express, { NextFunction, Request, Response } from "express";
import { UserControllers } from "./user.controllers";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../utils/fileUploader";
import { UserValidations } from "./user.validations";
import validateRequest from "../../middlewares/validateRequest";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserControllers.getAllUsersController
);

router.get(
  "/me",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  UserControllers.getMyProfileController
);

router.post(
  "/create-admin",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  fileUploader.upload.single("file"),
  // change teh request body because we are sending the parsed body
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidations.createAdminSchema.parse(
      JSON.parse(req.body.data)
    );
    return UserControllers.createAdminController(req, res, next);
  }
);

router.post(
  "/create-doctor",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidations.createDoctorSchema.parse(
      JSON.parse(req.body.data)
    );
    return UserControllers.createDoctorController(req, res, next);
  }
);

router.post(
  "/create-patient",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidations.createPatientSchema.parse(
      JSON.parse(req.body.data)
    );
    return UserControllers.createPatientController(req, res, next);
  }
);

router.patch(
  "/:id/status",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(UserValidations.updateUserStatusSchema),
  UserControllers.updateUserStatusController
);

router.patch(
  "/update-my-profile",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  fileUploader.upload.single("file"),
  // change teh request body because we are sending the parsed body
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    return UserControllers.updateMyProfileController(req, res, next);
  }
);

export const UserRoutes = router;
