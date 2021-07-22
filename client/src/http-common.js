import axios from "axios";

export default axios.create({
  // baseURL: "http://localhost:8081/api",
  baseURL: "/api",
  // baseURL: "https://nodejs-react-mysql-sykang.herokuapp.com/api",
  headers: {
    "Content-type": "application/json",
  },
});
