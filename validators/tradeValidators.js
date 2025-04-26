const validateTradeInput = (body, type) => {
    const errors = [];
    if (!body.stock_name || typeof body.stock_name !== 'string') {
        errors.push('Stock name is required and must be a string');
    }

    if (body.quantity === undefined || !Number.isInteger(body.quantity)) {
        errors.push('Quantity is required and must be an integer');
    }

    if ((!body.broker_name || typeof body.broker_name !== 'string') && type === 'buy') {
        errors.push('Broker name is required and must be a string');
    }

    if (body.price === undefined || typeof body.price !== 'number' || body.price < 0) {
        errors.push('Price is required and must be a positive number');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}


module.exports = { validateTradeInput };