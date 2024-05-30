import { searchVideos, getAllVideos, insertVideo, insertThumbnailName, updateSearchVector } from './db'
import { getFileType } from './img'
import { promises as fs } from 'fs';
import * as path from 'path';
import express from 'express'
import multer from 'multer'

const upload = multer({dest: 'public/image/actor'})

export const router = express.Router()

router.get('/search/videos', async (req, res) => {
    try {
        const search = String(req.query.search)
        let videos: any[]
        if (search.toLowerCase() === 'all'){
            videos = await getAllVideos()

        } else {
            videos = await searchVideos(search)
        }

        videos.forEach( x => {
            if (x.thumbnail_name) {
                const thumb_path = '/image/video/' + x.thumbnail_name
                x.thumbnail_name = thumb_path
            }
            if (x.creator_img_path) {
                const path = '/image/creator/' + x.creator_img_path
                x.creator_img_path = path
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

router.get('/add/video', async (req, res) => {
    res.sendFile('public/html/addvid.html', {root: __dirname+'/..'})
})

router.post('/add/video', upload.single('thumbnail'), async (req, res) => {
    console.log(req.body)
    console.log(req.file)

    let title : string = req.body.title
    let url : string = req.body.url
    let uploadDate : string = req.body.uploadDate
    let rating : string = req.body.rating

    if (!(title && url && uploadDate && rating && req.file)) {
        res.status(400).send({
            message: "Bad Request: insert values not defined"
        })
        return
    }

    try {
        let uploadDateObject = new Date(uploadDate)
        let recordId = await insertVideo(
            title, 
            url,
            uploadDateObject,
            rating.toUpperCase()
        ) 
        
        let ftype = await getFileType(req.file.path)
        // fname should be of format this-is-title-recordId
        // example: if title is Good Pals and record Id = 1 and it's a jpg
        // then fname will be good-pals-1.jpg
        let fname = title
                    .toLowerCase()
                    .substring(0,15)
                    .split(' ')
                    .join('-')
                    .concat('-', String(recordId))
                    .concat('.', ftype)

        let invokePath = process.cwd()
        
        let srcPath = path.join(invokePath, req.file.path)
        let destPath = path.join(invokePath, 'public/image/video', fname)
        await fs.rename(srcPath, destPath);
        insertThumbnailName(recordId, fname)
        updateSearchVector(recordId)
        res.sendStatus(200)
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }
})
