# WIChat Database Schema Documentation

## Key Specifications

- **Primary Keys:** All primary key fields (`_id`) use MongoDB's native ObjectId
- **Date Fields:** Dates are stored as BSON Date objects with `default: Date.now`
- **Array Fields:** Used for storing game history and profile visits
- **Document Model:** Uses embedded documents for relationships
- **Validation:** All numeric fields enforce integer validation
- **Unique Constraints:** Username and wikidataId fields are uniquely constrained

---

## Collections and Fields

### User Collection

Stores user accounts and aggregated gameplay statistics.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId [pk] | Auto-generated unique identifier |
| `username` | String [unique] | Required unique identifier |
| `passwordHash` | String | Required hashed password |
| `image` | String | Profile picture URL |
| `registrationDate` | Date | Auto-generated creation timestamp |
| `gamesPlayed` | Integer | Total games played (default: 0) |
| `questionsAnswered` | Integer | Total questions answered (default: 0) |
| `correctAnswers` | Integer | Correct responses (default: 0) |
| `incorrectAnswers` | Integer | Incorrect responses (default: 0) |
| `profileVisits` | Visit[] | Array of visit subdocuments |
| `totalVisits` | Integer | Summed visit count (default: 0) |
| `games` | Game[] | Array of game session subdocuments |

---

### Game Collection

Tracks individual sessions.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId [pk] | Auto-generated unique identifier |
| `username` | String | Required username of the user that played the game |
| `gameType` | String | Enum: ['classical', 'suddenDeath', 'timeTrial', 'qod' 'custom'] |
| `questionsAnswered` | Integer | Questions attempted (default: 0) |
| `correctAnswers` | Integer | Correct responses (default: 0) |
| `incorrectAnswers` | Integer | Incorrect responses (default: 0) |
| `score` | Integer | Final score (default: 0) |
| `registrationDate` | Date | Session start timestamp |
| `endDate` | Date | Session end timestamp |

---

### Visit Collection

Embedded within User documents, tracks profile visitors.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId [pk] | Auto-generated unique identifier |
| `visitorUsername` | String | Required visitor identifier |
| `visitDate` | Date | Auto-generated timestamp |

---

### WikidataItem Collection

Stores Wikidata entities for question generation.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId [pk] | Auto-generated identifier |
| `wikidataId` | String [unique] | Required Wikidata identifier |
| `type` | String | Required entity type |
| `label` | String | Required display label |
| `image` | String | Required image URL |
| `isTest` | Boolean | Testing flag (default: false) |

---

### Question Collection

Core quiz questions.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId [pk] | Auto-generated identifier |
| `imageType` | String | Required image type |
| `relation` | String | Required relation type |
| `topic` | String | Required topic of the question |
| `images` | String[] | Required image URLs |
| `correctOption` | String | Required correct answer |

---

### Answer Collection

Actual user answers for the quizz.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId [pk] | Auto-generated identifier |
| `questionId` | ObjectId | Required identifier of the related question |
| `username` | String | Required username of the user that answered |
| `answer` | String | Required user answer |
| `isCorrect` | Boolean | Required field to indicate whether the user answer was correct or not |
| `correctOption` | String | Required actual correct answer |

---

### Question of the Day Collection

Small collection to store the questions of the day.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId [pk] | Auto-generated identifier |
| `questionId` | ObjectId | Required identifier of the related question |
| `date` | Date | Required timestamp to mark the date of the question |

---

## Database Schema

![Database schema](https://github.com/Arquisoft/wichat_en1b/blob/master/docs/images/databaseSchema.png)

---

## DBML Code (for [dbdiagram.io](https://dbdiagram.io))

```
Table User {
  _id ObjectId [pk]
  username varchar [unique]
  passwordHash varchar
  image varchar
  registrationDate datetime
  gamesPlayed varchar[]
  questionsAnswered int
  correctAnswers int
  incorrectAnswers int
  profileVisits varchar[]
  totalVisits int
}

Table Game {
  _id ObjectId [pk]
  username varchar
  gameType GameType
  questionsAnswered int
  correctAnswers int
  incorrectAnswers int
  score int
  registrationDate datetime
  endDate datetime
}

Table Visit {
  _id ObjectId [pk]
  visitorUsername varchar [ref : > User.username]
  visitDate datetime
}

Table WikidataItem {
  _id ObjectId [pk]
  wikidataId varchar [unique]
  type varchar
  label varchar
  image varchar
  isTest boolean
}

Table Question {
  _id ObjectId [pk]
  imageType varchar
  relation varchar
  topic varchar
  images varchar[]
  correctOption varchar
}

Table Answer {
  _id ObjectId [pk]
  questionId ObjectId [ref : > Question._id]
  username varchar
  answer varchar
  isCorrect boolean
  correctOption varchar
}

Table QuestionOfDay {
  _id ObjectId [pk]
  questionId ObjectId [ref : > Question._id]
  date datetime
}

Enum GameType {
  classical
  suddenDeath
  timeTrial
  qod
  custom
}

Ref : User.gamesPlayed > Game._id
Ref : User.profileVisits > Visit._id

```