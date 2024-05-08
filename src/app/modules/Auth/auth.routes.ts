import express from "express";
import { AuthControllers } from "./auth.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post("/login", AuthControllers.userLoginController);

router.post("/refresh-token", AuthControllers.refreshTokenController);

router.post(
  "/change-password",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  AuthControllers.changePasswordController
);

router.post("/forgot-password", AuthControllers.forgotPasswordController);

router.post("/reset-password", AuthControllers.resetPasswordController);

export const AuthRoutes = router;
