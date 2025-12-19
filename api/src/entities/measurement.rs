use sqlx::types::chrono;

pub struct Measurement {
    pub id: i32,
}

pub struct MeasurementDb {
    pub id: i32,
    pub pot: i32,
    pub moisture: f32,
    pub temperature: f32,
    pub light: f32,
    pub humidity: f32,
    pub timestamp: chrono::NaiveDateTime,
}

impl From<MeasurementDb> for Measurement {
    fn from(db: MeasurementDb) -> Self {
        Measurement { id: db.id }
    }
}
