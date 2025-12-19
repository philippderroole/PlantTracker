use axum::{Json, extract::State, http::StatusCode};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::{entities::User, services};

#[derive(Serialize, Deserialize)]
pub struct UserResponse {
    id: i32,
    name: String,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        UserResponse {
            id: user.id,
            name: user.name,
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct CreateUserPayload {
    name: String,
}

pub async fn create_user(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateUserPayload>,
) -> Result<Json<UserResponse>, StatusCode> {
    let user = services::user::create_user(&pool, payload.name.as_str())
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(UserResponse::from(user)))
}
