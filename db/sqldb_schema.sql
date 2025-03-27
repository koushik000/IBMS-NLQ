CREATE TABLE energy_costs (
    month DATE NOT NULL,
    building VARCHAR(50) NOT NULL,
    cost_usd DECIMAL(10,2) NOT NULL,
    kwh_consumed INT NOT NULL,
    PRIMARY KEY (month, building)
);
