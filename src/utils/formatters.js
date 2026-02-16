export const formatCurrency = (amount, currency = 'THB') => {
    // Map currency codes to symbols
    const currencySymbols = {
        'THB': '฿',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥'
    };

    const symbol = currencySymbols[currency] || currency;

    // Format the number with proper thousand separators
    const formattedAmount = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);

    return `${symbol}${formattedAmount}`;
};

export const getCurrencySymbol = (currency = 'THB') => {
    const currencySymbols = {
        'THB': '฿',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥'
    };

    return currencySymbols[currency] || currency;
};
