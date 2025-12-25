use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use log::debug;
use serde::{Deserialize, Serialize};
use sqlx::{PgPool, types::chrono::DateTime};

use crate::{entities::Measurement, services};

#[derive(Serialize)]
pub struct MeasurementResponse {
    pot_id: i32,
    timestamp: String,
    #[serde(rename = "soilMoisture")]
    soil_moisture: f32,
    temperature: f32,
    #[serde(rename = "lightLevel")]
    light_level: f32,
    humidity: f32,
    #[serde(rename = "batteryLevel")]
    battery_level: i32,
}

impl From<Measurement> for MeasurementResponse {
    fn from(measurement: Measurement) -> Self {
        MeasurementResponse {
            pot_id: measurement.pot_id,
            timestamp: measurement.timestamp.to_string(),
            soil_moisture: measurement.soil_moisture,
            temperature: measurement.temperature,
            light_level: measurement.light_level,
            humidity: measurement.humidity,
            battery_level: measurement.battery_level,
        }
    }
}

#[derive(Deserialize)]
pub struct CreateMeasurementPayload {
    timestamp: String,
    #[serde(rename = "soilMoisture")]
    soil_moisture: f32,
    temperature: f32,
    #[serde(rename = "lightLevel")]
    light_level: f32,
    humidity: f32,
    #[serde(rename = "batteryLevel")]
    battery_level: i32,
}

pub async fn create_measurement(
    State(pool): State<PgPool>,
    Path(pot_id): Path<String>,
    Json(payload): Json<CreateMeasurementPayload>,
) -> Result<(), StatusCode> {
    let timestamp = DateTime::parse_from_rfc3339(&payload.timestamp).map_err(|_| {
        debug!("Failed to parse timestamp: {}", &payload.timestamp);
        StatusCode::BAD_REQUEST
    })?;

    let pot_id = pot_id.parse::<i32>().map_err(|_| {
        debug!("Failed to parse pot_id: {}", &pot_id);
        StatusCode::BAD_REQUEST
    })?;

    let _measurement = services::measurement::create_measurement(
        &pool,
        pot_id,
        payload.soil_moisture,
        payload.temperature,
        payload.light_level,
        payload.humidity,
        payload.battery_level,
        timestamp.naive_utc(),
    )
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(())
}

#[axum::debug_handler]
pub async fn get_measurements(
    State(pool): State<PgPool>,
    Path(pot_id): Path<String>,
) -> Result<Json<Vec<MeasurementResponse>>, StatusCode> {
    let measurements = services::measurement::get_measurements(&pool, pot_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(
        measurements
            .into_iter()
            .map(MeasurementResponse::from)
            .collect(),
    ))
}
