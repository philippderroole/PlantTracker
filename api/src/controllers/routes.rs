use axum::{
    Router,
    middleware::from_extractor,
    routing::{get, post},
};
use sqlx::PgPool;

use crate::controllers::{auth, measurement, middleware::RequireAuth, plant, pot};

pub fn create_routes() -> Router<PgPool> {
    Router::new().nest(
        "/api/v1",
        Router::new()
            .merge(plant_routes())
            .merge(pot_routes())
            .merge(auth_routes()),
    )
}

fn auth_routes() -> Router<PgPool> {
    Router::new().nest(
        "/auth",
        Router::new()
            .route("/login", post(auth::login))
            .route("/register", post(auth::register)),
    )
}

fn plant_routes() -> Router<PgPool> {
    Router::new()
        .nest(
            "/plants",
            Router::new()
                .route("/", get(plant::get_plants))
                .route("/", post(plant::create_plant))
                .route("/{plant_id}", get(plant::get_plant)),
        )
        .route_layer(from_extractor::<RequireAuth>())
}

fn measurement_routes() -> Router<PgPool> {
    Router::new()
        .route("/", post(measurement::create_measurement))
        .route("/", get(measurement::get_measurements))
}

fn pot_routes() -> Router<PgPool> {
    Router::new()
        .nest(
            "/pots",
            Router::new()
                .route("/", get(pot::get_all_pots))
                .route("/", post(pot::create_pot))
                .route("/{pot_id}", get(pot::get_pot))
                .nest("/{pot_id}/measurements", measurement_routes()),
        )
        .route_layer(from_extractor::<RequireAuth>())
}
