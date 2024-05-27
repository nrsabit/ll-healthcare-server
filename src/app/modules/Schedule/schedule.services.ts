import { addHours, addMinutes, format } from "date-fns";
import { prisma } from "../../shared/prisma";
import { TScheduleFilters, TSchedulePayload } from "./schedule.interface";
import { Prisma, Schedule } from "@prisma/client";
import { TPaginationOptions } from "../../types/pagination.type";
import sortPagination from "../../utils/sortPagination";
import { TAuthUser } from "../../types/common";

// TODO: Need to focus on the time conversion perfectly in the leisure time.
// this function is initialized to convert the local date time into UTC date time.
const convertDateTime = async (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + offset);
};

const createScheduleService = async (
  payload: TSchedulePayload
) => {
  const { startDate, endDate, startTime, endTime } = payload;

  const intervalTime = 30;
  const createdSchedules = [];

  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    const startDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`, // we can directly use currentDate as well
          Number(startTime.split(":")[0])
        ),
        Number(startTime.split(":")[1])
      )
    );

    const endDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`, // we can directly use currentDate as well
          Number(endTime.split(":")[0])
        ),
        Number(endTime.split(":")[1])
      )
    );

    while (startDateTime < endDateTime) {
      // this one is for adding the date in Local date format.
      // const scheduleData = {
      //   startDateTime,
      //   endDateTime: addMinutes(startDateTime, intervalTime),
      // };

      // this one is for adding the date in UTC format
      const convertedStartDateTime = await convertDateTime(startDateTime);
      const convertedEndDateTime = await convertDateTime(
        addMinutes(startDateTime, intervalTime)
      );

      const scheduleData = {
        startDateTime: convertedStartDateTime,
        endDateTime: convertedEndDateTime,
      };

      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          startDateTime: scheduleData.startDateTime,
          endDateTime: scheduleData.endDateTime,
        },
      });

      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });

        createdSchedules.push(result);
      }

      startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // return createdSchedules;
};

const getAllSchedulesService = async (
  filters: TScheduleFilters,
  options: TPaginationOptions,
  user: TAuthUser
) => {
  const { limit, page, skip, sortBy, sortOrder } = sortPagination(options);
  const { startDate, endDate, ...filterData } = filters;

  const andConditions: Prisma.ScheduleWhereInput[] = [];

  if (startDate && endDate) {
    andConditions.push({
      AND: [
        {
          startDateTime: { gte: startDate },
        },
        {
          endDateTime: { lte: endDate },
        },
      ],
    });
  }

  if (Object.keys(filterData).length > 0) {
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

  // remove already scheduled items for the current doctor.
  const doctorSchedules = await prisma.doctorSchedule.findMany({
    where: {
      doctor: { email: user?.email },
    },
  });

  const doctorScheduleIds = doctorSchedules.map(
    (schedule) => schedule.scheduleId
  );

  if (doctorScheduleIds.length > 0) {
    andConditions.push({
      id: { notIn: doctorScheduleIds },
    });
  }

  const whereConditions: Prisma.ScheduleWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.schedule.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : {
            createdAt: "desc",
          },
  });
  const total = await prisma.schedule.count({
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

const getSingleScheduleService = async (id: string) => {
  const result = await prisma.schedule.findUniqueOrThrow({
    where: { id },
  });

  return result;
};

const deleteScheduleService = async (id: string) => {
  const result = await prisma.schedule.delete({
    where: { id },
  });

  return result;
};

export const ScheduleService = {
  createScheduleService,
  getAllSchedulesService,
  getSingleScheduleService,
  deleteScheduleService,
};
