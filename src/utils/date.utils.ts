/**
 * Returns today's date in YYYY-MM-DD format
 */
export const getTodayDateString = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Checks if a slot time is in the past for the given appointment date
 */
export const isSlotInPast = (appointmentDateStr: string, slotTimeStr: string): boolean => {
  if (!appointmentDateStr || !slotTimeStr) return false;

  const todayStr = getTodayDateString();

  // If appointment date is strictly in the past (before today)
  if (appointmentDateStr < todayStr) return true;
  // If appointment date is in the future (after today)
  if (appointmentDateStr > todayStr) return false;

  // Selected date is TODAY - Compare hours and minutes
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  let hours: number;
  let minutes: number;

  const upperSlot = slotTimeStr.trim().toUpperCase();

  // Handles 12-hour format e.g. "09:00 AM", "02:30 PM", "12:00 PM"
  if (upperSlot.includes("AM") || upperSlot.includes("PM")) {
    const isPM = upperSlot.includes("PM");
    const isAM = upperSlot.includes("AM");
    const cleanTime = upperSlot.replace(/(AM|PM)/g, "").trim();
    const parts = cleanTime.split(":");
    let h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;

    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;

    hours = h;
    minutes = m;
  } else {
    // Handles 24-hour format e.g. "09:00:00", "14:30"
    const parts = upperSlot.split(":");
    hours = parseInt(parts[0], 10) || 0;
    minutes = parseInt(parts[1], 10) || 0;
  }

  if (hours < currentHours) return true;
  if (hours === currentHours && minutes <= currentMinutes) return true;

  return false;
};

export type TimeframeFilter = "Weekly" | "Monthly" | "Yearly" | "Custom";

/**
 * Checks if a date falls within a given timeframe filter (Weekly, Monthly, Yearly, Custom)
 */
export const isDateInTimeframe = (
  dateInput: string | Date | undefined | null,
  timeframe: TimeframeFilter,
  customStart?: string,
  customEnd?: string
): boolean => {
  if (!dateInput) return true;

  let d: Date;
  if (typeof dateInput === "string") {
    const raw = dateInput.includes("T") ? dateInput.split("T")[0] : dateInput;
    if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const [y, m, day] = raw.split("-").map(Number);
      d = new Date(y, m - 1, day);
    } else {
      d = new Date(dateInput);
    }
  } else {
    d = new Date(dateInput);
  }

  if (isNaN(d.getTime())) return true;

  const now = new Date();
  now.setHours(23, 59, 59, 999);

  if (timeframe === "Weekly") {
    const past7 = new Date();
    past7.setDate(now.getDate() - 7);
    past7.setHours(0, 0, 0, 0);
    return d >= past7;
  }

  if (timeframe === "Monthly") {
    const past30 = new Date();
    past30.setDate(now.getDate() - 30);
    past30.setHours(0, 0, 0, 0);
    return d >= past30;
  }

  if (timeframe === "Yearly") {
    const past365 = new Date();
    past365.setDate(now.getDate() - 365);
    past365.setHours(0, 0, 0, 0);
    return d >= past365;
  }

  if (timeframe === "Custom") {
    if (customStart) {
      const startParts = customStart.split("-").map(Number);
      const start = new Date(startParts[0], startParts[1] - 1, startParts[2], 0, 0, 0, 0);
      if (d < start) return false;
    }
    if (customEnd) {
      const endParts = customEnd.split("-").map(Number);
      const end = new Date(endParts[0], endParts[1] - 1, endParts[2], 23, 59, 59, 999);
      if (d > end) return false;
    }
    return true;
  }

  return true;
};

/**
 * Returns dynamic chart labels and values based on selected timeframe filter
 */
export const getChartDataForTimeframe = (timeframe: TimeframeFilter) => {
  if (timeframe === "Weekly") {
    return {
      labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      data: [35, 48, 62, 55, 70, 85, 92],
    };
  }
  if (timeframe === "Monthly") {
    return {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      data: [210, 245, 290, 315],
    };
  }
  if (timeframe === "Yearly") {
    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      data: [850, 920, 1050, 1100, 1250, 1400, 1380, 1500, 1620, 1750, 1820, 1950],
    };
  }
  // Custom
  return {
    labels: ["Start", "Mid", "End"],
    data: [120, 185, 240],
  };
};
