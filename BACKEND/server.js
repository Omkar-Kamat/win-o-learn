import 'dotenv/config';
import app from './app.js';
import logger from './utils/logger.js';
import connectDB from './config/db.js';
const PORT = process.env.PORT || 3e3;
connectDB().then(() => {
    app.listen(PORT, () => {
        logger.info(`Server running on http://localhost:${PORT}`);
    });
});
