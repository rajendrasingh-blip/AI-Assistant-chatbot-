import axiosBase from "./axios";

export const getSchoolDetails = (url: string, SchlCode: string) => {
  return axiosBase.post(url, { SchlCode });
}

export const getStudentsDetails = (url: string, body: any) => {
  return axiosBase.post(url, body);
}