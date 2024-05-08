import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import pick from "../../utils/pick";
import sendResponse from "../../utils/sendResponse";
import { patientFilterableFields } from "./patient.constants";
import { PatientServices } from "./patient.services";

const getAllPatientsController = catchAsync(async (req, res) => {
  const filters = pick(req.query, patientFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await PatientServices.getAllPatientsService(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient retrieval successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSinglePatientController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PatientServices.getSinglePatientService(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient retrieval successfully",
    data: result,
  });
});

const updatePatientController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PatientServices.updatePatientService(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient updated successfully",
    data: result,
  });
});

const deletePatientController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PatientServices.deletePatientService(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient deleted successfully",
    data: result,
  });
});

const softDeletePatientController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PatientServices.patientSoftDeleteService(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient soft deleted successfully",
    data: result,
  });
});

export const PatientControllers = {
  getAllPatientsController,
  getSinglePatientController,
  updatePatientController,
  deletePatientController,
  softDeletePatientController,
};
