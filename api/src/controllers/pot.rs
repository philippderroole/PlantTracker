use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::{
    controllers::middleware::RequireAuth,
    entities::{Plant, Pot},
    services,
};

#[derive(Serialize, Deserialize)]
pub struct PotResponse {
    pot_id: i32,
    #[serde(skip_serializing_if = "Option::is_none", rename = "plant")]
    plant_name: Option<String>,
}

impl PotResponse {
    fn from(pot: Pot, plant: Option<Plant>) -> Self {
        PotResponse {
            pot_id: pot.id,
            plant_name: plant.map(|p| p.name),
        }
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

    Ok(Json(PotResponse::from(pot, None)))
}

pub async fn get_all_pots(
    State(pool): State<PgPool>,
    RequireAuth(claims): RequireAuth,
) -> Result<Json<Vec<PotResponse>>, StatusCode> {
    let user = services::user::get_user_by_email(&pool, claims.sub.as_str())
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let pot = services::pot::get_all_pots(&pool, user.id)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;

    Ok(Json(
        pot.into_iter()
            .map(|p| PotResponse::from(p, None))
            .collect(),
    ))
}

pub async fn get_pot(
    State(pool): State<PgPool>,
    RequireAuth(claims): RequireAuth,
    Path(pot_id): Path<i32>,
) -> Result<Json<PotResponse>, StatusCode> {
    let user = services::user::get_user_by_email(&pool, claims.sub.as_str())
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let pot = services::pot::get_pot(&pool, user.id, pot_id)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;

    Ok(Json(PotResponse::from(pot, None)))
}
