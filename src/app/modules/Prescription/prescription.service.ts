import { AppointmentStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { TAuthUser } from "../../types/common";
import ApiError from "../../errors/ApiError";
import httpStatus, { METHOD_NOT_ALLOWED } from "http-status";
import { TPaginationOptions } from "../../types/pagination.type";
import sortPagination from "../../utils/sortPagination";

const createPrescriptionService = async (user: TAuthUser, payload: any) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
      paymentStatus: PaymentStatus.PAID,
      status: AppointmentStatus.COMPLETED,
    },
    include: { doctor: true, patient: true },
  });

  if (user?.email !== appointmentData.doctor.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This is not your appointment");
  }

  const result = await prisma.prescription.create({
    data: {
      doctorId: appointmentData.doctorId,
      appointmentId: appointmentData.id,
      patientId: appointmentData.patientId,
      instructions: payload.instructions,
      followUpDate: payload.followUpDate || null,
    },
  });

  return result;
};

const getMyPrescriptions = async (
  user: TAuthUser,
  options: TPaginationOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } = sortPagination(options);

  const result = await prisma.prescription.findMany({
    where: { patient: { email: user?.email } },
    include: { doctor: true, appointment: true },
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: "desc" },
  });

  const total = await prisma.prescription.count({
    where: { patient: { email: user?.email } },
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

export const PrescriptionServices = {
  createPrescriptionService,
  getMyPrescriptions
};
