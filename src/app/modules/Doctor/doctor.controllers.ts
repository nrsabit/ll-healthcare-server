import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { DoctorServices } from "./doctor.services";
import pick from "../../utils/pick";
import { doctorFilterableFields } from "./doctor.constant";

const getAllDoctorsController = catchAsync(async (req, res) => {
  const filters = pick(req.query, doctorFilterableFields);

  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await DoctorServices.getAllDoctorsService(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctors retrieval successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleDoctorController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DoctorServices.getSingleDoctorService(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor retrieval successfully",
    data: result,
  });
});

const updateDoctorController = catchAsync(async (req, res) => {
  const { doctorId } = req.params;
  const result = await DoctorServices.updateDoctorService(doctorId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor is Updated successfuly",
    data: result,
  });
});

const deleteDoctorController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DoctorServices.deleteDoctorService(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor deleted successfully",
    data: result,
  });
});

const softDeleteController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DoctorServices.softDeleteService(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor soft deleted successfully",
    data: result,
  });
});

export const DoctorControllers = {
  updateDoctorController,
  getAllDoctorsController,
  getSingleDoctorController,
  deleteDoctorController,
  softDeleteController,
};
