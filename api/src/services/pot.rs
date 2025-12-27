use crate::{
    entities::{Pot, PotDb},
    services::jwt::Claims,
};
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

pub async fn get_all_pots(pool: &Pool<Postgres>, claims: Claims) -> Result<Vec<Pot>> {
    let email = claims.sub;
    let user = sqlx::query!(r#"SELECT id FROM "user" WHERE email = $1"#, email)
        .fetch_one(pool)
        .await
        .map_err(|e| {
            error!("{e}");
            anyhow!(e)
        })?;

    let pots = sqlx::query_as!(PotDb, "SELECT * FROM pot where owner_id = $1", user.id)
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

pub async fn get_pot(pool: &Pool<Postgres>, claims: Claims, pot_id: i32) -> Result<Pot> {
    let email = claims.sub;
    let user = sqlx::query!(r#"SELECT id FROM "user" WHERE email = $1"#, email)
        .fetch_one(pool)
        .await
        .map_err(|e| {
            error!("{e}");
            anyhow!(e)
        })?;

    let pot = sqlx::query_as!(
        PotDb,
        "SELECT * FROM pot WHERE id = $1 AND owner_id = $2",
        pot_id,
        user.id
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
