use sqlx::types::chrono::NaiveDateTime;

pub struct Measurement {
    pub pot_id: i32,
    pub timestamp: NaiveDateTime,
    pub soil_moisture: f32,
    pub temperature: f32,
    pub light_level: f32,
    pub humidity: f32,
    pub battery_level: i32,
}

pub struct MeasurementDb {
    pub id: i32,
    pub pot_id: i32,
    pub timestamp: NaiveDateTime,
    pub soil_moisture: f32,
    pub temperature: f32,
    pub light_level: f32,
    pub humidity: f32,
    pub battery_level: i32,
}

impl From<MeasurementDb> for Measurement {
    fn from(db: MeasurementDb) -> Self {
        Measurement {
            pot_id: db.pot_id,
            timestamp: db.timestamp,
            soil_moisture: db.soil_moisture,
            temperature: db.temperature,
            light_level: db.light_level,
            humidity: db.humidity,
            battery_level: db.battery_level,
        }
    }
}
