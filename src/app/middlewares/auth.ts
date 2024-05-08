import { NextFunction, Request, Response } from "express";
import { jwtHelpers } from "../utils/jwtHelpers";
import config from "../config";
import { Secret } from "jsonwebtoken";
import ApiError from "../errors/ApiError";
import httpStatus from "http-status";
import { prisma } from "../shared/prisma";
import { UserStatus } from "@prisma/client";

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized");
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.jwt_access_secret as Secret
      );

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "forbidden access");
      }

      await prisma.user.findUniqueOrThrow({
        where: { email: verifiedUser.email, status: UserStatus.ACTIVE },
      });

      req.user = verifiedUser;

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
