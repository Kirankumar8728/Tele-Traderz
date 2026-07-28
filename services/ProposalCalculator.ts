// services/ProposalCalculator.ts

export interface ProposalCalculationResult {
  profit: number;
  returnPercentage: number;
}

export class ProposalCalculator {
  /**
   * Safely calculates the estimated profit.
   * Profit = Payout - Stake
   */
  public static calculateProfit(payout: number | string | undefined, stake: number | string | undefined): number {
    if (payout === undefined || stake === undefined) return 0;
    
    const parsedPayout = typeof payout === 'string' ? parseFloat(payout) : payout;
    const parsedStake = typeof stake === 'string' ? parseFloat(stake) : stake;

    if (isNaN(parsedPayout) || isNaN(parsedStake)) return 0;
    
    return parsedPayout - parsedStake;
  }

  /**
   * Safely calculates the return percentage.
   * Return % = (Profit / Stake) * 100
   */
  public static calculateReturnPercentage(payout: number | string | undefined, stake: number | string | undefined): number {
    if (payout === undefined || stake === undefined) return 0;

    const parsedPayout = typeof payout === 'string' ? parseFloat(payout) : payout;
    const parsedStake = typeof stake === 'string' ? parseFloat(stake) : stake;

    if (isNaN(parsedPayout) || isNaN(parsedStake) || parsedStake === 0) return 0;

    const profit = parsedPayout - parsedStake;
    return (profit / parsedStake) * 100;
  }

  /**
   * Calculates both profit and return percentage for a contract.
   */
  public static calculate(payout: number | string | undefined, stake: number | string | undefined): ProposalCalculationResult {
    return {
      profit: this.calculateProfit(payout, stake),
      returnPercentage: this.calculateReturnPercentage(payout, stake)
    };
  }
}

export default ProposalCalculator;
