import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { AuthServices } from "./auth.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const userLoginController = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.userLoginService(req.body);

  res.cookie("refreshToken", result.refreshToken, {
    secure: false,
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Logged in Successfully",
    data: {
      accessToken: result.accessToken,
      needPasswordChange: result.needPasswordChange,
    },
  });
});

const refreshTokenController = catchAsync(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    const result = await AuthServices.refreshTokenService(refreshToken);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Logged in Successfully",
      data: result,
    });
  }
);

const changePasswordController = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const user = req.user;
    const result = await AuthServices.changePasswordService(user, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password Changed Successfuly",
      data: result,
    });
  }
);

const forgotPasswordController = catchAsync(
  async (req: Request, res: Response) => {
    await AuthServices.forgotPassawordService(req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password Reset Link sent to email",
      data: null,
    });
  }
);

const resetPasswordController = catchAsync(
  async (req: Request, res: Response) => {
    const token = req.headers.authorization || "";
    await AuthServices.resetPasswordService(token, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password Reset Completed",
      data: null,
    });
  }
);

export const AuthControllers = {
  userLoginController,
  refreshTokenController,
  changePasswordController,
  forgotPasswordController,
  resetPasswordController
};
