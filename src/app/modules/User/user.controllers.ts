import { UserServices } from "./user.services";
import catchAsync from "../../utils/catchAsync";
import pick from "../../utils/pick";
import { UserFilterObject } from "./user.constant";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { Request } from "express";
import { TAuthUser } from "../../types/common";

const createAdminController = catchAsync(async (req, res) => {
  const result = await UserServices.createAdminService(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin is created successfuly",
    data: result,
  });
});

const createDoctorController = catchAsync(async (req, res) => {
  const result = await UserServices.createDoctorService(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor is created successfuly",
    data: result,
  });
});

const createPatientController = catchAsync(async (req, res) => {
  const result = await UserServices.createPatientService(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient is created successfuly",
    data: result,
  });
});

const getAllUsersController = catchAsync(async (req, res) => {
  const filteredQueryObj = pick(req.query, UserFilterObject);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  const result = await UserServices.getAllUsersService(
    filteredQueryObj,
    options
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users fetched successfuly",
    meta: result.meta,
    data: result.data,
  });
});

const updateUserStatusController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.updateUserStatusService(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Status Updated successfuly",
    data: result,
  });
});

const getMyProfileController = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const user = req.user;
    const result = await UserServices.getMyProfileService(user as TAuthUser);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Profile fetched successfuly",
      data: result,
    });
  }
);

const updateMyProfileController = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const user = req.user;
    const result = await UserServices.updateMyProfileService(
      user as TAuthUser,
      req
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Profile updated successfuly",
      data: result,
    });
  }
);

export const UserControllers = {
  createAdminController,
  createDoctorController,
  createPatientController,
  getAllUsersController,
  updateUserStatusController,
  getMyProfileController,
  updateMyProfileController,
};
