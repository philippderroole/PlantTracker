pub struct Plant {
    pub id: i32,
    pub name: String,
    pub owner_id: i32,
}

pub struct PlantDb {
    pub id: i32,
    pub name: String,
    pub owner_id: i32,
}

impl From<PlantDb> for Plant {
    fn from(db: PlantDb) -> Self {
        Plant {
            id: db.id,
            name: db.name,
            owner_id: db.owner_id,
        }
    }
}
