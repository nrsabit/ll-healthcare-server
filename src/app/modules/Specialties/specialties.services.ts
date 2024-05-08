import { Request } from "express";
import { fileUploader } from "../../utils/fileUploader";
import { prisma } from "../../shared/prisma";
import { Specialties } from "@prisma/client";

const createSpecialtyService = async (req: Request) => {
  const file = req.file;
  if (file) {
    const uploadedIcon = await fileUploader.uploadToCloudinary(file);
    req.body.icon = uploadedIcon?.secure_url;
  }

  const result = await prisma.specialties.create({
    data: req.body,
  });

  return result;
};

const getAllSpecialtiesService = async (): Promise<Specialties[]> => {
  return await prisma.specialties.findMany();
};

const deleteSpecialtyService = async (id: string): Promise<Specialties> => {
  const result = await prisma.specialties.delete({
    where: {
      id,
    },
  });
  return result;
};

export const SpecialtiesServices = {
  createSpecialtyService,
  getAllSpecialtiesService,
  deleteSpecialtyService,
};
