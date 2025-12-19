use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::{entities::Measurement, services};

#[derive(Serialize, Deserialize)]
pub struct MeasurementResponse {}

impl From<Measurement> for MeasurementResponse {
    fn from(_measurement: Measurement) -> Self {
        MeasurementResponse {}
    }
}

#[derive(Serialize, Deserialize)]
pub struct CreateMeasurementPayload {
    moisture: f32,
    temperature: f32,
    light: f32,
    humidity: f32,
}

pub async fn create_measurement(
    State(pool): State<PgPool>,
    Path(pot_id): Path<i32>,
    Json(payload): Json<CreateMeasurementPayload>,
) -> Result<Json<MeasurementResponse>, StatusCode> {
    let plant = services::measurement::create_measurement(
        &pool,
        pot_id,
        payload.moisture,
        payload.temperature,
        payload.light,
        payload.humidity,
    )
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(MeasurementResponse::from(plant)))
}
