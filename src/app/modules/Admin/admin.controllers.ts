import { AdminServices } from "./admin.services";
import pick from "../../utils/pick";
import { AdminFilterObject } from "./admin.constants";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";

const getAllAdminsController = catchAsync(async (req, res) => {
  const filteredQueryObj = pick(req.query, AdminFilterObject);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  const result = await AdminServices.getAllAdminsService(
    filteredQueryObj,
    options
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin fetched successfuly",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleAdminController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AdminServices.getSingleAdminService(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Single Admin fetched successfuly",
    data: result,
  });
});

const updateAdminController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AdminServices.updateAdminService(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin data updated successfuly",
    data: result,
  });
});

const deleteAdminController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AdminServices.deleteAdminService(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin deleted successfuly",
    data: result,
  });
});

const softDeleteAdminController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AdminServices.softDeleteAdminService(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin deleted successfuly",
    data: result,
  });
});

export const AdminControllers = {
  getAllAdminsController,
  getSingleAdminController,
  updateAdminController,
  deleteAdminController,
  softDeleteAdminController,
};
