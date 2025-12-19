-- Active: 1730128115994@@127.0.0.1@5432
CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE plant (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id INTEGER NOT NULL REFERENCES "user"(id)
);

CREATE TABLE pot (
    id SERIAL PRIMARY KEY,
    plant_id INTEGER REFERENCES plant(id),
    owner_id INTEGER REFERENCES "user"(id)
);

CREATE TABLE task (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE measurement (
    id SERIAL PRIMARY KEY ,
    timestamp TIMESTAMP NOT NULL,
    moisture REAL NOT NULL,
    light REAL NOT NULL,
    temperature REAL NOT NULL,
    humidity REAL NOT NULL,
    pot INTEGER NOT NULL REFERENCES pot(id)
);