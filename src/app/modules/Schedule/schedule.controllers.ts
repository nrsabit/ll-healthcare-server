import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ScheduleService } from "./schedule.services";
import pick from "../../utils/pick";
import { Request } from "express";
import { TAuthUser } from "../../types/common";

const createScheduleController = catchAsync(async (req, res) => {
  const result = await ScheduleService.createScheduleService(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Schedule Created successfully",
    data: result,
  });
});

const getAllSchedulesController = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const user = req.user;
    const filters = pick(req.query, ["startDate", "endDate"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await ScheduleService.getAllSchedulesService(
      filters,
      options,
      user as TAuthUser
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Schedules fetched successfully",
      data: result,
    });
  }
);

const getSingleScheduleController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ScheduleService.getSingleScheduleService(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Schedule fetched successfully",
    data: result,
  });
});

const deleteScheduleController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ScheduleService.deleteScheduleService(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Schedule deleted successfully",
    data: result,
  });
});

export const ScheduleControllers = {
  createScheduleController,
  getAllSchedulesController,
  getSingleScheduleController,
  deleteScheduleController,
};
