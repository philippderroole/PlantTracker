use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::{controllers::middleware::RequireAuth, entities::Pot, services};

#[derive(Serialize, Deserialize)]
pub struct PotResponse {
    pot_id: i32,
}

impl From<Pot> for PotResponse {
    fn from(pot: Pot) -> Self {
        PotResponse { pot_id: pot.id }
    }
}

pub async fn create_pot(
    State(pool): State<PgPool>,
    RequireAuth(claims): RequireAuth,
) -> Result<Json<PotResponse>, StatusCode> {
    let user = sqlx::query!(r#"SELECT id FROM "user" WHERE email = $1"#, claims.sub)
        .fetch_one(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let pot = services::pot::create_pot(&pool, user.id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(PotResponse::from(pot)))
}

pub async fn get_all_pots(
    State(pool): State<PgPool>,
    RequireAuth(claims): RequireAuth,
) -> Result<Json<Vec<PotResponse>>, StatusCode> {
    let pot = services::pot::get_all_pots(&pool, claims)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;

    Ok(Json(pot.into_iter().map(PotResponse::from).collect()))
}

pub async fn get_pot(
    State(pool): State<PgPool>,
    RequireAuth(claims): RequireAuth,
    Path(pot_id): Path<i32>,
) -> Result<Json<PotResponse>, StatusCode> {
    let pot = services::pot::get_pot(&pool, claims, pot_id)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;

    Ok(Json(PotResponse::from(pot)))
}
