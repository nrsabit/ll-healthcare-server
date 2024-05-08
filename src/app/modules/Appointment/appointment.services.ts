import { prisma } from "../../shared/prisma";
import { TAuthUser } from "../../types/common";
import { v4 as uuidv4 } from "uuid";
import { TPaginationOptions } from "../../types/pagination.type";
import sortPagination from "../../utils/sortPagination";
import {
  AppointmentStatus,
  PaymentStatus,
  Prisma,
  UserRole,
} from "@prisma/client";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const createAppointmentService = async (user: TAuthUser, payload: any) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: { email: user?.email, isDeleted: false },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { id: payload.doctorId, isDeleted: false },
  });

  const doctorScheduleData = await prisma.doctorSchedule.findFirstOrThrow({
    where: {
      doctorId: doctorData.id,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });

  const videoCallingId = uuidv4();

  const result = await prisma.$transaction(async (tx) => {
    const appointmentData = await tx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: doctorScheduleData.scheduleId,
        videoCallingId,
      },
      include: {
        patient: true,
        doctor: true,
        schedule: true,
      },
    });

    await tx.doctorSchedule.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: payload.scheduleId,
        },
      },
      data: { isBooked: true, appointmentId: appointmentData.id },
    });

    const today = new Date();
    const transactionId = `LL-HealthCare-${today.getFullYear()}-${today.getMonth()}-${today.getDate()}-${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}`;

    await tx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });

    return appointmentData;
  });

  return result;
};

const getMyAppointments = async (
  user: TAuthUser,
  filterData: any,
  options: TPaginationOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } = sortPagination(options);

  const andConditions: Prisma.AppointmentWhereInput[] = [];

  if (user?.role === UserRole.PATIENT) {
    andConditions.push({
      patient: { email: user.email },
    });
  } else if (user?.role === UserRole.DOCTOR) {
    andConditions.push({
      doctor: { email: user.email },
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

  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.appointment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : {
            createdAt: "desc",
          },
    include:
      user?.role === UserRole.PATIENT
        ? { doctor: true, schedule: true }
        : {
            patient: {
              include: { patientHealthData: true, medicalReport: true },
            },
            schedule: true,
          },
  });
  const total = await prisma.appointment.count({
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

const updateStatusService = async (
  id: string,
  status: AppointmentStatus,
  user: TAuthUser
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: { id },
    include: { doctor: true },
  });

  if (
    user?.role === UserRole.DOCTOR &&
    user.email !== appointmentData.doctor.email
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This is not your appointment");
  }

  const result = await prisma.appointment.update({
    where: { id: appointmentData.id },
    data: { status },
  });

  return result;
};

const cancelUnpaidAppointments = async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const unpaidAppointments = await prisma.appointment.findMany({
    where: {
      createdAt: { lte: thirtyMinutesAgo },
      paymentStatus: PaymentStatus.UNPAID,
    },
  });

  const unpaidAppointmentIds = unpaidAppointments.map(
    (appointment) => appointment.id
  );

  await prisma.$transaction(async (tx) => {
    await tx.payment.deleteMany({
      where: { appointmentId: { in: unpaidAppointmentIds } },
    });

    await tx.appointment.deleteMany({
      where: { id: { in: unpaidAppointmentIds } },
    });

    for (const unpaidAppointment of unpaidAppointments) {
      await tx.doctorSchedule.updateMany({
        where: {
          doctorId: unpaidAppointment.doctorId,
          scheduleId: unpaidAppointment.scheduleId,
        },
        data: { isBooked: false },
      });
    }
  });
};

export const AppointmentServices = {
  createAppointmentService,
  getMyAppointments,
  updateStatusService,
  cancelUnpaidAppointments,
};
