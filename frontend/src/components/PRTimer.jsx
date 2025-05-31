import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const PRTimer = ({ endTime, onExpired }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const endTimeMs = new Date(endTime).getTime();
      const difference = endTimeMs - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          isExpired: false,
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        
        if (onExpired) {
          onExpired();
        }
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpired]);

  if (timeLeft.isExpired) {
    return (
      <div className="flex items-center gap-2 text-red-600 font-semibold">
        <Clock size={16} />
        <span>PR Period Ended</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Clock size={16} />
        <span className="font-semibold text-sm">PR Ends In:</span>
      </div>
      
      <div className="flex gap-2 text-center">
        {timeLeft.days > 0 && (
          <div className="bg-white bg-opacity-20 rounded px-2 py-1">
            <div className="text-lg font-bold">{timeLeft.days}</div>
            <div className="text-xs opacity-90">Days</div>
          </div>
        )}
        
        <div className="bg-white bg-opacity-20 rounded px-2 py-1">
          <div className="text-lg font-bold">{timeLeft.hours}</div>
          <div className="text-xs opacity-90">Hours</div>
        </div>
        
        <div className="bg-white bg-opacity-20 rounded px-2 py-1">
          <div className="text-lg font-bold">{timeLeft.minutes}</div>
          <div className="text-xs opacity-90">Min</div>
        </div>
        
        <div className="bg-white bg-opacity-20 rounded px-2 py-1">
          <div className="text-lg font-bold">{timeLeft.seconds}</div>
          <div className="text-xs opacity-90">Sec</div>
        </div>
      </div>
    </div>
  );
};

export default PRTimer; 