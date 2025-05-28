const express = require('express');
const cors = require('cors');
const { body, query, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const pool = require('./db/connection');
const config = require('./config');

const app = express();

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiting to all routes
app.use(limiter);

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Root route with API documentation
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to School Management API',
        version: '1.0.0',
        endpoints: {
            addSchool: {
                url: '/addSchool',
                method: 'POST',
                description: 'Add a new school',
                body: {
                    name: 'string (required)',
                    address: 'string (required)',
                    latitude: 'number (required, -90 to 90)',
                    longitude: 'number (required, -180 to 180)'
                },
                example: {
                    name: 'Green Valley School',
                    address: '123 Main St',
                    latitude: 12.9716,
                    longitude: 77.5946
                }
            },
            listSchools: {
                url: '/listSchools',
                method: 'GET',
                description: 'List schools sorted by proximity',
                query: {
                    latitude: 'number (required, -90 to 90)',
                    longitude: 'number (required, -180 to 180)'
                },
                example: '/listSchools?latitude=12.97&longitude=77.59'
            }
        },
        rateLimit: {
            windowMs: '15 minutes',
            max: '100 requests per IP'
        }
    });
});

// Validation middleware
const validateSchool = [
    body('name').notEmpty().trim().escape(),
    body('address').notEmpty().trim().escape(),
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 })
];

const validateCoordinates = [
    query('latitude').isFloat({ min: -90, max: 90 }),
    query('longitude').isFloat({ min: -180, max: 180 })
];

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Add School API
app.post('/addSchool', validateSchool, async (req, res) => {
    try {
        console.log('Received request body:', req.body);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, address, latitude, longitude } = req.body;
        
        console.log('Attempting to insert school:', { name, address, latitude, longitude });
        
        const [result] = await pool.query(
            'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
            [name, address, latitude, longitude]
        );

        console.log('School added successfully:', result);

        res.status(201).json({
            success: true,
            message: 'School added successfully',
            schoolId: result.insertId
        });
    } catch (error) {
        console.error('Error adding school:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding school',
            error: error.message
        });
    }
});

// List Schools API
app.get('/listSchools', validateCoordinates, async (req, res) => {
    try {
        console.log('Received query parameters:', req.query);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { latitude, longitude } = req.query;
        
        console.log('Fetching schools from database...');
        const [schools] = await pool.query('SELECT * FROM schools');
        console.log('Found schools:', schools);
        
        // Calculate distance and sort schools
        const schoolsWithDistance = schools.map(school => ({
            ...school,
            distance: calculateDistance(
                parseFloat(latitude),
                parseFloat(longitude),
                school.latitude,
                school.longitude
            )
        }));

        schoolsWithDistance.sort((a, b) => a.distance - b.distance);

        res.json({
            success: true,
            schools: schoolsWithDistance
        });
    } catch (error) {
        console.error('Error listing schools:', error);
        res.status(500).json({
            success: false,
            message: 'Error listing schools',
            error: error.message
        });
    }
});

// 404 handler
app.use((req, res) => {
    console.log('404 - Route not found:', req.url);
    res.status(404).json({
        success: false,
        message: 'Route not found',
        availableRoutes: ['/', '/addSchool', '/listSchools']
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler caught:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
    console.log(`API Documentation available at http://localhost:${config.port}/`);
}); 