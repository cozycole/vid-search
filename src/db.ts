import { Pool, QueryResult } from 'pg'

const USER = process.env.DB_USER
const PASS = process.env.DB_PASS
const NAME = process.env.DB_NAME

const pool = new Pool({
    connectionString: `postgresql://${USER}:${PASS}@localhost:5432/${NAME}`
})

export async function searchVideos(search: string): Promise<QueryResult["rows"]> {
    const tsqueryString = search.replace(' ', '|')
    const queryText = `
        SELECT v.title, v.video_url, v.thumbnail_name, v.creation_date, 
        c.name as creator_name, c.profile_img_path as creator_img_path 
        FROM video AS v
        JOIN video_creator_rel AS vcr
        ON v.id = vcr.video_id
        JOIN creator AS c
        ON vcr.creator_id = c.id
        WHERE search_vector @@ to_tsquery('english', $1);
    `
    try {
        const result = await pool.query(queryText,[tsqueryString])
        console.log(result.rows)
        return result.rows
    } catch (e) {
        console.log(e)
        throw new Error("Error searching videos")
    }
}

export async function getAllVideos(): Promise<QueryResult["rows"]> {
    const queryText = `
        SELECT v.title, v.video_url, v.thumbnail_name, v.creation_date, 
        c.name as creator_name, c.profile_img_path as creator_img_path 
        FROM video AS v
        JOIN video_creator_rel AS vcr
        ON v.id = vcr.video_id
        JOIN creator AS c
        ON vcr.creator_id = c.id
    `
    const result = await pool.query(queryText)
    console.log(result.rows)
    return result.rows
}

export async function insertVideo(title:string,videoUrl:string,createDate:Date,pgRating:string): Promise<number> {
    const insertText = `
        INSERT INTO video (title, video_url, creation_date, pg_rating)
        VALUES ($1,$2,$3,$4)
        RETURNING id
    `
    const result = await pool.query(insertText, [title, videoUrl, createDate, pgRating])
    return result.rows[0].id
}

export async function insertThumbnailName(id:number, thumbnailName:string) : Promise<void> {
    const updateText = `
        UPDATE video 
        set thumbnail_name = $1
        WHERE id = $2
    `
    await pool.query(updateText, [thumbnailName, id])
}

export async function updateSearchVector(id: number): Promise<void> {
    const updateText = `
        UPDATE video 
        set search_vector = to_tsvector('english', title)
        WHERE id = $1
    `
    await pool.query(updateText, [id])
}

export async function insertCreator(creatorName:string,pageUrl:string) : Promise<number> {
    const insertText = `
        INSERT INTO creator (name, page_url)
        VALUES ($1,$2)
        RETURNING id
    `
    const result = await pool.query(insertText, [creatorName, pageUrl])
    return result.rows[0].id
}

export async function insertProfileImageName(id:number, imageName:string) : Promise<void> {
    const updateText = `
        UPDATE creator 
        set profile_img_path = $1
        WHERE id = $2
    `
    await pool.query(updateText, [imageName, id])
}