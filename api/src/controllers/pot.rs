use axum::{Json, extract::State, http::StatusCode};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::{entities::Pot, services};

#[derive(Serialize, Deserialize)]
pub struct PotResponse {
    pot_id: i32,
}

impl From<Pot> for PotResponse {
    fn from(pot: Pot) -> Self {
        PotResponse { pot_id: pot.id }
    }
}

pub async fn create_pot(State(pool): State<PgPool>) -> Result<Json<PotResponse>, StatusCode> {
    let pot = services::pot::create_pot(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(PotResponse::from(pot)))
}
