import React, { useEffect, useState } from 'react';

export default function DateTime() {
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    function update() {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear().toString().slice(-2);
      const hour = String(now.getHours()).padStart(2, '0');
      const minute = String(now.getMinutes()).padStart(2, '0');
      setDateStr(`${day}.${month}.${year}`);
      setTimeStr(`${hour}:${minute}`);
    }

    update();
    const intervalId = setInterval(update, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="date-time">
      <div id="current-date">{dateStr}</div>
      <div id="current-time">{timeStr}</div>
    </div>
  );
}