require('dotenv').config();

module.exports = {
    database: {
        // Update these values after installing MySQL
        host: process.env.DB_HOST || 'localhost',      // Usually 'localhost' or '127.0.0.1'
        user: process.env.DB_USER || 'root',          // Default MySQL user
        password: process.env.DB_PASS || 'Suresh@1234',          // Set this to your MySQL root password after installation
        database: process.env.DB_NAME || 'school_management'
    },
    port: process.env.PORT || 3000
}; 