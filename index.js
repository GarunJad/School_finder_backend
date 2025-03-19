import express from 'express';
import bodyParser from 'body-parser';
import { haversineDistance } from './utils.js';  // Assuming haversineDistance is defined in utils.js
import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;  // Use pg for PostgreSQL

// Configure dotenv to load environment variables
dotenv.config();

const app = express();
app.use(bodyParser.json());

// Supabase PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,  // Use Supabase DB URL from environment variables
    ssl: { rejectUnauthorized: false }  // Supabase requires SSL connections
});

pool.connect()
    .then(() => {
        console.log("Connected to the Supabase PostgreSQL database successfully.");
    })
    .catch((err) => {
        console.error("Database connection failed:", err);
    });

// Add School API
app.post('/addSchool', async (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    // Validate input
    if (!name || !address || !latitude || !longitude) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // Insert into PostgreSQL database
        const result = await pool.query(
            'INSERT INTO schools (name, address, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, address, latitude, longitude]
        );
        res.status(201).json({ message: 'School added successfully!', schoolId: result.rows[0].id });
    } catch (error) {
        console.error('Error adding school:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// List Schools API
app.get('/listSchools', async (req, res) => {
    const { latitude, longitude } = req.query;

    // Check if latitude and longitude are provided
    if (!latitude || !longitude) {
        return res.status(400).json({ error: "User latitude and longitude are required." });
    }

    try {
        // Fetch all schools from the database
        const result = await pool.query('SELECT id, name, address, latitude, longitude FROM schools');

        // Calculate distances and filter schools within a certain range (e.g., 50 km)
        const userLatitude = parseFloat(latitude);
        const userLongitude = parseFloat(longitude);
        const maxDistance = 50; // Example: maximum distance of 50 kilometers

        const nearbySchools = result.rows
            .map(school => {
                const distance = haversineDistance(
                    userLatitude,
                    userLongitude,
                    school.latitude,
                    school.longitude
                );
                return { ...school, distance };
            })
            //.filter(school => school.distance <= maxDistance) // Filter out schools beyond 50km
            .sort((a, b) => a.distance - b.distance); // Sort by distance (nearest first)

        // Send the filtered list of schools as the response
        res.status(200).json(nearbySchools);
    } catch (error) {
        console.error('Error fetching schools:', error.message);
        res.status(500).json({ error: 'Error fetching schools' });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
