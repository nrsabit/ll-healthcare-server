import { Patient, Prisma, UserStatus } from "@prisma/client";
import { TPaginationOptions } from "../../types/pagination.type";
import sortPagination from "../../utils/sortPagination";
import { patientSearchableFields } from "./patient.constants";
import { TPatientFilterRequest, TPatientUpdate } from "./patient.interfaces";
import { prisma } from "../../shared/prisma";

const getAllPatientsService = async (
  filters: TPatientFilterRequest,
  options: TPaginationOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } = sortPagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.PatientWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: patientSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
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
  andConditions.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.PatientWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.patient.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : {
            createdAt: "desc",
          },
    include: {
      medicalReport: true,
      patientHealthData: true,
    },
  });
  const total = await prisma.patient.count({
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

const getSinglePatientService = async (id: string): Promise<Patient | null> => {
  const result = await prisma.patient.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      medicalReport: true,
      patientHealthData: true,
    },
  });
  return result;
};

const updatePatientService = async (
  id: string,
  payload: Partial<TPatientUpdate>
): Promise<Patient | null> => {
  await prisma.patient.findUniqueOrThrow({ where: { id, isDeleted: false } });

  const { patientHealthData, medicalReport, ...patientData } = payload;

  await prisma.$transaction(async (transactionClient) => {
    // update patient data
    await transactionClient.patient.update({
      where: { id },
      data: patientData,
      include: {
        patientHealthData: true,
        medicalReport: true,
      },
    });

    // TODO: now are taking the birthdate to update the patient health data date of birth, but we should date a  string and then we will have to convert it into the date string by using new Date()

    // create or update patient health data.
    if (patientHealthData) {
      await transactionClient.patientHealthData.upsert({
        where: { patientId: id },
        update: patientHealthData,
        create: { ...patientHealthData, patientId: id },
      });
    }

    // create medical report.
    if (medicalReport) {
      await transactionClient.medicalReport.create({
        data: { ...medicalReport, patientId: id },
      });
    }
  });

  const result = await prisma.patient.findUnique({
    where: { id },
    include: { patientHealthData: true, medicalReport: true },
  });

  return result;
};

const deletePatientService = async (id: string): Promise<Patient | null> => {
  const result = await prisma.$transaction(async (transactionClient) => {
    // delete health data.
    await transactionClient.patientHealthData.delete({
      where: { patientId: id },
    });

    // delete medical report.
    await transactionClient.medicalReport.deleteMany({
      where: { patientId: id },
    });

    // delete patient.
    const deletedPatient = await transactionClient.patient.delete({
      where: { id },
    });

    // delete user.
    await transactionClient.user.delete({
      where: { email: deletedPatient.email },
    });

    return deletedPatient;
  });

  return result;
};

const patientSoftDeleteService = async (
  id: string
): Promise<Patient | null> => {
  return await prisma.$transaction(async (transactionClient) => {
    // soft delete patient
    const deletedPatient = await transactionClient.patient.update({
      where: { id, isDeleted: false },
      data: { isDeleted: true },
    });

    // soft delete user.
    await transactionClient.user.update({
      where: { email: deletedPatient.email },
      data: { status: UserStatus.DELETED },
    });

    return deletedPatient;
  });
};

export const PatientServices = {
  getAllPatientsService,
  getSinglePatientService,
  updatePatientService,
  deletePatientService,
  patientSoftDeleteService,
};
