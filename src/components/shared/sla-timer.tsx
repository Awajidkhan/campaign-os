"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Clock } from "lucide-react";

interface SLATimerProps {
  deadline: Date | string;
  compact?: boolean;
}

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isOverdue: boolean;
  isWarning: boolean;
  isCritical: boolean;
}

function calculateTimeRemaining(deadline: Date | string): TimeRemaining {
  const now = new Date();
  const deadlineDate = typeof deadline === "string" ? new Date(deadline) : deadline;
  const diffMs = deadlineDate.getTime() - now.getTime();
  const totalSeconds = Math.floor(diffMs / 1000);

  const isOverdue = totalSeconds < 0;
  const absTotalSeconds = Math.abs(totalSeconds);
  const hours = Math.floor(absTotalSeconds / 3600);
  const minutes = Math.floor((absTotalSeconds % 3600) / 60);
  const seconds = absTotalSeconds % 60;

  const isCritical = totalSeconds > 0 && totalSeconds < 1800; // < 30 min
  const isWarning = totalSeconds > 0 && totalSeconds < 7200; // < 2 hours

  return {
    hours,
    minutes,
    seconds,
    totalSeconds,
    isOverdue,
    isWarning,
    isCritical,
  };
}

export function SLATimer({ deadline, compact = false }: SLATimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    calculateTimeRemaining(deadline)
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeRemaining(calculateTimeRemaining(deadline));

    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(deadline));
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  if (!mounted) {
    return null;
  }

  const getStatusColor = () => {
    if (timeRemaining.isOverdue) {
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700";
    }
    if (timeRemaining.isCritical) {
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700";
    }
    if (timeRemaining.isWarning) {
      return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700";
    }
    return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700";
  };

  const statusColor = getStatusColor();
  const shouldPulse = timeRemaining.isOverdue || timeRemaining.isCritical;

  const timeString = timeRemaining.isOverdue
    ? `${timeRemaining.hours}h ${timeRemaining.minutes}m overdue`
    : `${timeRemaining.hours}h ${timeRemaining.minutes}m`;

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor} ${
          shouldPulse ? "animate-pulse" : ""
        }`}
      >
        {shouldPulse ? (
          <AlertCircle className="w-3 h-3" />
        ) : (
          <Clock className="w-3 h-3" />
        )}
        {timeString}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${statusColor} ${
        shouldPulse ? "animate-pulse" : ""
      }`}
    >
      {shouldPulse ? (
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
      ) : (
        <Clock className="w-5 h-5 flex-shrink-0" />
      )}
      <div className="flex-1">
        <div className="text-sm font-semibold">
          {timeRemaining.isOverdue ? "Overdue" : "Time Remaining"}
        </div>
        <div className="text-xs opacity-75 mt-0.5">
          {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
        </div>
      </div>
    </div>
  );
}
