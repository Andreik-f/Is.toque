import { api } from "@/lib/api-client.js";
import { createCompanyApi } from "../utils/company-api.js";

export const { getCompany, sendPhoneCode, confirmPhoneCode, saveCompanyPhone } =
  createCompanyApi(api);
