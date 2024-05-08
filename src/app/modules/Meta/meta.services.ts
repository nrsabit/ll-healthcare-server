import { PaymentStatus, UserRole } from "@prisma/client";
import { TAuthUser } from "../../types/common";
import { prisma } from "../../shared/prisma";

const getMetaDataService = async (user: TAuthUser) => {
  let metadata;
  switch (user?.role) {
    case UserRole.SUPER_ADMIN:
      metadata = getSuperAdminMetaData();
      break;
    case UserRole.ADMIN:
      metadata = getAdminMetaData();
      break;
    case UserRole.DOCTOR:
      metadata = getDoctorMetaData(user);
      break;
    case UserRole.PATIENT:
      metadata = getPatientMetaData(user);
      break;
    default:
      throw new Error("Role Not Found");
  }

  return metadata;
};

const getSuperAdminMetaData = async () => {
  const appointmentCount = await prisma.appointment.count();
  const doctorCount = await prisma.doctor.count();
  const patientCount = await prisma.patient.count();
  const adminCount = await prisma.admin.count();
  const paymentCount = await prisma.payment.count({
    where: { status: PaymentStatus.PAID },
  });

  const totalRevenue = await prisma.payment.aggregate({
    where: { status: PaymentStatus.PAID },
    _sum: { amount: true },
  });

  const barChartData = await getBarChartData();
  const pieChartData = await getPieChartData();

  return {
    appointmentCount,
    doctorCount,
    patientCount,
    paymentCount,
    adminCount,
    totalRevenue: totalRevenue._sum.amount,
    barChartData,
    pieChartData,
  };
};

const getAdminMetaData = async () => {
  const appointmentCount = await prisma.appointment.count();
  const doctorCount = await prisma.doctor.count();
  const patientCount = await prisma.patient.count();
  const paymentCount = await prisma.payment.count({
    where: { status: PaymentStatus.PAID },
  });

  const totalRevenue = await prisma.payment.aggregate({
    where: { status: PaymentStatus.PAID },
    _sum: { amount: true },
  });

  const barChartData = await getBarChartData();
  const pieChartData = await getPieChartData();

  return {
    appointmentCount,
    doctorCount,
    patientCount,
    paymentCount,
    totalRevenue: totalRevenue._sum.amount,
    barChartData,
    pieChartData,
  };
};

const getDoctorMetaData = async (user: TAuthUser) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { email: user?.email },
  });

  const appointmentCount = await prisma.appointment.count({
    where: { doctorId: doctorData.id },
  });

  const patientCount = await prisma.appointment.groupBy({
    by: ["patientId"],
    _count: { id: true },
  });

  const reviewCount = await prisma.review.count({
    where: { doctorId: doctorData.id },
  });

  const totalRevenue = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      status: PaymentStatus.PAID,
      appointment: { doctorId: doctorData.id },
    },
  });

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: { id: true },
    where: { doctorId: doctorData.id },
  });

  const appointmentStatusDistributionFormatted =
    appointmentStatusDistribution.map(({ status, _count }) => ({
      status,
      count: _count.id,
    }));

  return {
    appointmentCount,
    patientCount: patientCount.length,
    reviewCount,
    totalRevenue: totalRevenue._sum.amount,
    appointmentsByStatus: appointmentStatusDistributionFormatted,
  };
};

const getPatientMetaData = async (user: TAuthUser) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: { email: user?.email },
  });

  const appointmentCount = await prisma.appointment.count({
    where: { patientId: patientData.id },
  });

  const prescriptionCount = await prisma.prescription.count({
    where: { patientId: patientData.id },
  });

  const reviewCount = await prisma.review.count({
    where: { patientId: patientData.id },
  });

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: { id: true },
    where: { patientId: patientData.id },
  });

  const appointmentStatusDistributionFormatted =
    appointmentStatusDistribution.map(({ status, _count }) => ({
      status,
      count: _count.id,
    }));

  return {
    appointmentCount,
    prescriptionCount,
    reviewCount,
    appointmentsByStatus: appointmentStatusDistributionFormatted,
  };
};

const getBarChartData = async () => {
  const appointmentCountByMonth: { month: Date; count: bigint }[] =
    await prisma.$queryRaw`
  SELECT DATE_TRUNC('month', "createdAt") AS month,
  CAST(COUNT(*) AS INTEGER) AS count
  FROM "appointments"
  GROUP BY month
  ORDER BY month ASC
  `;

  return appointmentCountByMonth;
};

const getPieChartData = async () => {
  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const appointmentStatusDistributionFormatted =
    appointmentStatusDistribution.map(({ status, _count }) => ({
      status,
      count: _count.id,
    }));

  return appointmentStatusDistributionFormatted;
};

export const MetaServices = {
  getMetaDataService,
};
