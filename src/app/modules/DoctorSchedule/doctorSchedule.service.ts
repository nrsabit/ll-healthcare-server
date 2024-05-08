import { DoctorSchedule, Prisma } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { TAuthUser } from "../../types/common";
import { TPaginationOptions } from "../../types/pagination.type";
import sortPagination from "../../utils/sortPagination";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { TDoctorScheduleFilterRequest } from "./doctorSchedule.constants";

const createDoctorScheduleService = async (
  user: any,
  payload: { scheduleIds: string[] }
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email, isDeleted: false },
  });

  const doctorSchedulesData = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctorData.id,
    scheduleId,
  }));

  const result = await prisma.doctorSchedule.createMany({
    data: doctorSchedulesData,
    skipDuplicates: true,
  });

  return result;
};

const getMySchedulesService = async (
  filters: any,
  options: TPaginationOptions,
  user: TAuthUser
) => {
  let { limit, page, skip, sortBy, sortOrder } = sortPagination(options);
  const { startDate, endDate, ...filterData } = filters;
  const doctorData = await prisma.doctor.findUnique({
    where: { email: user?.email },
  });

  const andConditions: Prisma.DoctorScheduleWhereInput[] = [];

  if (startDate && endDate) {
    andConditions.push({
      AND: [
        {
          schedule: {
            startDateTime: { gte: startDate },
          },
        },
        {
          schedule: {
            endDateTime: { lte: endDate },
          },
        },
      ],
    });
  }

  if (Object.keys(filterData).length > 0) {
    if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "true"
    ) {
      filterData.isBooked = true;
    } else if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "false"
    ) {
      filterData.isBooked = false;
    }
    andConditions.push({
      AND: Object.keys(filterData).map((key) => {
        return {
          [key]: {
            equals: (filterData as any)[key],
          },
        };
      }),
    });
  }

  andConditions.push({
    doctorId: doctorData?.id,
  });

  const whereConditions: Prisma.DoctorScheduleWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.doctorSchedule.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: sortBy !== "createdAt" && sortOrder ? { [sortBy]: sortOrder } : {},
  });
  const total = await prisma.doctorSchedule.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const deleteDoctorScheduleService = async (
  user: TAuthUser,
  scheduleId: string
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { email: user?.email },
  });

  const isBooked = await prisma.doctorSchedule.findUnique({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData?.id,
        scheduleId,
      },
      isBooked: true,
    },
  });

  if (isBooked) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Can't delete this schedule, because it's already booked"
    );
  }

  const result = await prisma.doctorSchedule.delete({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData?.id,
        scheduleId,
      },
    },
  });

  return result;
};

const getAllDSchedulesService = async (
  filters: TDoctorScheduleFilterRequest,
  options: TPaginationOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } = sortPagination(options);
  const { searchTerm, ...filterData } = filters;
  const andConditions: Prisma.DoctorScheduleWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      doctor: {
        name: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "true"
    ) {
      filterData.isBooked = true;
    } else if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "false"
    ) {
      filterData.isBooked = false;
    }
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: any =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const result = await prisma.doctorSchedule.findMany({
    include: {
      doctor: true,
      schedule: true,
    },
    where: whereConditions,
    skip,
    take: limit,
    orderBy: sortBy !== "createdAt" && sortOrder ? { [sortBy]: sortOrder } : {},
  });
  const total = await prisma.doctorSchedule.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

export const DoctorScheduleServices = {
  createDoctorScheduleService,
  getMySchedulesService,
  deleteDoctorScheduleService,
  getAllDSchedulesService,
};
