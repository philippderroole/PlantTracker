use std::collections::HashMap;

use axum::{
    Json,
    extract::{Query, State},
    http::StatusCode,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::{entities::Plant, services};

#[derive(Serialize, Deserialize)]
pub struct PlantResponse {
    name: String,
}

impl From<Plant> for PlantResponse {
    fn from(plant: Plant) -> Self {
        PlantResponse { name: plant.name }
    }
}

#[derive(Serialize, Deserialize)]
pub struct CreatePlantPayload {
    name: String,
}

pub async fn create_plant(
    State(pool): State<PgPool>,
    Query(params): Query<HashMap<String, String>>,
    Json(payload): Json<CreatePlantPayload>,
) -> Result<Json<PlantResponse>, StatusCode> {
    let session_id = params
        .get("user_id")
        .ok_or(StatusCode::UNAUTHORIZED)?
        .parse::<i32>()
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    let plant = services::plant::create_plant(&pool, payload.name.as_str(), session_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(PlantResponse::from(plant)))
}

pub async fn get_plant(
    State(pool): State<PgPool>,
    Query(params): Query<HashMap<String, String>>,
) -> Result<Json<PlantResponse>, StatusCode> {
    let plant_id = params
        .get("plant_id")
        .ok_or(StatusCode::BAD_REQUEST)?
        .parse::<i32>()
        .map_err(|_| StatusCode::BAD_REQUEST)?;

    let plants = services::plant::find_plant_by_id(&pool, plant_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(PlantResponse::from(plants)))
}

pub async fn get_plants(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<PlantResponse>>, StatusCode> {
    let plants = services::plant::get_plants(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response: Vec<PlantResponse> = plants.into_iter().map(PlantResponse::from).collect();

    Ok(Json(response))
}
