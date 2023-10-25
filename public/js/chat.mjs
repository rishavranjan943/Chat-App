const socket=io()

// Elements
const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $sendLocation=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')



// Templates
const messageTemplate=document.querySelector('#message-template').innerHTML

const locationmessagetemplate=document.querySelector('#location-message-template').innerHTML

const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

// Options
const {username,room} =Qs.parse(location.search,{ignoreQueryPrefix : true})
const autoscroll = () => {
    // new message element
    const $newMessage=$messages.lastElementChild

    // Height of new message
    const newMessageStyle=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyle.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin
    console.log(newMessageMargin)


    // visible height
    const visibleHeight=$messages.offsetHeight


    // height of message container
     const containerHeight=$messages.scrollHeight

    //  how far I scrolled??
    const scrollOffset=$messages.scrollTop + visibleHeight

    if(containerHeight-newMessageHeight <= scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }
}

socket.on('message',(msg)=>{
    console.log(msg)
    const html=Mustache.render(messageTemplate,{
        username : msg.username,
        message : msg.text,
        createdAt : moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


socket.on('locationmessage',(link)=>{
    console.log(link)
    const html=Mustache.render(locationmessagetemplate,{
        username : link.username,
        url : link.url,
        createdAt : moment(link.createdAt).format('h:mm a')
        // createdAt : new Date().getTime()
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users}) => {
    console.log(room)
    console.log(users)
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    // disable
    $messageFormButton.setAttribute('disabled','disabled')

    const message=e.target.elements.message.value
    socket.emit('sendmessage',message,(error)=>{
        // enable

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log("The message is delievered")
    })
})

$sendLocation.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation not supported')
    }

    // disabled
    $sendLocation.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        // console.log(position)
        socket.emit('sendlocation',{
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        },()=>{
                // Enabled
                $sendLocation.removeAttribute('disabled')
                console.log('Location shared')
            })
    })
})


socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})