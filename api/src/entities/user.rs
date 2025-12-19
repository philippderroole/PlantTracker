pub struct User {
    pub id: i32,
    pub name: String,
}

pub struct UserDb {
    pub id: i32,
    pub name: String,
}

impl From<UserDb> for User {
    fn from(db: UserDb) -> Self {
        User {
            id: db.id,
            name: db.name,
        }
    }
}
