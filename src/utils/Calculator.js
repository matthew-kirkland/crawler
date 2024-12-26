export class Calculator {
  static hasArb(odds1, odds2) {
    return ((1 / odds1) + (1 / odds2) < 1);
  }

  static splitMoney(total, odds1, odds2) {
    const lowerBound = total / odds1;
    const upperBound = total - total / odds2;
    const average = (upperBound + lowerBound) / 2;
    let money1;
    if (upperBound - lowerBound >= 10) {
      const closestMultiple = Math.round(average / 10) * 10;
      money1 = Math.min(Math.max(closestMultiple, Math.ceil(lowerBound / 10) * 10), Math.floor(upperBound / 10) * 10);
    } else if (upperBound - lowerBound >= 5) {
      const closestMultiple = Math.round(average / 5) * 5;
      money1 = Math.min(Math.max(closestMultiple, Math.ceil(lowerBound / 5) * 5), Math.floor(upperBound / 5) * 5);
    } else if (upperBound - lowerBound >= 1) {
      const closestMultiple = Math.ceil(average);
      money1 = Math.min(Math.max(closestMultiple, Math.ceil(lowerBound)), Math.floor(upperBound));
    } else {
      return null;
    }
    const money2 = total - money1;
    return {
      money1: money1,
      money2: money2,
    };
  }

  static expectedProfit(odds1, odds2) {
    return (1 - (1 / odds1) - (1 / odds2));
  }
}