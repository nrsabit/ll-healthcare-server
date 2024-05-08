import express from "express";
import { AdminControllers } from "./admin.controllers";
import validateRequest from "../../middlewares/validateRequest";
import { AdminValidations } from "./admin.validations";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminControllers.getAllAdminsController
);

router.get(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminControllers.getSingleAdminController
);

router.patch(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(AdminValidations.updateAdminValidationSchema),
  AdminControllers.updateAdminController
);

router.delete(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminControllers.deleteAdminController
);

router.delete(
  "/soft/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminControllers.softDeleteAdminController
);

export const AdminRoutes = router;
