const generateMessage = (username,text) => {
    return {
        username,
        text : text,
        createdAt : new Date().getTime()
    }
}

export default generateMessage