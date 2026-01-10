exports.calculateSpamLikelihood = (reportCount) => {
  // Convert number of reports into a readable level
  // You can adjust these thresholds based on your needs

  if (reportCount === 0) {
    return {
      level: "Not Spam",
      count: 0,
      percentage: 0,
      color: "green",
    };
  }

  if (reportCount <= 2) {
    return {
      level: "Low",
      count: reportCount,
      percentage: 20,
      color: "yellow",
    };
  }

  if (reportCount <= 5) {
    return {
      level: "Medium",
      count: reportCount,
      percentage: 50,
      color: "orange",
    };
  }

  if (reportCount <= 10) {
    return {
      level: "High",
      count: reportCount,
      percentage: 75,
      color: "red",
    };
  }

  return {
    level: "Very High",
    count: reportCount,
    percentage: 95,
    color: "darkred",
  };
};
