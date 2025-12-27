use crate::entities::{Pot, PotDb};
use anyhow::{Result, anyhow};
use log::error;
use sqlx::{Pool, Postgres};

pub async fn create_pot(pool: &Pool<Postgres>, user_id: i32) -> Result<Pot> {
    sqlx::query_as!(
        PotDb,
        "INSERT INTO pot (owner_id) VALUES ($1) RETURNING *",
        user_id
    )
    .fetch_one(pool)
    .await
    .map_err(|e| {
        error!("{e}");
        anyhow!(e)
    })
    .map(Pot::from)
}

pub async fn get_all_pots(pool: &Pool<Postgres>, user_id: i32) -> Result<Vec<Pot>> {
    let pots = sqlx::query_as!(PotDb, "SELECT * FROM pot where owner_id = $1", user_id)
        .fetch_all(pool)
        .await
        .map_err(|e| {
            error!("{e}");
            anyhow!(e)
        })?
        .into_iter()
        .map(Pot::from)
        .collect();
    Ok(pots)
}

pub async fn get_pot(pool: &Pool<Postgres>, user_id: i32, pot_id: i32) -> Result<Pot> {
    let pot = sqlx::query_as!(
        PotDb,
        "SELECT * FROM pot WHERE id = $1 AND owner_id = $2",
        pot_id,
        user_id
    )
    .fetch_one(pool)
    .await
    .map_err(|e| {
        error!("{e}");
        anyhow!(e)
    })
    .map(Pot::from)?;
    Ok(pot)
}
