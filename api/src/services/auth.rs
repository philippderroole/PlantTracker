use anyhow::Ok;
use anyhow::Result;
use anyhow::anyhow;
use argon2::{
    Argon2, PasswordHash, PasswordHasher, PasswordVerifier,
    password_hash::{SaltString, rand_core::OsRng},
};
use serde::Deserialize;
use serde::Serialize;
use sqlx::types::chrono::Utc;
use sqlx::{Pool, Postgres};

use jsonwebtoken::{EncodingKey, Header, encode};

pub async fn register(pool: &Pool<Postgres>, email: &str, password: &str) -> Result<String> {
    let password_hash = hash_password(password)?;

    sqlx::query!(
        r#"
        INSERT INTO "user" (email, password_hash)
        VALUES ($1, $2)
        "#,
        email,
        password_hash,
    )
    .execute(pool)
    .await
    .map_err(|e| {
        println!("Error registering user: {}", e);
        e
    })?;

    Ok(generate_jwt(email)?)
}

pub async fn login(pool: &Pool<Postgres>, email: &str, password: &str) -> Result<String> {
    let record = sqlx::query!(
        r#"
        SELECT password_hash FROM "user" WHERE email = $1
        "#,
        email,
    )
    .fetch_one(pool)
    .await
    .map_err(|e| {
        println!("Error fetching user: {}", e);
        e
    })?;

    let is_valid = verify_password(password, &record.password_hash)?;

    if !is_valid {
        return Err(anyhow!("Invalid credentials"));
    }

    Ok(generate_jwt(email)?)
}

fn hash_password(password: &str) -> Result<String> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();

    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| anyhow!(e))?
        .to_string();

    Ok(password_hash)
}

fn verify_password(password: &str, password_hash: &str) -> Result<bool> {
    let parsed_hash = PasswordHash::new(&password_hash).map_err(|e| anyhow!(e))?;
    let _ = Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .map_err(|e| anyhow!(e))?;

    Ok(true)
}

#[derive(Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: i64,
    iat: i64,
}

fn generate_jwt(email: &str) -> Result<String> {
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
