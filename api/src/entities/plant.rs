pub struct Plant {
    pub name: String,
}

pub struct PlantDb {
    pub id: i32,
    pub name: String,
    pub owner_id: i32,
}

impl From<PlantDb> for Plant {
    fn from(db: PlantDb) -> Self {
        Plant { name: db.name }
    }
}
