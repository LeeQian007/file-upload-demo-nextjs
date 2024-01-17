import axios from "axios";
import qs from "qs";
export const instanceAxios = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "multipart/form-data",
  },
  // `transformRequest` allows changes to the request data before it is sent to the server
  // This is only applicable for request methods 'PUT', 'POST', 'PATCH' and 'DELETE'
  // The last function in the array must return a string or an instance of Buffer, ArrayBuffer,
  // FormData or Stream
  // You may modify the headers object.
  transformRequest: [
    (data, headers) => {
      if (headers["Content-Type"] === "application/x-www-form-urlencoded") {
        return qs.stringify(data);
      }
      if (headers["Content-Type"] === "multipart/form-data") {
        return data;
      }
      return JSON.stringify(data);
    },
  ],
});
