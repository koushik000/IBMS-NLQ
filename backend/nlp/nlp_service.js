const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const { Client } = require('pg'); // For PostgreSQL
const axios = require('axios');
const { InfluxDB } = require('@influxdata/influxdb-client');
const chromadb = require('chromadb');


const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB setup
const mongoUrl = 'mongodb://admin:password@20.193.132.66:27017';
const mongoClient = new MongoClient(mongoUrl);

// TimescaleDB setup for time-series data
const timescaleClient = new Client({
  connectionString: 'postgresql://admin:password@20.193.132.66:5432/sensor_data'
});

// PostgreSQL setup for financial data
const financialsClient = new Client({
  connectionString: 'postgresql://admin:password@20.193.132.66:5433/finance'
});

// ChromaDB setup for vector search


const { ChromaClient } = require("chromadb");

const chromaClient = new ChromaClient({ path: "./vector_db" });



const influxDB = new InfluxDB({
  url: 'http://20.193.132.66:8086',
  token: 'YOUR_INFLUXDB_TOKEN' // Replace with your actual token
});

// Middleware
app.use(bodyParser.json());

app.post('/nlp', async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ message: "Text is required." });
    }

    const startDate = '2023-11-01T00:00:00Z';
    const endDate = '2023-11-07T23:59:59Z';

    try {
        // MongoDB: Retrieve challenge logs
        await mongoClient.connect();
        const challenges = await mongoClient.db('your_db').collection('challenges').find({
            timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }).toArray();

        // TimescaleDB: Retrieve energy consumption metrics
        await timescaleClient.connect();
        const velocityQuery = `
            SELECT * FROM sensor_readings 
            WHERE timestamp BETWEEN '${startDate}' AND '${endDate}';`;
        const velocityResults = await timescaleClient.query(velocityQuery);

        // PostgreSQL: Retrieve financial data
        await financialsClient.connect();
        const financialQuery = `SELECT * FROM energy_costs WHERE month BETWEEN '${startDate}' AND '${endDate}';`;
        const financialResults = await financialsClient.query(financialQuery);

        // InfluxDB: Query energy readout based on the measurement
        const queryApi = influxDB.getQueryApi('YOUR_ORG'); // Replace with your actual organization
        const fluxQuery = `from(bucket: "sensor_data")
                            |> range(start: ${startDate}, stop: ${endDate})
                            |> filter(fn: (r) => r._measurement == "sensor_readings")`;
        const influxResults = await queryApi.queryRows(fluxQuery);

        // ChromaDB: Query vector database (example)
        const vectorCollection = chromaClient.get_or_create_collection("documents");
        const embeddingsResponse = await vectorCollection.query({
            query_embeddings: [[0.15, 0.42, 0.80]], // Sample embedding
            n_results: 5
        });

        // Send results back to the client
        const response = {
            challenges,
            velocityMetrics: velocityResults.rows,
            financials: financialResults.rows,
            influxData: influxResults,
            vectorData: embeddingsResponse
        };

        res.json(response);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: "Error processing request", error: error.message });
    } finally {
        // Close all connections
        await mongoClient.close();
        await timescaleClient.end();
        await financialsClient.end();
    }
});

app.listen(PORT, () => {
    console.log(`NLP Service running on port ${PORT}`);
});