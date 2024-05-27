import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { DoctorScheduleServices } from "./doctorSchedule.service";
import { Request } from "express";
import { TAuthUser } from "../../types/common";
import pick from "../../utils/pick";
import { doctorScheduleFilterableFields } from "./doctorSchedule.constants";
import { paginationFields } from "../../shared/global.constants";

const createDoctorScheduleController = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const result = await DoctorScheduleServices.createDoctorScheduleService(
      req.user,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Doctor Schedule Created successfully",
      data: result,
    });
  }
);

const getMySchedulesController = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const user = req.user;
    const filters = pick(req.query, doctorScheduleFilterableFields);
    const options = pick(req.query, paginationFields);
    const result = await DoctorScheduleServices.getMySchedulesService(
      filters,
      options,
      user as TAuthUser
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My Schedules fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

const deleteDoctorSchedulesController = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const user = req.user;
    const { id } = req.params;
    const result = await DoctorScheduleServices.deleteDoctorScheduleService(
      user as TAuthUser,
      id
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Schedules deleted successfully",
      data: result,
    });
  }
);

const getAllSchedulesController = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const user = req.user;
    const filters = pick(req.query, doctorScheduleFilterableFields);
    const options = pick(req.query, paginationFields);
    const result = await DoctorScheduleServices.getAllDSchedulesService(
      filters,
      options
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All Schedules fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

export const DoctorScheduleControllers = {
  createDoctorScheduleController,
  getMySchedulesController,
  deleteDoctorSchedulesController,
  getAllSchedulesController,
};
