import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PaymentServices } from "./payment.service";

const initPaymentController = catchAsync(async (req, res) => {
  const { appointmentId } = req.params;
  const result = await PaymentServices.initPaymentService(appointmentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment Initiate successfully",
    data: result,
  });
});

const validatePaymentController = catchAsync(async (req, res) => {
  const result = await PaymentServices.validatePaymentService(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment validated successfully",
    data: result,
  });
});

export const PaymentControllers = {
  initPaymentController,
  validatePaymentController,
};
