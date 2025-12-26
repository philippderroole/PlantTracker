use anyhow::Ok;
use anyhow::Result;
use serde::Deserialize;
use serde::Serialize;
use sqlx::types::chrono::Utc;

use jsonwebtoken::{DecodingKey, Validation, decode};
use jsonwebtoken::{EncodingKey, Header, encode};

#[derive(Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: i64,
    pub iat: i64,
}

pub fn verify_jwt(token: &str) -> Result<Claims> {
    decode::<Claims>(
        token,
        &DecodingKey::from_secret("secret".as_ref()),
        &Validation::default(),
    )
    .map(|data| data.claims)
    .map_err(|e| anyhow::anyhow!(e))
}

pub fn generate_jwt(email: &str) -> Result<String> {
    let now = Utc::now();

    let claims = Claims {
        sub: email.to_owned(),
        exp: now.timestamp() + 3600,
        iat: now.timestamp(),
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret("secret".as_ref()),
    )?;

    Ok(token)
}
