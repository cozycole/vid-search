import fs from 'fs'
import * as path from 'path'
import express from 'express'
import multer from 'multer'
import axios from 'axios'
import * as url from 'url'
import { 
    searchVideos, 
    getAllVideos, 
    insertVideo, 
    insertThumbnailName, 
    updateSearchVector,
    insertCreator,
    insertActor,
    insertProfileImageName } from './db'
import { getFileType,
        resizeImage,
        cropThumbnail} from './img'

const YT_API_KEY = process.env.YT_API_KEY

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

    let title = req.body.title as string
    let url = req.body.url as string
    let uploadDate = req.body.uploadDate as string
    let rating = req.body.rating as string

    if (!(title && url && uploadDate && rating && req.file)) {
        res.status(400).send({
            message: "Bad Request: insert values not defined"
        })
        return
    }

    let ftype = await getFileType(req.file.path)
    
    if (!["jpg","png"].includes(ftype)) {
        res.status(400).send({
            message: `Bad Request: image type ${ftype} not supported`
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

        await resizeImage(req.file.path, 480, 360)
        await cropThumbnail(req.file.path)
        
        let ftype = await getFileType(req.file.path)
        // fname should be of format this-is-title-recordId.jpg
        // example: if title is Good Pals and record Id = 1 
        // then fname will be good-pals-1.jpg
        const titleSubstrLength = 15
        let fname = createImageName(title.substring(0,titleSubstrLength), recordId, ftype)

        let invokePath = process.cwd()
        let srcPath = path.join(invokePath, req.file.path)
        let destPath = path.join(invokePath, 'public/image/video', fname)

        await fs.promises.rename(srcPath, destPath);

        await insertThumbnailName(recordId, fname)
        await updateSearchVector(recordId)
        res.sendStatus(200)

    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }
})

router.get('/vid/metadata', async (req, res) => {
    try {
        const vidId = req.query.vidId as string
        if (!vidId) {
            res.sendStatus(403)
            return
        }

        const vidDataUrl = 'https://www.googleapis.com/youtube/v3/videos'    
        let ytRes = await axios.get(vidDataUrl, {
            params : {
                part : 'snippet',
                id : vidId,
                key : YT_API_KEY
            }
        })

        if (ytRes.status != 200) {
            throw new Error('Error requesting video')
        }

        console.log(ytRes.data)

        let ytSnippetData = ytRes.data.items[0].snippet
        let vidData: any = {}

        vidData.title = ytSnippetData.title
        vidData.uploadDate = ytSnippetData.publishedAt.split('T')[0]
        vidData.channelTitle = ytSnippetData.channelTitle
        vidData.channelId = ytSnippetData.channelId
        vidData.videoId = ytRes.data.items[0].id

        res.status(ytRes.status).send(vidData)
            
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }
})

router.get('/vid/thumbnail', async (req, res) => {
    try {
        const vidId = req.query.vidId as string
        if (!vidId) {
            res.sendStatus(403)
            return
        }

        const thumbnailUrl = `https://img.youtube.com/vi/${vidId}/0.jpg`
        let ytRes = await axios.get(thumbnailUrl, {responseType: 'arraybuffer'})

        if (ytRes.status != 200) {
            console.log(ytRes)
            console.log('Error requesting video')
            res.sendStatus(404)
        }

        console.log(ytRes.headers)
        console.log(ytRes.data)

        await fs.promises.writeFile('test.jpg', Buffer.from(ytRes.data, 'binary'))
        res.status(ytRes.status).send(ytRes.data)
        // res.sendStatus(200)
            
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }
})

router.get('/add/creator', async (req, res) => {
    res.sendFile('public/html/addcreator.html', {root: __dirname+'/..'})
})

router.post('/add/creator', upload.single('thumbnail'), async (req, res) => {
    let creatorName : string = req.body.creator
    let url : string = req.body.url

    if (!(creatorName && url && req.file)) {
        res.status(400).send({
            message: "Bad Request: insert values not defined"
        })
        return
    }

    let ftype = await getFileType(req.file.path)
    
    if (!["jpg","png"].includes(ftype)) {
        res.status(400).send({
            message: `Bad Request: image type ${ftype} not supported`
        })
        return
    }
    
    try {
        let recordId = await insertCreator(
            creatorName, 
            url
        ) 
        let ftype = await getFileType(req.file.path)
        await resizeImage(req.file.path, 176, 176)
        
        let fname = createImageName(creatorName, recordId, ftype)

        let invokePath = process.cwd()
        let srcPath = path.join(invokePath, req.file.path)
        let destPath = path.join(invokePath, 'public/image/creator', fname)

        await fs.promises.rename(srcPath, destPath);

        await insertProfileImageName('creator', recordId, fname)
        res.sendStatus(200)

    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }
})

router.get('/add/actor', async (req, res) => {
    res.sendFile('public/html/addactor.html', {root: __dirname+'/..'})
})

router.post('/add/actor', upload.single('thumbnail'), async (req, res) => {
    let givenName : string = req.body.givenName
    let surname : string = req.body.surname
    let birthDate = req.body.birthDate

    if (!(givenName && surname && birthDate && req.file)) {
        res.status(400).send({
            message: "Bad Request: insert values not defined"
        })
        console.log(givenName, surname, birthDate)
        return
    }

    let ftype = await getFileType(req.file.path)
    
    if (!["jpg","png"].includes(ftype)) {
        res.status(400).send({
            message: `Bad Request: image type ${ftype} not supported`
        })
        return
    }
    
    try {
        let birthDateObject = new Date(birthDate)
        let recordId = await insertActor(
            givenName,
            surname, 
            birthDateObject
        ) 
        let ftype = await getFileType(req.file.path)
        await resizeImage(req.file.path, 176, 176)
        
        let fname = createImageName(givenName + ' ' + surname, recordId, ftype)

        let invokePath = process.cwd()
        let srcPath = path.join(invokePath, req.file.path)
        let destPath = path.join(invokePath, 'public/image/actor', fname)

        await fs.promises.rename(srcPath, destPath)

        await insertProfileImageName('actor', recordId, fname)
        res.sendStatus(200)

    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }
})

function createImageName(inputString:string, id:number, fileType:string) : string {
    return inputString
                .toLowerCase()
                .split(' ')
                .join('-')
                .concat('-', String(id))
                .concat('.', fileType)
}