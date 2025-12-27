use axum::{
    extract::{Json, State},
    http::StatusCode,
};
use log::debug;
use serde::Deserialize;
use sqlx::PgPool;

use crate::{
    controllers::middleware::RequireAuth,
    services::{self},
};

#[derive(Deserialize)]
pub struct LinkPlantToPotRequest {
    #[serde(rename = "plantId")]
    plant_id: i32,
    #[serde(rename = "potId")]
    pot_id: i32,
}

#[axum::debug_handler]
pub async fn link_plant_to_pot(
    State(pool): State<PgPool>,
    RequireAuth(claims): RequireAuth,
    Json(payload): Json<LinkPlantToPotRequest>,
) -> Result<StatusCode, StatusCode> {
    let user = services::user::get_user_by_email(&pool, claims.sub.as_str())
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::UNAUTHORIZED)?;

    services::link::link_plant_to_pot(&pool, user.id, payload.plant_id, payload.pot_id)
        .await
        .map_err(|e| {
            debug!("Error linking plant to pot: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
    Ok(StatusCode::NO_CONTENT)
}

#[axum::debug_handler]
pub async fn unlink_plant_from_pot(
    State(pool): State<PgPool>,
    RequireAuth(claims): RequireAuth,
    Json(payload): Json<LinkPlantToPotRequest>,
) -> Result<StatusCode, StatusCode> {
    let user = services::user::get_user_by_email(&pool, claims.sub.as_str())
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::UNAUTHORIZED)?;

    services::link::unlink_plant_from_pot(&pool, user.id, payload.plant_id, payload.pot_id)
        .await
        .map_err(|e| {
            debug!("Error unlinking plant from pot: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
    Ok(StatusCode::NO_CONTENT)
}
