use crate::entities::{Pot, PotDb};
use anyhow::{Result, anyhow};
use log::error;
use sqlx::{Pool, Postgres};

pub async fn create_pot(pool: &Pool<Postgres>) -> Result<Pot> {
    sqlx::query_as!(PotDb, "INSERT INTO pot DEFAULT VALUES RETURNING *")
        .fetch_one(pool)
        .await
        .map_err(|e| {
            error!("{e}");
            anyhow!(e)
        })
        .map(Pot::from)
}

pub async fn set_owner(pool: &Pool<Postgres>, pot_id: i32, owner_id: i32) -> Result<()> {
    sqlx::query!(
        "UPDATE pot SET owner_id = $1 WHERE id = $2",
        owner_id,
        pot_id,
    )
    .execute(pool)
    .await
    .map_err(|e| anyhow!(e))?;
    Ok(())
}

pub async fn set_plant(pool: &Pool<Postgres>, pot_id: i32, plant_id: i32) -> Result<()> {
    sqlx::query!(
        "UPDATE pot SET plant_id = $1 WHERE id = $2",
        plant_id,
        pot_id,
    )
    .execute(pool)
    .await
    .map_err(|e| anyhow!(e))?;
    Ok(())
}
