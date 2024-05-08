import { Request } from "express";
import { TAuthUser } from "../../types/common";
import catchAsync from "../../utils/catchAsync";
import { ReviewService } from "./review.services";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const createReviewController = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const user = req.user;
    const result = await ReviewService.createReviewService(
      user as TAuthUser,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Review created successfully",
      data: result,
    });
  }
);

export const ReviewControllers = {
  createReviewController,
};
