export type TSchedulePayload = {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
};

export type TScheduleFilters = {
  startDate?: string | undefined;
  endDate?: string | undefined;
};
