import { getVideos } from './db'
import express from 'express'

export const router = express.Router()

router.get('/search/videos', async (req, res) => {
    try {
        const search = String(req.query.search)
        const videos = await getVideos(search)
        videos.forEach(x=>{
            if (x.thumbnail_name) {
                const thumb_path = "/image/video/" + x.thumbnail_name
                x.thumbnail_name = thumb_path
            }
        })
        console.log(videos)
        res.json(videos)
    } catch (e) {
        console.log(e)
        res.status(400).send({
            message: 'Internal Server Error'
        })
    }
})