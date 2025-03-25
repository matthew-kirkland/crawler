export class Calculator {
  static hasArb_2bet(odds1, odds2) {
    return ((1 / odds1) + (1 / odds2) < 1);
  }
  
  static splitMoney_2bet(total, odds1, odds2) {
    const lowerBound = total / odds1;
    const upperBound = total - total / odds2;
    const money1 = this.findOptVal(lowerBound, upperBound);
    if (money1 == null) return null;
    
    const money2 = total - money1;
    return {
      money1: money1,
      money2: money2,
    };
  }
  
  static expectedProfit_2bet(odds1, odds2) {
    return (1 - (1 / odds1) - (1 / odds2));
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////// 3 WAY CALCULATOR ////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////

  static hasArb_3bet(odds1, odds2, odds3) {
    return ((1 / odds1) + (1 / odds2) + (1 / odds3) < 1);
  }

  static splitMoney_3bet(total, odds1, odds2, odds3) {
    const lowerBound_1 = total / odds1;
    const upperBound_1 = total - (total / odds2) - (total / odds3);
    const money1 = this.findOptVal(lowerBound_1, upperBound_1);
    if (money1 == null) return null;

    const lowerBound_2 = total / odds2;
    const upperBound_2 = total - (total / odds3) / money1;
    const money2 = this.findOptVal(lowerBound_2, upperBound_2);
    if (money2 == null) return null;

    const money3 = total - money1 - money2;
    if (money3 == null) return null;

    return {
      money1: money1,
      money2: money2,
      money3: money3,
    };
  }
  
  static expectedProfit_3bet(odds1, odds2, odds3) {
    return (1 - (1 / odds1) - (1 / odds2) - (1 / odds3));
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////

  static findOptVal(lowerBound, upperBound) {
    const average = (upperBound + lowerBound) / 2;
    let value, closestMultiple;
    if (upperBound - lowerBound >= 10) {
      // Find the closest multiple of 10 to the midpoint of upper and lower bound
      closestMultiple = Math.round(average / 10) * 10;
      value = Math.min(Math.max(closestMultiple, Math.ceil(lowerBound / 10) * 10), Math.floor(upperBound / 10) * 10);
    } else if (upperBound - lowerBound >= 5) {
      // Find the closest multiple of 5 to the midpoint of upper and lower bound
      closestMultiple = Math.round(average / 5) * 5;
      value = Math.min(Math.max(closestMultiple, Math.ceil(lowerBound / 5) * 5), Math.floor(upperBound / 5) * 5);
    } else if (upperBound - lowerBound >= 1) {
      // Find the closest multiple of 1 to the midpoint of upper and lower bound
      closestMultiple = Math.ceil(average);
      value = Math.min(Math.max(closestMultiple, Math.ceil(lowerBound)), Math.floor(upperBound));
    } else {
      return null;
    }
    return value;
  }
}