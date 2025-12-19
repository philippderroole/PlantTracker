use anyhow::{Result, anyhow};
use sqlx::{Pool, Postgres};

use crate::entities::{Plant, PlantDb};

pub async fn create_plant(pool: &Pool<Postgres>, name: &str, session_id: i32) -> Result<Plant> {
    sqlx::query_as!(
        PlantDb,
        "INSERT INTO plant (name, owner_id) VALUES ($1, $2) RETURNING *",
        name,
        session_id
    )
    .fetch_one(pool)
    .await
    .map_err(|e| anyhow!(e))
    .map(Plant::from)
}

pub async fn find_plant_by_id(pool: &Pool<Postgres>, plant_id: i32) -> Result<Option<Plant>> {
    let mut tx = pool.begin().await.map_err(|e| anyhow!(e))?;

    let plant = sqlx::query_as!(PlantDb, "SELECT * FROM plant WHERE id = $1", plant_id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| anyhow!(e))?
        .map(Plant::from);

    tx.commit().await.map_err(|e| anyhow!(e))?;

    Ok(plant)
}

pub async fn get_plants(pool: &Pool<Postgres>) -> Result<Vec<Plant>> {
    let mut tx = pool.begin().await.map_err(|e| anyhow!(e))?;

    let plants = sqlx::query_as!(PlantDb, "SELECT * FROM plant")
        .fetch_all(&mut *tx)
        .await
        .map_err(|e| anyhow!(e))?
        .into_iter()
        .map(Plant::from)
        .collect();

    tx.commit().await.map_err(|e| anyhow!(e))?;

    Ok(plants)
}
