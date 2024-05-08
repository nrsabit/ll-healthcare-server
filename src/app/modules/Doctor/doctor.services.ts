import { Doctor, Prisma, UserStatus } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { TPaginationOptions } from "../../types/pagination.type";
import sortPagination from "../../utils/sortPagination";
import { TDoctorFilterRequest } from "./doctor.interfaces";
import { doctorSearchableFields } from "./doctor.constant";

const getAllDoctorsService = async (
  filters: TDoctorFilterRequest,
  options: TPaginationOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } = sortPagination(options);
  const { searchTerm, specialties, ...filterData } = filters;

  const andConditions: Prisma.DoctorWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: doctorSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // doctor > doctorSpecialties > specialties -> title

  if (specialties && specialties.length > 0) {
    andConditions.push({
      doctorSpecialties: {
        some: {
          specialties: {
            title: {
              contains: specialties,
              mode: "insensitive",
            },
          },
        },
      },
    });
  } 

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));
    andConditions.push(...filterConditions);
  }

  andConditions.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.DoctorWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.doctor.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: "desc" },
    include: {
      doctorSpecialties: {
        include: {
          specialties: true,
        },
      },
    },
  });

  const total = await prisma.doctor.count({
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

const getSingleDoctorService = async (id: string): Promise<Doctor | null> => {
  const result = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialties: true,
        },
      },
    },
  });
  return result;
};

const updateDoctorService = async (id: string, payload: any) => {
  const doctorInfo = await prisma.doctor.findUniqueOrThrow({ where: { id } });

  const { specialties, ...doctorData } = payload;

  // update the doctor data without specialties
  await prisma.$transaction(async (transactionClient) => {
    await transactionClient.doctor.update({ where: { id }, data: doctorData });

    if (specialties && specialties.length > 0) {
      // remove the specified specialties.
      const specialtiesToRemove = specialties.filter(
        (specialy: any) => specialy.isDeleted
      );

      if (specialtiesToRemove.length > 0) {
        for (const specialty of specialtiesToRemove) {
          await transactionClient.doctorSpecialties.deleteMany({
            // we will use delete many, but will work same.
            where: {
              doctorId: doctorInfo.id,
              specialtiesId: specialty.specialtyId,
            },
          });
        }
      }

      // Add the specified specialties.
      const specialtiesToAdd = specialties.filter(
        (specialy: any) => !specialy.isDeleted
      );

      if (specialtiesToAdd.length > 0) {
        for (const specialty of specialtiesToAdd) {
          await transactionClient.doctorSpecialties.create({
            data: {
              doctorId: doctorInfo.id,
              specialtiesId: specialty.specialtyId,
            },
          });
        }
      }
    }
  });

  const result = await prisma.doctor.findUniqueOrThrow({
    where: { id: doctorInfo.id },
    include: { doctorSpecialties: { include: { specialties: true } } },
  });

  return result;
};

const deleteDoctorService = async (id: string): Promise<Doctor> => {
  return await prisma.$transaction(async (transactionClient) => {
    const deleteDoctor = await transactionClient.doctor.delete({
      where: {
        id,
      },
    });

    await transactionClient.user.delete({
      where: {
        email: deleteDoctor.email,
      },
    });

    return deleteDoctor;
  });
};

const softDeleteService = async (id: string): Promise<Doctor> => {
  return await prisma.$transaction(async (transactionClient) => {
    const deleteDoctor = await transactionClient.doctor.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    await transactionClient.user.update({
      where: {
        email: deleteDoctor.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return deleteDoctor;
  });
};

export const DoctorServices = {
  getAllDoctorsService,
  getSingleDoctorService,
  updateDoctorService,
  deleteDoctorService,
  softDeleteService,
};
