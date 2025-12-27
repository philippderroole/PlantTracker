use sqlx::PgPool;

use crate::entities::{User, UserDb};
use anyhow::{Result, anyhow};
use log::debug;

pub async fn get_user_by_email(pool: &PgPool, email: &str) -> Result<Option<User>> {
    let user = sqlx::query_as!(UserDb, r#"SELECT * FROM "user" WHERE email = $1"#, email)
        .fetch_optional(pool)
        .await
        .map_err(|e| {
            debug!("Error fetching user by email {}: {}", email, e);
            anyhow!(e)
        })?
        .map(User::from);
    Ok(user)
}
