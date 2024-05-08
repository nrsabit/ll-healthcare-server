import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { ReviewControllers } from "./review.controller";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.PATIENT),
  ReviewControllers.createReviewController
);

export const ReviewRoutes = router;
