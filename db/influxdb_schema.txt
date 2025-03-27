CREATE DATABASE sensor_data;

CREATE RETENTION POLICY "30d_policy" ON "sensor_data" DURATION 30d REPLICATION 1 DEFAULT;

CREATE MEASUREMENT "sensor_readings" (
    timestamp TIMESTAMP,
    sensor_id STRING,
    value FLOAT,
    unit STRING
);
