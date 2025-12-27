#[derive(Clone, Debug)]
pub struct User {
    pub id: i32,
    pub email: String,
}

pub struct UserDb {
    pub id: i32,
    pub email: String,
    pub password_hash: String,
}

impl From<UserDb> for User {
    fn from(db: UserDb) -> Self {
        User {
            id: db.id,
            email: db.email,
        }
    }
}
