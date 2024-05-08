import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { SpecialtiesServices } from "./specialties.services";

const createSpecialtyController = catchAsync(async (req, res) => {
  const result = await SpecialtiesServices.createSpecialtyService(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialty is created successfuly",
    data: result,
  });
});

const getAllSpecialtiesController = catchAsync(async (req, res) => {
  const result = await SpecialtiesServices.getAllSpecialtiesService();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialties data fetched successfully",
    data: result,
  });
});

const deleteSpecialtyController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SpecialtiesServices.deleteSpecialtyService(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialty deleted successfully",
    data: result,
  });
});

export const SpecialtyControllers = {
  createSpecialtyController,
  getAllSpecialtiesController,
  deleteSpecialtyController,
};
