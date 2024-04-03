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
        SELECT v.title, v.video_url, v.thumbnail_name, 
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
        SELECT v.title, v.video_url, v.thumbnail_name, 
        c.name as creator_name, c.profile_img_path as creator_img_path 
        FROM video AS v
        JOIN video_creator_rel AS vcr
        ON v.id = vcr.video_id
        JOIN creator AS c
        ON vcr.creator_id = c.id
    `
    try {
        const result = await pool.query(queryText)
        console.log(result.rows)
        return result.rows
    } catch (e) {
        console.log(e)
        throw new Error("Error retrieving videos")
    }
}