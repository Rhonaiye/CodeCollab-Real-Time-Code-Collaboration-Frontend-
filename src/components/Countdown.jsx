import React, { useState, useEffect } from 'react';

const CountdownBox = ({ value, label }) => (
  <div className="flex flex-col items-center bg-blue-600 rounded-lg p-4 w-24 h-24 shadow-lg transform hover:scale-105 transition-transform duration-200">
    <span className="text-3xl font-bold text-white mb-1">
      {value.toString().padStart(2, '0')}
    </span>
    <span className="text-blue-100 text-sm uppercase tracking-wider">
      {label}
    </span>
  </div>
);

const Countdown = () => {
  // Set a 4-day target from when the app is deployed/built
  const FOUR_DAYS_IN_MS = 4 * 24 * 60 * 60 * 1000;
  const DEPLOY_TIME = new Date('2025-01-06T00:00:00Z').getTime(); // Set this to your deployment time
  const TARGET_DATE = DEPLOY_TIME + FOUR_DAYS_IN_MS;

  const [timeLeft, setTimeLeft] = useState({
    days: 4,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const currentTime = new Date().getTime();
      const difference = TARGET_DATE - currentTime;

      if (difference > 0) {
        const newTimeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        };
        setTimeLeft(newTimeLeft);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">
          Anticipate Rentailz!
        </h1>
        
        <div className="flex flex-wrap justify-center gap-4">
          <CountdownBox value={timeLeft.days} label="Days" />
          <CountdownBox value={timeLeft.hours} label="Hours" />
          <CountdownBox value={timeLeft.minutes} label="Minutes" />
          <CountdownBox value={timeLeft.seconds} label="Seconds" />
        </div>

        <div className="mt-8 text-center text-blue-600 text-sm">
          Don't miss out! Limited time remaining.
        </div>
      </div>
    </div>
  );
};

export default Countdown;