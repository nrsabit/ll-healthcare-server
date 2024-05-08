import axios from "axios";
import { prisma } from "../../shared/prisma";
import { SSLService } from "../SSL/ssl.service";
import config from "../../config";
import { PaymentStatus } from "@prisma/client";

const initPaymentService = async (appointmentId: string) => {
  const paymentData = await prisma.payment.findFirstOrThrow({
    where: { appointmentId },
    include: { appointment: { include: { patient: true } } },
  });

  const paymentInfo = {
    amount: paymentData.amount,
    transactionId: paymentData.transactionId,
    name: paymentData.appointment.patient.name,
    email: paymentData.appointment.patient.email,
    address: paymentData.appointment.patient.address,
    phoneNumber: paymentData.appointment.patient.contactNumber,
  };

  const result = await SSLService.initPayment(paymentInfo);

  return { paymentUrl: result };
};

const validatePaymentService = async (payload: any) => {

  // we will verify the payment when our code is deployed to live, the commented code won't work now. 
  // if (!payload || !payload.status || !(payload.status === "VALID")) {
  //   return { message: "Invalid Payment" };
  // }

  // const response = await SSLService.validatePayment(payload);

  // if (response.status !== "VALID") {
  //   return { message: "Payment Failed" };
  // }

  // the line below is temporary to verify the payment locally, we will remove it when deployed to live. 
  // as the payload we will only send the tran_id now. 
  const response = payload;

  await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { transactionId: response.tran_id },
      data: { status: PaymentStatus.PAID, paymentGatewayData: response },
    });

    await tx.appointment.update({
      where: { id: updatedPayment.appointmentId },
      data: { paymentStatus: PaymentStatus.PAID },
    });
  });

  return { message: "Payment Success" };
};

export const PaymentServices = {
  initPaymentService,
  validatePaymentService,
};
