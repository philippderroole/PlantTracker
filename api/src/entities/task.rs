pub struct Task {
    pub id: i32,
    pub name: String,
}

pub struct TaskDb {
    pub id: i32,
    pub name: String,
}

impl From<TaskDb> for Task {
    fn from(db: TaskDb) -> Self {
        Task {
            id: db.id,
            name: db.name,
        }
    }
}
