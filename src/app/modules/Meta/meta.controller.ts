import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { MetaServices } from "./meta.services";
import { Request } from "express";
import { TAuthUser } from "../../types/common";

const getMetaDataController = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const user = req.user;
    const result = await MetaServices.getMetaDataService(user as TAuthUser);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Dashboard Metadata Retrieval Successful",
      data: result,
    });
  }
);

export const MetaControllers = {
  getMetaDataController,
};
