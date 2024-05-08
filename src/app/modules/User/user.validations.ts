import { Gender, UserStatus } from "@prisma/client";
import { z } from "zod";

const createAdminSchema = z.object({
  password: z.string().optional(),
  admin: z.object({
    name: z.string({ required_error: "Name is Required" }),
    email: z.string({ required_error: "Email is Required" }),
    contactNumber: z.string({ required_error: "Contact Number is Required" }),
  }),
});

const createDoctorSchema = z.object({
  password: z.string().optional(),
  doctor: z.object({
    name: z.string({ required_error: "Name is Required" }),
    email: z.string({ required_error: "Email is Required" }),
    contactNumber: z.string({ required_error: "Contact Number is Required" }),
    address: z.string().optional(),
    registrationNumber: z.string({
      required_error: "Registration Number is Required",
    }),
    experience: z.number().optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE]),
    appointmentFee: z.number({ required_error: "Appointment Fee is Required" }),
    qualification: z.string({ required_error: "Qualification is Required" }),
    currentWorkingPlace: z.string({
      required_error: "Current Working place is required",
    }),
    designation: z.string({ required_error: "Designation is required" }),
  }),
});

const createPatientSchema = z.object({
  password: z.string(),
  patient: z.object({
    email: z
      .string({
        required_error: "Email is required!",
      })
      .email(),
    name: z.string({
      required_error: "Name is required!",
    }),
    contactNumber: z.string({
      required_error: "Contact number is required!",
    }),
    address: z.string().optional(),
  }),
});

const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED]),
  }),
});

export const UserValidations = {
  createAdminSchema,
  createDoctorSchema,
  createPatientSchema,
  updateUserStatusSchema,
};
