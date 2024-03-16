import { Pool, QueryResult } from 'pg'

const USER = process.env.DB_USER
const PASS = process.env.DB_PASS
const NAME = process.env.DB_NAME

const pool = new Pool({
    connectionString: `postgresql://${USER}:${PASS}@localhost:5432/${NAME}`
})

export async function getVideos(search: string): Promise<QueryResult["rows"]> {
    const tsqueryString = search.replace(' ', '|')
    const queryText = `
        SELECT title 
        FROM video
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
