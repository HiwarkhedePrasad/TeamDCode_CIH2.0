import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function JoinInterview() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    axios
      .get(`/api/interview/validate/${interviewId}`)
      .then((res) => {
        if (res.data.valid) {
          setStatus("valid");
          setTimeout(() => {
            window.open(`/interviewer/${interviewId}`, "_blank");
            window.open(`/vapi-ai/${interviewId}`, "_blank");
            navigate("/interview-room/" + interviewId);
          }, 1500);
        } else {
          setStatus("invalid");
        }
      })
      .catch(() => setStatus("invalid"));
  }, [interviewId]);

  if (status === "checking") return <div>Checking your interview link...</div>;
  if (status === "invalid") return <div>Invalid or expired link.</div>;

  return <div>Access granted. Preparing your interview...</div>;
}
