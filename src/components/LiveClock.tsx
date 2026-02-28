import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock } from "lucide-react";

interface LiveClockProps {
  compact?: boolean;
}

const LiveClock: React.FC<LiveClockProps> = ({ compact }) => {
  const [time, setTime] = useState(new Date());
  const [isAnalog, setIsAnalog] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // WAT = UTC+1
  const watOffset = 1;
  const utc = time.getTime() + time.getTimezoneOffset() * 60000;
  const wat = new Date(utc + watOffset * 3600000);

  const hours = wat.getHours();
  const minutes = wat.getMinutes();
  const seconds = wat.getSeconds();

  const formatDigital = () => {
    const h = hours.toString().padStart(2, "0");
    const m = minutes.toString().padStart(2, "0");
    const s = seconds.toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const hourDeg = (hours % 12) * 30 + minutes * 0.5;
  const minDeg = minutes * 6;
  const secDeg = seconds * 6;

  const size = compact ? 40 : 56;

  return (
    <button
      onClick={() => setIsAnalog(!isAnalog)}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer select-none"
      title="Toggle clock style (WAT)"
    >
      <AnimatePresence mode="wait">
        {isAnalog ? (
          <motion.svg
            key="analog"
            width={size}
            height={size}
            viewBox="0 0 100 100"
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -90 }}
            transition={{ duration: 0.3 }}
          >
            <circle cx="50" cy="50" r="46" fill="none" className="stroke-border" strokeWidth="3" />
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              return (
                <circle
                  key={i}
                  cx={50 + 38 * Math.cos(angle)}
                  cy={50 + 38 * Math.sin(angle)}
                  r={i % 3 === 0 ? 3 : 1.5}
                  className="fill-muted-foreground"
                />
              );
            })}
            {/* Hour hand */}
            <line
              x1="50" y1="50"
              x2={50 + 22 * Math.cos((hourDeg - 90) * (Math.PI / 180))}
              y2={50 + 22 * Math.sin((hourDeg - 90) * (Math.PI / 180))}
              className="stroke-foreground" strokeWidth="3" strokeLinecap="round"
            />
            {/* Minute hand */}
            <line
              x1="50" y1="50"
              x2={50 + 30 * Math.cos((minDeg - 90) * (Math.PI / 180))}
              y2={50 + 30 * Math.sin((minDeg - 90) * (Math.PI / 180))}
              className="stroke-foreground" strokeWidth="2" strokeLinecap="round"
            />
            {/* Second hand */}
            <line
              x1="50" y1="50"
              x2={50 + 34 * Math.cos((secDeg - 90) * (Math.PI / 180))}
              y2={50 + 34 * Math.sin((secDeg - 90) * (Math.PI / 180))}
              className="stroke-primary" strokeWidth="1" strokeLinecap="round"
            />
            <circle cx="50" cy="50" r="3" className="fill-primary" />
          </motion.svg>
        ) : (
          <motion.div
            key="digital"
            className="flex items-center gap-1.5"
            initial={{ opacity: 0, rotateY: -90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: 90 }}
            transition={{ duration: 0.3 }}
          >
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
              {formatDigital()}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">WAT</span>
    </button>
  );
};

export default LiveClock;
