use axum::{
    Router,
    routing::{get, post},
};
use sqlx::PgPool;

use crate::controllers::{measurement, plant, pot, user};

pub fn create_routes() -> Router<PgPool> {
    Router::new().nest(
        "/api/v1",
        Router::new()
            .merge(plant_routes())
            .merge(user_routes())
            .merge(measurement_routes())
            .merge(pot_routes()),
    )
}

fn plant_routes() -> Router<PgPool> {
    Router::new().nest(
        "/plants",
        Router::new()
            .route("/", get(plant::get_plants))
            .route("/", post(plant::create_plant))
            .route("/{plant_id}", get(plant::get_plant)),
    )
}

fn user_routes() -> Router<PgPool> {
    Router::new().nest("/users", Router::new().route("/", post(user::create_user)))
}

fn measurement_routes() -> Router<PgPool> {
    Router::new().nest(
        "/measurements/{pot_id}",
        Router::new().route("/", post(measurement::create_measurement)),
    )
}

fn pot_routes() -> Router<PgPool> {
    Router::new().nest("/pots", Router::new().route("/", post(pot::create_pot)))
}
