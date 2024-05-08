import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { prisma } from "../../shared/prisma";
import { TAuthUser } from "../../types/common";

const createReviewService = async (user: TAuthUser, payload: any) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: { id: payload.appointmentId },
    include: { patient: true },
  });

  if (user?.email !== appointmentData.patient.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This is not your Appointment");
  }

  const result = await prisma.$transaction(async (tx) => {
    const createdReview = await tx.review.create({
      data: {
        appointmentId: appointmentData.id,
        doctorId: appointmentData.doctorId,
        patientId: appointmentData.patientId,
        rating: payload.rating,
        comment: payload.comment,
      },
    });

    const averageRating = await tx.review.aggregate({
      where: { doctorId: appointmentData.doctorId },
      _avg: { rating: true },
    });

    await tx.doctor.update({
      where: { id: appointmentData.doctorId },
      data: { averageRating: averageRating._avg.rating as number },
    });

    return createdReview;
  });

  return result;
};

// TODO: get all reviews with pagination and doctor or patient email filtering, will be accessible only for super admins and admins
// same thing will go for the prescriptions as well
// add the zod validation on the body that we didn't add

export const ReviewService = {
  createReviewService,
};
