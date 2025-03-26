/**
 * The main bulk of the arbitrage detection/calculation process.
 * 
 * IMPORTANT: when using this calculator, the following must be ensured:
 * - odds1 corresponds to the odds for TEAM1
 * - odds2 corresponds to the odds for TEAM2
 * - odds3 corresponds to the odds for A DRAW
 * 
 * These rules must be followed when calling any of these functions. E.g;
 * Calculator.splitMoney_3bet(event.team1Odds, event.team2Odds, event.drawOdds) is CORRECT
 * Calculator.splitMoney_3bet(event.team1Odds, event.drawOdds, event.team2Odds) is INCORRECT
 */
export class Calculator {
  /**
   * Detects if arbitrage exists between the two given odds
   * @param {number} odds1 odds for TEAM1
   * @param {number} odds2 odds for TEAM2
   * @returns {boolean} true if arbitrage exists, false otherwise
   */
  static hasArb_2bet(odds1, odds2) {
    return ((1 / odds1) + (1 / odds2) < 1);
  }
  
  /**
   * Determines how the money should best be split to avoid suspicion
   * @param {number} total the total money to be split
   * @param {number} odds1 odds for TEAM1
   * @param {number} odds2 odds for TEAM2
   * @returns {object} the split of money
   */
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
  
  /**
   * Determines the expected profit from this 2-way arbitrage event
   * @param {number} odds1 odds for TEAM1
   * @param {number} odds2 odds for TEAM2
   * @returns {number} the expected profit as a decimal
   */
  static expectedProfit_3bet(odds1, odds2, odds3) {
    return (1 - (1 / odds1) - (1 / odds2) - (1 / odds3));
  }
  static expectedProfit_2bet(odds1, odds2) {
    return (1 - (1 / odds1) - (1 / odds2));
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////// 3 WAY CALCULATOR ////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Detects if arbitrage exists between the three given odds
   * @param {number} odds1 odds for TEAM1
   * @param {number} odds2 odds for TEAM2
   * @param {number} odds3 odds for DRAW
   * @returns {boolean} true if arbitrage exists, false otherwise
   */
  static hasArb_3bet(odds1, odds2, odds3) {
    return ((1 / odds1) + (1 / odds2) + (1 / odds3) < 1);
  }

  /**
   * Determines how the money should best be split to avoid suspicion
   * @param {number} total the total money to be split
   * @param {number} odds1 odds for TEAM1
   * @param {number} odds2 odds for TEAM2
   * @param {number} odds3 odds for DRAW
   * @returns {object} the split of money
   */
  static splitMoney_3bet(total, odds1, odds2, odds3) {
    const lowerBound_1 = total / odds1;
    const upperBound_1 = total - (total / odds2) - (total / odds3);
    const money1 = this.findOptVal(lowerBound_1, upperBound_1);
    if (money1 == null) return null;

    const lowerBound_2 = total / odds2;
    const upperBound_2 = total - (total / odds3) - money1;
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
  
  /**
   * Determines the expected profit from this 3-way arbitrage event
   * @param {number} odds1 odds for TEAM1
   * @param {number} odds2 odds for TEAM2
   * @param {number} odds3 odds for DRAW
   * @returns {number} the expected profit as a decimal
   */
  static expectedProfit_3bet(odds1, odds2, odds3) {
    return (1 - (1 / odds1) - (1 / odds2) - (1 / odds3));
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * This function finds the least suspicious value in between the upper and lower bound.
   * A "least suspicious value" is a value that is most round number that can fit between
   * lowerBound and upperBound. Any bet that is a multiple of 10 is probably not cause for
   * suspicion from the bookmaker's perspective. A bet that is a multiple of 5 (but not 10)
   * might start to raise some eyebrows. A bet that is a multiple of 1 (but not 5 or 10) should
   * be treated with caution. If the profit margin of the bet is so small that the bet value
   * must be a decimal, it is deemed to be too suspicious.
   * 
   * Here we make use of some similar facts:
   * - If the upper and lower bound differ by at least 10, there must be a multiple of 10
   *   in between them.
   * - Otherwise, if they differ by at least 5, there must be a multiple of 5 in between
   *   them.
   * - Otherwise, if they differ by at least 1, there must be a multiple of 1 in between
   *   them.
   * - Otherwise, the bet is too suspicious and null is returned.
   * 
   * To generally spread profit evenly across different outcomes, we seek a non-suspicious
   * value that is close to the midpoint of the upper and lower bound.
   * @param {number} lowerBound
   * @param {number} upperBound 
   * @returns {number} the least suspicious value between lowerBound and upperBound
   */
  static findOptVal(lowerBound, upperBound) {
    if (lowerBound == upperBound) return lowerBound;

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
