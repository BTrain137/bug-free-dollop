import React from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const HomePage = () => {
  const handleClick = (evt) => {
    axios
      .get("/api/meals/swap-all-meals")
      .then((result) => {
        console.log(result);
        toast("Running");
      })
      .catch((error) => {
        console.error(error);
        toast.error("Something went wrong sorry", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      });
  };
  return (
    <>
      <button onClick={() => handleClick()}>Run Update</button>
      <ToastContainer />
    </>
  );
};

export default HomePage;
