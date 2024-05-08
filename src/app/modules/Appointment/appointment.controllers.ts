import { Request } from "express";
import catchAsync from "../../utils/catchAsync";
import { AppointmentServices } from "./appointment.services";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import pick from "../../utils/pick";
import { paginationFields } from "../../shared/global.constants";
import { TAuthUser } from "../../types/common";

const createAppointmentController = catchAsync(
  async (req: Request & { user?: any }, res) => {
    const user = req.user;
    const result = await AppointmentServices.createAppointmentService(
      user,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Appointment Created successfully",
      data: result,
    });
  }
);

const getMyAppointmentsController = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const user = req.user;
    const filters = pick(req.query, ["status", "paymentStatus"]);
    const options = pick(req.query, paginationFields);
    const result = await AppointmentServices.getMyAppointments(
      user as TAuthUser,
      filters,
      options
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My Appointments fetched successfully",
      data: result,
    });
  }
);

const updateStatusController = catchAsync(async (req : Request & {user?: TAuthUser}, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = req.user
  const result = await AppointmentServices.updateStatusService(id, status, user as TAuthUser);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Appointment Status updated successfully",
    data: result,
  });
});

export const AppointmentControllers = {
  createAppointmentController,
  getMyAppointmentsController,
  updateStatusController,
};
