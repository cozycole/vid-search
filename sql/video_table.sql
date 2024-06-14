BEGIN;
CREATE TYPE rating AS ENUM ('PG', 'PG-13', 'R');

CREATE TABLE video (
    id serial primary key,
    title VARCHAR NOT NULL,
    video_url VARCHAR NOT NULL,
    thumbnail_name VARCHAR,
    creation_date DATE,
    pg_rating rating,
    insert_timestamp timestamp DEFAULT now()
);

INSERT INTO video (title, video_url, thumbnail_name, creation_date, pg_rating) VALUES
    ('Good Pals', 'https://www.youtube.com/watch?v=6aTqXkZHnQE', 'good-pals-1.jpg', '2008-09-08', 'PG'),
    ('Grapist', 'https://www.youtube.com/watch?v=mqgiEQXGetI', 'grapist-2.jpg', '2009-04-28', 'R'),
    ('Self Defense', 'https://www.youtube.com/watch?v=2REG3-Wb5gM', 'self-defense-3.jpg', '2006-11-11', 'PG-13'),
    ('Santa Might Get Cancelled...', 'https://www.youtube.com/watch?v=xQJwWRhyU5I', 'santa-might-get-4.jpg', '2023-12-19', 'R');
    
CREATE TABLE video_actor_rel (
    id serial primary key,
    actor_id int references actor(id),
    video_id int references video(id),
    UNIQUE (actor_id, video_id)
);

CREATE TABLE video_creator_rel (
    id serial primary key,
    creator_id int references creator(id),
    video_id int references video(id)
    UNIQUE (creator_id, video_id)
);

CREATE TABLE video_tag_rel (
    id serial primary key,
    video_id int references video(id),
    tag_id int references tag(id),
    UNIQUE (actor_id, video_id)
);
COMMIT;