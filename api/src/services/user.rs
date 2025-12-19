use anyhow::{Result, anyhow};
use sqlx::{Pool, Postgres};

use crate::entities::{User, UserDb};

pub async fn create_user(pool: &Pool<Postgres>, name: &str) -> Result<User> {
    sqlx::query_as!(
        UserDb,
        "INSERT INTO \"user\" (name) VALUES ($1) RETURNING *",
        name,
    )
    .fetch_one(pool)
    .await
    .map_err(|e| anyhow!(e))
    .map(User::from)
}
