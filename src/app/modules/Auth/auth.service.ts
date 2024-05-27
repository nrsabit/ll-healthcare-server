import { prisma } from "../../shared/prisma";
import bcrypt from "bcrypt";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { jwtHelpers } from "../../utils/jwtHelpers";
import { UserStatus } from "@prisma/client";
import config from "../../config";
import emailSender from "./emailSender";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const userLoginService = async (payload: {
  email: string;
  password: string;
}) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: { email: payload.email, status: UserStatus.ACTIVE },
  });

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    userData.password
  );

  if (!isPasswordMatched) {
    throw new Error("Password didn't match");
  }

  const jwtPayload = {
    email: userData.email,
    role: userData.role,
  };

  const accessToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.jwt_access_secret as Secret,
    config.jwt.jwt_access_expiresin as string
  );

  const refreshToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expiresin as string
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const refreshTokenService = async (token: string) => {
  let decodedData;

  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_token_secret as Secret
    );
  } catch (err) {
    throw new Error("You are not authorized");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: { email: decodedData.email, status: UserStatus.ACTIVE },
  });

  const jwtPayload = { email: userData.email, role: userData.role };
  const accessToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.jwt_access_secret as Secret,
    config.jwt.jwt_access_expiresin as string
  );

  return {
    accessToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const changePasswordService = async (user: JwtPayload, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: { email: user?.email, status: UserStatus.ACTIVE },
  });

  const isPasswordMatched = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );

  if (!isPasswordMatched) {
    throw new Error("Password didn't match");
  }

  const hashedPassword: string = await bcrypt.hash(payload.newPassword, 12);

  await prisma.user.update({
    where: { email: userData.email },
    data: { password: hashedPassword, needPasswordChange: false },
  });

  return null;
};

const forgotPassawordService = async (payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: { email: payload?.email, status: UserStatus.ACTIVE },
  });

  const passwordResetToken = jwtHelpers.generateToken(
    { email: userData.email, role: userData.role },
    config.jwt.reset_pass_token_secret as Secret,
    config.jwt.reset_pass_token_expiresin as string
  );

  const passwordResetLink = `${config.password_reset_link}?email=${userData.email}&token=${passwordResetToken}`;

  await emailSender(userData.email, passwordResetLink);
};

const resetPasswordService = async (
  token: string,
  payload: { email: string; password: string }
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: { email: payload.email, status: UserStatus.ACTIVE },
  });

  const verifiedUser = jwtHelpers.verifyToken(
    token,
    config.jwt.reset_pass_token_secret as Secret
  );

  if (!verifiedUser) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidded Access");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 12);

  await prisma.user.update({
    where: { email: userData.email, status: UserStatus.ACTIVE },
    data: { password: hashedPassword },
  });
};

export const AuthServices = {
  userLoginService,
  refreshTokenService,
  changePasswordService,
  forgotPassawordService,
  resetPasswordService,
};
