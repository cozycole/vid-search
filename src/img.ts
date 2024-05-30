/*
 Code that deals with uploaded images to server
*/
import {fileTypeFromFile} from 'file-type'

export async function getFileType(fpath: string) : Promise<string> {
    const ftypeResult = await fileTypeFromFile(fpath)
    return ftypeResult.ext
}

