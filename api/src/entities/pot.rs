pub struct Pot {
    pub id: i32,
}

pub struct PotDb {
    pub id: i32,
    pub owner_id: i32,
}

impl From<PotDb> for Pot {
    fn from(db: PotDb) -> Self {
        Pot { id: db.id }
    }
}
