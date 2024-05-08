export const doctorScheduleFilterableFields = [
  "startDate",
  "endDate",
  "searchTerm",
  "isBooked",
  "doctorId",
];

export type TDoctorScheduleFilterRequest = {
  searchTerm?: string | undefined;
  isBooked?: boolean | undefined;
};
