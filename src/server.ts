import express from "express"
import cors from "cors"

import {PrismaClient} from "@prisma/client"
import {convertHourStringToMinutes} from "./utils/convert-hour-string-to-minutes"
import { convertMinituesToHourString } from "./utils/convert-minites-to-hour-string"

const app  = express()


app.use(express.json())
app.use(cors())


const prisma = new PrismaClient({
    log: ['query']
})

/*
    Query: ? persistir estado, 
    Route: identificar algum recurso 
    Body: enviar varias informacoes, ex: criar um usuario
*/

// HTTP methods / API restful / HTTP Codes

// GET, POST, PUT, PATCH, DELETE

// HTTP Codes 2-success 3-redirecting 4-error-bug 5-error-unexpected

app.get('/games', async (request, response) => {
    const games = await prisma.game.findMany({
        include: {
            _count:{
                select: {
                    ads: true,
                }
            }
        }
})

    return response.json(games)
})

app.post('/games/:id/ads', async(request, response) => {
    const gameId = request.params.id

    const body : any = request.body

    const ad  = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            discord: body.discord,
            yearsPlaying: body.yearsPlaying,
            hourEnd: convertHourStringToMinutes(body.hourEnd),
            hourStart: convertHourStringToMinutes(body.hourStart),
            userVoiceChannel: body.userVoiceChannel,
            weekDays: body.weekDays.join(','),
        }
    })

    return response.status(201).json(ad)
})

app.get('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id
    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            userVoiceChannel: true,
            yearsPlaying: true,
            hourStart: true,
            hourEnd: true,
        },
        where:{
            gameId
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return response.json(ads.map(ad => {
        return {
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourStart: convertMinituesToHourString(ad.hourStart),
            hourEnd: convertMinituesToHourString(ad.hourEnd)
        }
    }))
})

app.get('/ads/:id/discord', async(request, response) => {
    const adId = request.params.id

    const ad = await prisma.ad.findUniqueOrThrow({
        select:{
            discord: true
        },
        where: {
            id: adId
        }
    })

    return response.json({
        discord: ad.discord,
    })
})



app.listen(3333)