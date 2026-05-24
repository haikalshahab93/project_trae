import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

function SelfieCapture({ value, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState("");

  const startCamera = async () => {
    setError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraReady(true);
    } catch (cameraError) {
      setError("Kamera tidak dapat diakses. Gunakan browser HTTPS atau upload selfie manual.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraReady(false);
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL("image/jpeg", 0.9));
  };

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => onCapture(reader.result);
    reader.readAsDataURL(file);
  };

  useEffect(() => stopCamera, []);

  return (
    <div className="selfie-capture">
      <div className="selfie-actions">
        <button type="button" onClick={startCamera}>
          Aktifkan Kamera
        </button>
        <button type="button" onClick={handleCapture} disabled={!cameraReady}>
          Ambil Selfie
        </button>
        <button type="button" onClick={stopCamera} disabled={!cameraReady}>
          Matikan Kamera
        </button>
      </div>

      <video ref={videoRef} autoPlay muted playsInline className="selfie-preview" />
      <canvas ref={canvasRef} hidden />

      <label className="upload-field">
        Upload Selfie Cadangan
        <input type="file" accept="image/*" onChange={handleUpload} />
      </label>

      {error && <p className="helper error-text">{error}</p>}
      {value && <img src={value} alt="Selfie preview" className="captured-selfie" />}
    </div>
  );
}

export default SelfieCapture;

SelfieCapture.propTypes = {
  value: PropTypes.string,
  onCapture: PropTypes.func.isRequired,
};
