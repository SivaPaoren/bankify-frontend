export const formatCurrency = (amount, currency = 'THB') => {
    // Map currency codes to symbols
    const currencySymbols = {
        'THB': '฿',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'CHF': 'Fr.'
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
        'CHF': 'Fr.'
    };

    return currencySymbols[currency] || currency;
};

/**
 * Determines the visual sign and color for a transaction based on the user's account ID.
 */
export const getTransactionDisplay = (tx, currentAccountId) => {
    const isWithdraw = tx.type === 'WITHDRAW' || tx.type === 'WITHDRAWAL';
    const isDeposit = tx.type === 'DEPOSIT';
    const isTransfer = tx.type === 'TRANSFER';
    
    // If user is the sender (fromAccountId matches) or it's a withdrawal
    if (isWithdraw || (isTransfer && tx.fromAccountId === currentAccountId)) {
        return { sign: '-', colorClass: 'text-red-400' };
    }
    
    // If user is the receiver (toAccountId matches) or it's a deposit
    if (isDeposit || (isTransfer && tx.toAccountId === currentAccountId)) {
        return { sign: '+', colorClass: 'text-emerald-500' };
    }

    return { sign: '', colorClass: 'text-white' };
};