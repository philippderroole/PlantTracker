use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::{
    controllers::middleware::RequireAuth,
    entities::{Plant, User},
    services::{self},
};

#[derive(Serialize, Deserialize)]
pub struct PlantResponse {
    id: i32,
    name: String,
    #[serde(rename = "owner")]
    owner_email: String,
}

impl PlantResponse {
    fn from(plant: Plant, owner: User) -> Self {
        PlantResponse {
            id: plant.id,
            name: plant.name,
            owner_email: owner.email,
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct CreatePlantPayload {
    name: String,
}

pub async fn create_plant(
    State(pool): State<PgPool>,
    RequireAuth(claims): RequireAuth,
    Json(payload): Json<CreatePlantPayload>,
) -> Result<Json<PlantResponse>, StatusCode> {
    let user = services::user::get_user_by_email(&pool, claims.sub.as_str())
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let plant = services::plant::create_plant(&pool, payload.name.as_str(), user.id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(PlantResponse::from(plant, user)))
}

pub async fn get_plant(
    State(pool): State<PgPool>,
    RequireAuth(claims): RequireAuth,
    Path(plant_id): Path<i32>,
) -> Result<Json<PlantResponse>, StatusCode> {
    let user = services::user::get_user_by_email(&pool, claims.sub.as_str())
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let plants = services::plant::find_plant_by_id(&pool, plant_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(PlantResponse::from(plants, user)))
}

pub async fn get_plants(
    State(pool): State<PgPool>,
    RequireAuth(claims): RequireAuth,
) -> Result<Json<Vec<PlantResponse>>, StatusCode> {
    let user = services::user::get_user_by_email(&pool, claims.sub.as_str())
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let plants = services::plant::get_plants(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response: Vec<PlantResponse> = plants
        .into_iter()
        .map(|plant| PlantResponse::from(plant, user.clone()))
        .collect();

    Ok(Json(response))
}

pub async fn update_plant(
    State(pool): State<PgPool>,
    RequireAuth(claims): RequireAuth,
    Path(plant_id): Path<i32>,
    Json(payload): Json<CreatePlantPayload>,
) -> Result<Json<PlantResponse>, StatusCode> {
    let user = services::user::get_user_by_email(&pool, claims.sub.as_str())
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let plant = services::plant::update_plant(&pool, plant_id, payload.name.as_str())
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(PlantResponse::from(plant, user)))
}

pub async fn delete_plant(
    State(pool): State<PgPool>,
    Path(plant_id): Path<i32>,
) -> Result<StatusCode, StatusCode> {
    services::plant::delete_plant(&pool, plant_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::NO_CONTENT)
}
