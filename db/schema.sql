PRAGMA foreign_keys = ON;

CREATE TABLE users (
	uid				INTEGER NOT NULL,
    first_name      VARCHAR(20) NOT NULL,
    last_name       VARCHAR(40) NOT NULL,
    email           VARCHAR(40) NOT NULL,
    password        VARCHAR(256) NOT NULL,
    tier			VARCHAR(20) NOT NULL,
    PRIMARY KEY(uid),
    UNIQUE(email)
);
