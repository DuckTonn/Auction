import { useState, useEffect } from 'react'
import { formatDate } from './productDetail.utils.jsx'

export default function AuctionCountdown({ endTime, formatDate }) {
  const [relative, setRelative] = useState(true);
  const [display, setDisplay] = useState("");

  useEffect(() => {
    const update = () => {
        const now = new Date().getTime();
        const end = new Date(endTime).getTime();
        const diff = end - now;

        if (diff <= 0) {
            setDisplay("Đã kết thúc");
            setRelative(false);
            return;
        }

        const minutes = Math.floor(diff / 1000 / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days >= 3) {
            setDisplay(formatDate(endTime));
            setRelative(false);
            return;
        }

        if (days >= 1) {
            setDisplay(`${days} Ngày Nữa`);
        } else if (hours >= 1) {
            setDisplay(`${hours} Giờ ${minutes % 60} Phút Nữa`);
        } else {
            setDisplay(`${minutes} Phút Nữa`);
        }
    };

    update();

    const intervalId = setInterval(update, 60000);
    return () => clearInterval(intervalId);
  }, [endTime]);

  return <div className="flex justify-between"><span>Thời điểm kết thúc:</span><span className={`${relative ? 'text-red-500 font-bold' : 'text-gray-800 font-medium'}`}>{display}</span></div>;
}
