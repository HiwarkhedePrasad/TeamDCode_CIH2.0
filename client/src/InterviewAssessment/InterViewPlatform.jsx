import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const InterviewPlatform = () => {
  const { linkId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const validateLink = async () => {
      try {
        const res = await fetch(`/api/interview/validate/${linkId}`);
        const data = await res.json();

        if (data.valid) {
          window.open(`/interviewer?linkId=${linkId}`, "_blank");
          window.open(`/ai-agent?linkId=${linkId}`, "_blank");
        } else {
          alert("Invalid Interview Link");
          navigate("/");
        }
      } catch (err) {
        console.error(err);
        alert("Server error");
        navigate("/");
      }
    };

    validateLink();
  }, [linkId, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <h2 className="text-2xl font-bold">Validating Interview Link...</h2>
    </div>
  );
};

export default InterviewPlatform;
