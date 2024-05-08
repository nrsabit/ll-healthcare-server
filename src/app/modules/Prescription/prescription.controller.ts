import { Request } from "express";
import catchAsync from "../../utils/catchAsync";
import { TAuthUser } from "../../types/common";
import { PrescriptionServices } from "./prescription.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import pick from "../../utils/pick";
import { paginationFields } from "../../shared/global.constants";

const createPrescriptionController = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const user = req.user;
    const result = await PrescriptionServices.createPrescriptionService(
      user as TAuthUser,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Prescription created successfully",
      data: result,
    });
  }
);

const getMyPrescriptionsController = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const user = req.user;
    const options = pick(req.query, paginationFields);
    const result = await PrescriptionServices.getMyPrescriptions(
      user as TAuthUser,
      options
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My prescriptions retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

export const PrescriptionControllers = {
  createPrescriptionController,
  getMyPrescriptionsController,
};
