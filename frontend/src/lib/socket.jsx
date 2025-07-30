import {io} from "socket.io-client";

const socket = io( import .meta.env.MODE === "development" ? "http://localhost:5000":"/", {
  withCredentials: true,
});

export default socket