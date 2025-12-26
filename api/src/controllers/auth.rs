use axum::{Json, extract::State, http::StatusCode};
use log::debug;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::services::{self, auth::AuthError};

#[derive(Serialize)]
pub struct JwtResponse {
    token: String,
}

#[derive(Deserialize)]
pub struct RegisterPayload {
    email: String,
    password: String,
}

pub async fn register(
    State(pool): State<PgPool>,
    Json(payload): Json<RegisterPayload>,
) -> Result<Json<JwtResponse>, StatusCode> {
    let token = services::auth::register(&pool, payload.email.as_str(), payload.password.as_str())
        .await
        .map_err(|e| match e {
            AuthError::UserAlreadyExists => return StatusCode::CONFLICT,
            AuthError::InvalidCredentials => unreachable!(),
            AuthError::InternalError(e) => {
                debug!("Registration error: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            }
        })?;

    Ok(Json(JwtResponse { token }))
}

#[derive(Deserialize)]
pub struct LoginPayload {
    email: String,
    password: String,
}

pub async fn login(
    State(pool): State<PgPool>,
    Json(payload): Json<LoginPayload>,
) -> Result<Json<JwtResponse>, StatusCode> {
    let token = services::auth::login(&pool, payload.email.as_str(), payload.password.as_str())
        .await
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    Ok(Json(JwtResponse { token }))
}
