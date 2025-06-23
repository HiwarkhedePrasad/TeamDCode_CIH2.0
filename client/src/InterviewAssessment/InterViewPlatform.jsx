import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const InterviewPlatform = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  //   useEffect(() => {
  //     axios
  //       .get(`/api/validate-link/${id}`)
  //       .then((res) => {
  //         if (res.data.valid) {
  //           window.open(`/interview/vapi/${id}`, "_blank");
  //         } else {
  //           alert("Invalid interview link.");
  //           navigate("/");
  //         }
  //       })
  //       .catch(() => {
  //         alert("Error validating interview link.");
  //         navigate("/");
  //       });
  //   }, [id]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-700">Loading Interview...</h1>
    </div>
  );
};

export default InterviewPlatform;
