use crate::entities::{Measurement, MeasurementDb};
use anyhow::{Result, anyhow};
use log::error;
use sqlx::{Pool, Postgres};

pub async fn create_measurement(
    pool: &Pool<Postgres>,
    pot: i32,
    moisture: f32,
    temperature: f32,
    light: f32,
    humidity: f32,
) -> Result<Measurement> {
    sqlx::query_as!(
        MeasurementDb,
        "INSERT INTO measurement (pot, moisture, temperature, light, humidity, timestamp) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *",
        pot,
        moisture,
        temperature,
        light,
        humidity
    )
    .fetch_one(pool)
    .await
    .map_err(|e| {
        error!("{e}");
        anyhow!(e)
    })
    .map(Measurement::from)
}
