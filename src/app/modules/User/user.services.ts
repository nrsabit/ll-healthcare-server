import {
  Admin,
  Doctor,
  Patient,
  Prisma,
  UserRole,
  UserStatus,
} from "@prisma/client";
import bcrypt from "bcrypt";
import { prisma } from "../../shared/prisma";
import { Request } from "express";
import { fileUploader } from "../../utils/fileUploader";
import { TFile } from "../../types/file.types";
import config from "../../config";
import { TPaginationOptions } from "../../types/pagination.type";
import sortPagination from "../../utils/sortPagination";
import { UserSearchableFields } from "./user.constant";
import { TAuthUser } from "../../types/common";

const createAdminService = async (req: Request): Promise<Admin> => {
  const file: TFile = req.file;
  const payload = req.body;

  if (file) {
    const uploadedProfilePhoto = await fileUploader.uploadToCloudinary(file);
    req.body.admin.profilePhoto = uploadedProfilePhoto?.secure_url;
  }

  const password: string = payload?.password || config.user_default_pass;
  const hashedPassword: string = await bcrypt.hash(password, 12);

  const userData = {
    email: payload?.admin?.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdAdminData = await transactionClient.admin.create({
      data: payload?.admin,
    });

    return createdAdminData;
  });

  return result;
};

const createDoctorService = async (req: Request): Promise<Doctor> => {
  const file: TFile = req.file;
  const payload = req.body;

  if (file) {
    const uploadedProfilePhoto = await fileUploader.uploadToCloudinary(file);
    req.body.doctor.profilePhoto = uploadedProfilePhoto?.secure_url;
  }

  const password: string = payload?.password || config.user_default_pass;
  const hashedPassword: string = await bcrypt.hash(password, 12);

  const userData = {
    email: payload?.doctor?.email,
    password: hashedPassword,
    role: UserRole.DOCTOR,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdDoctorData = await transactionClient.doctor.create({
      data: payload?.doctor,
    });

    return createdDoctorData;
  });

  return result;
};

const createPatientService = async (req: Request): Promise<Patient> => {
  const file: TFile = req.file;
  const payload = req.body;

  if (file) {
    const uploadedProfilePhoto = await fileUploader.uploadToCloudinary(file);
    req.body.patient.profilePhoto = uploadedProfilePhoto?.secure_url;
  }

  const password: string = payload?.password || config.user_default_pass;
  const hashedPassword: string = await bcrypt.hash(password, 12);

  const userData = {
    email: payload?.patient?.email,
    password: hashedPassword,
    role: UserRole.PATIENT,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdPatientData = await transactionClient.patient.create({
      data: payload?.patient,
    });

    return createdPatientData;
  });

  return result;
};

const getAllUsersService = async (query: any, options: TPaginationOptions) => {
  const { searchTerm, ...filterData } = query;
  const { page, limit, skip, sortBy, sortOrder } = sortPagination(options);
  const andCondition: Prisma.UserWhereInput[] = [];

  // search by using the searchTerm
  if (searchTerm) {
    andCondition.push({
      OR: UserSearchableFields.map((field) => ({
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

  const whereCondition: Prisma.UserWhereInput = { AND: andCondition };

  const result = await prisma.user.findMany({
    where: whereCondition,
    skip: skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    select: {
      id: true,
      email: true,
      role: true,
      needPasswordChange: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      admin: true,
      patient: true,
      doctor: true,
    },
  });

  const total = await prisma.user.count({ where: whereCondition });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const updateUserStatusService = async (
  id: string,
  status: { status: UserStatus }
) => {
  await prisma.user.findUniqueOrThrow({
    where: { id },
  });

  const updatedUser = await prisma.user.update({
    where: { id },
    data: status,
    select: {
      id: true,
      email: true,
      role: true,
      needPasswordChange: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      admin: true,
      patient: true,
      doctor: true,
    },
  });

  return updatedUser;
};

const getMyProfileService = async (user: TAuthUser) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: { email: user?.email, status: UserStatus.ACTIVE },
    select: {
      id: true,
      email: true,
      needPasswordChange: true,
      status: true,
      role: true,
    },
  });

  let userProfile;
  if (
    userInfo.role === UserRole.SUPER_ADMIN ||
    userInfo.role === UserRole.ADMIN
  ) {
    userProfile = await prisma.admin.findUnique({
      where: { email: userInfo.email },
    });
  } else if (userInfo.role === UserRole.DOCTOR) {
    userProfile = await prisma.doctor.findUnique({
      where: { email: userInfo.email },
    });
  } else if (userInfo.role === UserRole.PATIENT) {
    userProfile = await prisma.patient.findUnique({
      where: { email: userInfo.email },
    });
  }

  return { ...userInfo, ...userProfile };
};

const updateMyProfileService = async (user: TAuthUser, req: Request) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: { email: user?.email, status: UserStatus.ACTIVE },
  });

  const file = req.file;
  if (file) {
    const uploadedProfilePhoto = await fileUploader.uploadToCloudinary(file);
    req.body.profilePhoto = uploadedProfilePhoto?.secure_url;
  }

  let userProfile;
  if (
    userInfo.role === UserRole.SUPER_ADMIN ||
    userInfo.role === UserRole.ADMIN
  ) {
    userProfile = await prisma.admin.update({
      where: { email: userInfo.email },
      data: req.body,
    });
  } else if (userInfo.role === UserRole.DOCTOR) {
    userProfile = await prisma.doctor.update({
      where: { email: userInfo.email },
      data: req.body,
    });
  } else if (userInfo.role === UserRole.PATIENT) {
    userProfile = await prisma.patient.update({
      where: { email: userInfo.email },
      data: req.body,
    });
  }

  return { ...userProfile };
};

export const UserServices = {
  createAdminService,
  createDoctorService,
  createPatientService,
  getAllUsersService,
  updateUserStatusService,
  getMyProfileService,
  updateMyProfileService,
};
