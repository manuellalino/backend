module.exports = handler => async (req, res, next) => {
    try {
        await handler(req, res, next);
    } catch (error) {
        if (res.headersSent) return next(error);
        return res.status(500).send({ error });
    }
};
