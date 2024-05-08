import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import axios from "axios";
import config from "../../config";
import { TPaymentData } from "./ssl.types";

const initPayment = async (paymentData: TPaymentData) => {
  try {
    const data = {
      store_id: config.ssl.storeId,
      store_passwd: config.ssl.storePass,
      total_amount: paymentData.amount,
      currency: "BDT",
      tran_id: paymentData.transactionId, // use unique tran_id for each api call
      success_url: config.ssl.successUrl,
      fail_url: config.ssl.failUrl,
      cancel_url: config.ssl.cancelUrl,
      ipn_url: config.ssl.ipnUrl,
      shipping_method: "N/A",
      product_name: "Appointment Fee",
      product_category: "Health Service",
      product_profile: "N/A",
      cus_name: paymentData.name,
      cus_email: paymentData.email,
      cus_add1: paymentData.address,
      cus_add2: "N/A",
      cus_city: "N/A",
      cus_state: "N/A",
      cus_postcode: "N/A",
      cus_country: "Bangladesh",
      cus_phone: paymentData.phoneNumber,
      cus_fax: "N/A",
      ship_name: "N/A",
      ship_add1: "N/A",
      ship_add2: "N/A",
      ship_city: "N/A",
      ship_state: "N/A",
      ship_postcode: 1000,
      ship_country: "Bangladesh",
    };

    const response = await axios({
      method: "post",
      url: config.ssl.paymentApi,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data,
    });

    return response.data.GatewayPageURL;
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Payment error occured");
  }
};

const validatePayment = async (payload: any) => {
  try {
    const response = await axios({
      method: "GET",
      url: `${config.ssl.validationUrl}?val_id=${payload.val_id}&store_id=${config.ssl.storeId}&store_passwd=${config.ssl.storePass}&format=json`,
    });
    return response.data;
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Payment Validation Failed");
  }
};

export const SSLService = {
  initPayment,
  validatePayment,
};
