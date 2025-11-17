import React, { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QRScanner = ({ onScanSuccess, qrRegionId = "qr-reader" }) => {
  const html5QrcodeScannerRef = useRef(null);

  useEffect(() => {
    const html5QrcodeScanner = new Html5Qrcode(qrRegionId);
    html5QrcodeScannerRef.current = html5QrcodeScanner;

    const config = { fps: 10, qrbox: 250 };

    html5QrcodeScanner.start(
      { facingMode: "environment" },
      config,
      (decodedText, decodedResult) => {
        // Success callback
        onScanSuccess(decodedText);
      },
      (errorMessage) => {
        // Optional: handle scan errors
        // console.warn(errorMessage);
      }
    ).catch((err) => console.error("QR start failed:", err));

    return () => {
      html5QrcodeScanner.stop().catch((err) => console.error("QR stop failed:", err));
    };
  }, [onScanSuccess, qrRegionId]);

  return <div id={qrRegionId} className="w-full h-96 border rounded" />;
};

export default QRScanner;
