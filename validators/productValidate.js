// middlewares/validateProductCreate.js

module.exports = (req, res, next) => {
    const requiredFields = ['productName', 'price', 'description', 'stock', 'size'];
    const sanitizedBody = {};

    for (const field of requiredFields) {
        const value = req.body[field];

        if (value === undefined || value === null || value === '') {
            return res.status(400).json({ error: `${field} is required.` });
        }

        switch (field) {
            case 'productName':
            case 'description':
                if (typeof value !== 'string') {
                    return res.status(400).json({ error: `${field} must be a string.` });
                }
                sanitizedBody[field] = value.trim();
                break;

            case 'price':
            case 'stock':
                const numVal = Number(value);
                if (isNaN(numVal)) {
                    return res.status(400).json({ error: `${field} must be a number.` });
                }
                sanitizedBody[field] = numVal;
                break;

            case 'size':
                if (!Array.isArray(value) || value.some(s => typeof s !== 'string')) {
                    return res.status(400).json({ error: `${field} must be an array of strings.` });
                }
                sanitizedBody[field] = value.map(s => s.trim());
                break;
        }
    }

    // Replace req.body with sanitized object containing ONLY required fields
    req.body = sanitizedBody;
    next();
};
