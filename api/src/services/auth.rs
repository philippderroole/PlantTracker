use std::fmt::Display;

use anyhow::Error;
use anyhow::Result;
use anyhow::anyhow;
use argon2::{
    Argon2, PasswordHash, PasswordHasher, PasswordVerifier,
    password_hash::{SaltString, rand_core::OsRng},
};
use sqlx::{Pool, Postgres};

use crate::services::jwt::generate_jwt;

pub enum AuthError {
    UserAlreadyExists,
    InvalidCredentials,
    InternalError(Error),
}

impl Display for AuthError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AuthError::UserAlreadyExists => write!(f, "User already exists"),
            AuthError::InvalidCredentials => write!(f, "Invalid credentials"),
            AuthError::InternalError(e) => write!(f, "Internal error: {}", e),
        }
    }
}

pub async fn register(
    pool: &Pool<Postgres>,
    email: &str,
    password: &str,
) -> Result<String, AuthError> {
    let password_hash = hash_password(password).map_err(|e| AuthError::InternalError(e))?;

    match sqlx::query!(
        r#"
        INSERT INTO "user" (email, password_hash)
        VALUES ($1, $2)
        "#,
        email,
        password_hash,
    )
    .execute(pool)
    .await
    {
        Ok(_) => Ok(generate_jwt(email).map_err(|e| AuthError::InternalError(e))?),
        Err(sqlx::Error::Database(db_err)) => {
            if db_err.code() == Some("23505".into()) {
                return Err(AuthError::UserAlreadyExists);
            }
            return Err(AuthError::InternalError(anyhow!(db_err)));
        }
        Err(e) => {
            return Err(AuthError::InternalError(anyhow!(e)));
        }
    }
}

pub async fn login(
    pool: &Pool<Postgres>,
    email: &str,
    password: &str,
) -> Result<String, AuthError> {
    let record = sqlx::query!(
        r#"
        SELECT password_hash FROM "user" WHERE email = $1
        "#,
        email,
    )
    .fetch_one(pool)
    .await
    .map_err(|e| match e {
        sqlx::Error::RowNotFound => AuthError::InvalidCredentials,
        _ => AuthError::InternalError(anyhow!(e)),
    })?;

    let is_valid = verify_password(password, &record.password_hash)
        .map_err(|e| AuthError::InternalError(e))?;

    if !is_valid {
        return Err(AuthError::InvalidCredentials);
    }

    Ok(generate_jwt(email).map_err(|e| AuthError::InternalError(e))?)
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
