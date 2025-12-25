use crate::entities::{Measurement, MeasurementDb};
use anyhow::{Result, anyhow};
use log::error;
use sqlx::{Pool, Postgres, types::chrono::NaiveDateTime};

pub async fn create_measurement(
    pool: &Pool<Postgres>,
    pot: i32,
    moisture: f32,
    temperature: f32,
    light_level: f32,
    humidity: f32,
    battery_level: i32,
    timestamp: NaiveDateTime,
) -> Result<Measurement> {
    sqlx::query_as!(
        MeasurementDb,
        "INSERT INTO measurement (pot_id, soil_moisture, temperature, light_level, humidity, battery_level, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        pot,
        moisture,
        temperature,
        light_level,
        humidity,
        battery_level,
        timestamp
    )
    .fetch_one(pool)
    .await
    .map_err(|e| {
        error!("{e}");
        anyhow!(e)
    })
    .map(Measurement::from)
}

pub async fn get_measurements(pool: &Pool<Postgres>, pot_id: String) -> Result<Vec<Measurement>> {
    let pot_id = pot_id.parse::<i32>().map_err(|e| {
        error!("Failed to parse pot_id: {}", e);
        anyhow!(e)
    })?;

    let measurements = sqlx::query_as!(
        MeasurementDb,
        "SELECT * FROM measurement WHERE pot_id = $1 ORDER BY timestamp DESC",
        pot_id
    )
    .fetch_all(pool)
    .await
    .map_err(|e| {
        error!("{e}");
        anyhow!(e)
    })?;

    Ok(measurements.into_iter().map(Measurement::from).collect())
}
