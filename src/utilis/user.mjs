const users=[]

// adduser,removeuser,getuser,getUsersinRoom


// adduser
const addUser = ({id,username,room}) => {
    // clean data -> trim,to lowercase
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    // validate data;
    if(!username || !room){
        return {
            error : 'Username and room both are required'
        }
    }

    // check for existing user
    const existingUser =users.find((user) => {
        return user.room===room && user.username===username
    })

    // validate username
    if(existingUser) {
        return {
            error : 'Username is in use'
        }
    }

    // store user
    const user= {id,username,room}
    users.push(user)
    return {user}
}


const removeUser = (id) => {
    const index=users.findIndex((user) => {
        return user.id===id
    })

    if(index!==-1){
        return users.splice(index,1)[0];
    }
}


const getUser = (id)=> {
    return users.find((user)=>{
        return user.id===id
    })
}


const getUserInRoom=(room) => {
    room=room.toLowerCase().trim()
    return users.filter((user)=>{
        return user.room===room
    })
}

export  {
    addUser,removeUser,getUser,getUserInRoom
}