/*
 Code that deals with uploaded images to server
*/
import {fileTypeFromFile} from 'file-type'
import sharp from 'sharp'
sharp.cache(false)

export async function getFileType(fpath: string) : Promise<string> {
    const ftypeResult = await fileTypeFromFile(fpath)
    return ftypeResult.ext
}

export async function cropThumbnail(fpath: string) : Promise<void> {
    const width = 480, height = 270
    const cropOptions = {
        top: 45,
        left: 0,
        width: width,
        height: height
    }

    let buffer = await sharp(fpath)
        .extract(cropOptions)
        .resize(width, height)
        .toBuffer()
        
    await sharp(buffer).toFile(fpath)
}

export async function getImageDimensions(fpath:string) : Promise<Object> {
    const imgMetadata = await sharp(fpath).metadata()

    return {
        width : imgMetadata.width,
        height : imgMetadata.height
    }
}

export async function resizeImage(fpath: string, width: number, height: number) : Promise<void> {
    let buffer = await sharp(fpath)
        .resize(width, height,{fit: sharp.fit.cover})
        .toBuffer()
    
    await sharp(buffer).toFile(fpath)
}
