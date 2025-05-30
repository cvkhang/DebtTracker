-- Create the database (run this separately)
-- CREATE DATABASE debt_tracker;

-- Connect to the database
-- \c debt_tracker;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create people table
CREATE TABLE people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    total_debt DECIMAL(15,2) NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('debt', 'payment')),
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_transactions_person_id ON transactions(person_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_people_name ON people(name);

-- Create function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_last_updated()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last_updated
CREATE TRIGGER update_people_last_updated
    BEFORE UPDATE ON people
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at
CREATE TRIGGER update_people_updated_at
    BEFORE UPDATE ON people
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Create function to update person's total_debt after transaction
CREATE OR REPLACE FUNCTION update_total_debt()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.type = 'debt' THEN
            UPDATE people 
            SET total_debt = total_debt + NEW.amount
            WHERE id = NEW.person_id;
        ELSIF NEW.type = 'payment' THEN
            UPDATE people 
            SET total_debt = GREATEST(0, total_debt - NEW.amount)
            WHERE id = NEW.person_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.type = 'debt' THEN
            UPDATE people 
            SET total_debt = GREATEST(0, total_debt - OLD.amount)
            WHERE id = OLD.person_id;
        ELSIF OLD.type = 'payment' THEN
            UPDATE people 
            SET total_debt = total_debt + OLD.amount
            WHERE id = OLD.person_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update total_debt
CREATE TRIGGER update_person_total_debt
    AFTER INSERT OR DELETE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_total_debt();

-- Create view for person summary
CREATE VIEW person_summary AS
SELECT 
    p.id,
    p.name,
    p.total_debt,
    p.last_updated,
    COUNT(t.id) as total_transactions,
    MAX(t.date) as last_transaction_date
FROM people p
LEFT JOIN transactions t ON p.id = t.person_id
GROUP BY p.id, p.name, p.total_debt, p.last_updated;

-- Create view for debt ranking
CREATE VIEW debt_ranking AS
SELECT 
    p.id,
    p.name,
    p.total_debt,
    p.last_updated,
    RANK() OVER (ORDER BY p.total_debt DESC) as rank,
    ROUND((p.total_debt / NULLIF((SELECT SUM(total_debt) FROM people), 0)) * 100, 1) as percentage_of_total
FROM people p
WHERE p.total_debt > 0
ORDER BY p.total_debt DESC; 