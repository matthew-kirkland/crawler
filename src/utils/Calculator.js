export class Calculator {
  static hasArb(odds1, odds2) {
    return ((1 / odds1) + (1 / odds2) < 1);
  }

  static moneySplit(total, odds1, odds2) {
    let money1;
    let money2;
    if (odds2 >= odds1) {
        money2 = total / odds2;
        money1 = total - money2;
    } else {
        money1 = total / odds1;
        money2 = total - money1;
    }
    return {
        money1: money1,
        money2: money2,
    };
  }

  static profit(odds1, odds2) {
    return (1 - (1 / odds1) - (1 / odds2));
  }
}