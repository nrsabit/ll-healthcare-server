import { Admin, Prisma, UserStatus } from "@prisma/client";
import { AdminSearchableFields } from "./admin.constants";
import sortPagination from "../../utils/sortPagination";
import { prisma } from "../../shared/prisma";
import { TAdminFilterParams } from "./admin.interfaces";
import { TPaginationOptions } from "../../types/pagination.type";

const getAllAdminsService = async (
  query: TAdminFilterParams,
  options: TPaginationOptions
) => {
  const { searchTerm, ...filterData } = query;
  const { page, limit, skip, sortBy, sortOrder } = sortPagination(options);
  const andCondition: Prisma.AdminWhereInput[] = [];

  // search by using the searchTerm
  if (searchTerm) {
    andCondition.push({
      OR: AdminSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  // filter the data.
  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  andCondition.push({ isDeleted: false });

  const whereCondition: Prisma.AdminWhereInput = { AND: andCondition };

  const result = await prisma.admin.findMany({
    where: whereCondition,
    skip: skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
  });

  const total = await prisma.admin.count({ where: whereCondition });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleAdminService = async (id: string): Promise<Admin | null> => {
  const result = await prisma.admin.findUniqueOrThrow({
    where: { id, isDeleted: false },
  });

  return result;
};

const updateAdminService = async (
  id: string,
  data: Partial<Admin>
): Promise<Admin | null> => {
  await prisma.admin.findUniqueOrThrow({
    where: { id, isDeleted: false },
  });

  const result = await prisma.admin.update({
    where: { id },
    data,
  });

  return result;
};

const deleteAdminService = async (id: string): Promise<Admin | null> => {
  await prisma.admin.findUniqueOrThrow({
    where: { id },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    const deletedAdminData = await transactionClient.admin.delete({
      where: { id },
    });

    await transactionClient.user.delete({
      where: { email: deletedAdminData?.email },
    });

    return deletedAdminData;
  });

  return result;
};

const softDeleteAdminService = async (id: string): Promise<Admin | null> => {
  await prisma.admin.findUniqueOrThrow({
    where: { id, isDeleted: false },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    const deletedAdminData = await transactionClient.admin.update({
      where: { id },
      data: { isDeleted: true },
    });

    await transactionClient.user.update({
      where: { email: deletedAdminData?.email },
      data: { status: UserStatus.DELETED },
    });

    return deletedAdminData;
  });

  return result;
};

export const AdminServices = {
  getAllAdminsService,
  getSingleAdminService,
  updateAdminService,
  deleteAdminService,
  softDeleteAdminService,
};
