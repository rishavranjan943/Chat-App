import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import http from 'http'
import {Server} from 'socket.io'
import Filter from 'bad-words'
import generateMessage from './utilis/message.mjs'
import {
    addUser,removeUser,getUser,getUserInRoom
} from './utilis/user.mjs'



const app=express()
const server=http.createServer(app)
const io=new Server(server)



const port=process.env.PORT | 3000

const __filename=fileURLToPath(import.meta.url)
const __dirname=dirname(__filename)
 

const publicDirectoryPath=path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))


io.on('connection',(socket) => {
    console.log('New Websocket connection')
    // socket.emit('message',generateMessage('Welcome to web socket'))
    //socket.broadcast.emit('message',generateMessage('Joined'))

    socket.on('join',({username,room},callback) => {
        const {error,user}=addUser({id:socket.id,username,room})

        if(error) {
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message',generateMessage('Admin',`Web Socket Welcomes ${user.username} `))
        socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined`))
        io.to(user.room).emit('roomData',{
            room : user.room,
            users : getUserInRoom(user.room)
        })

        callback()
    })
    socket.on('sendmessage',(message,callback)=> {
        const user=getUser(socket.id)
        const filter=new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    })

    socket.on('sendlocation',(coords,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('locationmessage',generateMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        
        if(user){
            io.to(user.room).emit('message',generateMessage(`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room : user.room,
                users : getUserInRoom(user.room)
            })
        }
    })
})



server.listen(port,() => {
    console.log(`Server is upto ${port}`)
})