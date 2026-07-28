// services/ProposalFormatter.ts

export class ProposalFormatter {
  private static currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    AUD: 'A$',
    CAD: 'C$',
    BTC: '₿',
    ETH: 'Ξ'
  };

  /**
   * Formats a number into a thousands-separated currency format.
   * e.g. 1234.56 -> $1,234.56
   */
  public static formatCurrency(amount: number | string | undefined, currency: string = 'USD'): string {
    if (amount === undefined) return '--';
    const parsed = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(parsed)) return '--';

    const symbol = this.currencySymbols[currency.toUpperCase()] || currency.toUpperCase() + ' ';
    const formattedNum = parsed.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return `${symbol}${formattedNum}`;
  }

  /**
   * Formats a return percentage.
   * e.g. 87.2 -> 87.20%
   */
  public static formatPercentage(pct: number | undefined): string {
    if (pct === undefined || isNaN(pct)) return '--%';
    const formattedNum = pct.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${formattedNum}%`;
  }

  /**
   * Formats profit with a leading plus or minus.
   * e.g. 8.72 -> +$8.72 or -5.00 -> -$5.00
   */
  public static formatProfit(profit: number | undefined, currency: string = 'USD'): string {
    if (profit === undefined || isNaN(profit)) return '--';
    const absProfit = Math.abs(profit);
    const formattedValue = this.formatCurrency(absProfit, currency);
    
    if (profit > 0) {
      return `+${formattedValue}`;
    } else if (profit < 0) {
      return `-${formattedValue}`;
    } else {
      return formattedValue;
    }
  }

  /**
   * Formats raw epoch/timestamp into readable relative or absolute time.
   */
  public static formatTimestamp(timestampMs: number): string {
    const secondsAgo = Math.max(0, Math.floor((Date.now() - timestampMs) / 1000));
    if (secondsAgo < 1) return 'Just now';
    if (secondsAgo < 60) return `${secondsAgo} sec${secondsAgo === 1 ? '' : 's'} ago`;
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `${minutesAgo} min${minutesAgo === 1 ? '' : 's'} ago`;
  }
}

export default ProposalFormatter;
