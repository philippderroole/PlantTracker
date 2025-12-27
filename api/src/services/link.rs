use anyhow::Result;
use sqlx::{Pool, Postgres};

pub async fn link_plant_to_pot(
    pool: &Pool<Postgres>,
    user_id: i32,
    plant_id: i32,
    pot_id: i32,
) -> Result<()> {
    let _plant = sqlx::query!(
        r#"SELECT * FROM plant
        WHERE id = $1 AND owner_id = $2"#,
        plant_id,
        user_id
    )
    .fetch_optional(pool)
    .await
    .map_err(|e| anyhow::anyhow!("Failed to fetch plant: {}", e))?
    .ok_or_else(|| anyhow::anyhow!("Plant not found"))?;

    let _pot = sqlx::query!(
        r#"SELECT * FROM pot
        WHERE id = $1 AND owner_id = $2"#,
        pot_id,
        user_id
    )
    .fetch_optional(pool)
    .await
    .map_err(|e| anyhow::anyhow!("Failed to fetch pot: {}", e))?
    .ok_or_else(|| anyhow::anyhow!("Pot not found"))?;

    let pot_already_linked = sqlx::query!(
        r#"SELECT * FROM plant_pot_assignment
        WHERE pot_id = $1"#,
        pot_id
    )
    .fetch_optional(pool)
    .await
    .map_err(|e| anyhow::anyhow!("Failed to check existing link: {}", e))?
    .is_some();

    if pot_already_linked {
        return Err(anyhow::anyhow!("Plant is already linked to a pot"));
    }

    let plant_already_linked = sqlx::query!(
        r#"SELECT * FROM plant_pot_assignment
        WHERE plant_id = $1"#,
        plant_id
    )
    .fetch_optional(pool)
    .await
    .map_err(|e| anyhow::anyhow!("Failed to check existing plant link: {}", e))?
    .is_some();

    if plant_already_linked {
        return Err(anyhow::anyhow!("Plant is already linked to a pot"));
    }

    sqlx::query!(
        r#"INSERT INTO plant_pot_assignment (plant_id, pot_id)
        VALUES ($1, $2)"#,
        plant_id,
        pot_id,
    )
    .execute(pool)
    .await
    .map_err(|e| anyhow::anyhow!("Failed to link plant to pot: {}", e))?;
    Ok(())
}

pub async fn unlink_plant_from_pot(
    pool: &Pool<Postgres>,
    user_id: i32,
    plant_id: i32,
    pot_id: i32,
) -> Result<()> {
    sqlx::query!(
        r#"DELETE FROM plant_pot_assignment
        USING pot
        WHERE plant_pot_assignment.pot_id = pot.id
        AND plant_pot_assignment.plant_id = $1
        AND plant_pot_assignment.pot_id = $2
        AND pot.owner_id = $3"#,
        plant_id,
        pot_id,
        user_id
    )
    .execute(pool)
    .await
    .map_err(|e| anyhow::anyhow!("Failed to unlink plant from pot: {}", e))?;
    Ok(())
}
