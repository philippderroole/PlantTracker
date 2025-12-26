use crate::services::jwt::{Claims, verify_jwt};
use anyhow::Result;
use axum::{
    extract::FromRequestParts,
    http::{HeaderMap, StatusCode, header, request::Parts},
};
use log::debug;

pub struct RequireAuth(pub Claims);

impl<S> FromRequestParts<S> for RequireAuth
where
    S: Send + Sync,
{
    type Rejection = StatusCode;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        if let Some(token) = get_token(&parts.headers) {
            let claims: Claims = verify_jwt(token).map_err(|_| {
                debug!("Invalid JWT token");
                StatusCode::UNAUTHORIZED
            })?;

            Ok(RequireAuth(claims))
        } else {
            debug!("Authorization header not found");
            Err(StatusCode::UNAUTHORIZED)
        }
    }
}

fn get_token(headers: &HeaderMap) -> Option<&str> {
    headers
        .get(header::AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .and_then(|auth_header| {
            if auth_header.starts_with("Bearer ") {
                Some(&auth_header[7..])
            } else {
                None
            }
        })
}
