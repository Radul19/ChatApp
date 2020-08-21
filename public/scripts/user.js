const body = document.getElementById('body')
const searchBar = document.getElementById('searchbar')
const searchedBox = document.getElementById('searched-box')
const OwnerUsername = document.getElementById('owner-username')
const usersCtn = document.getElementById('chats-ctn')
const chatAbsolute = document.getElementById('chat-box-absolute')
const cross = document.getElementById('cross')
const friendUsername = document.getElementById('friend-username')
const chatInput = document.getElementById('chat-input')
const inputFile = document.getElementById('input-file')
const uploadBar = document.getElementById('upload-bar')
const inputBtn = document.getElementById('input-button')
const userProfilePicture = document.getElementById('userProfilePicture')
const userProfilePicDiv = document.getElementById('userProfilePicDiv')
const userProfilePicInput = document.getElementById('userProfilePicInput')

let User
let OwnerDoc

const db = firebase.firestore()
const auth = firebase.auth()
const storage = firebase.storage();

//Functions
const loadChat = async (uniqId, msgs) => {
    let injectText = document.getElementById('inject-text')
    let totalmsg = injectText.childNodes.length
    for (each in msgs) {
        let fileBool = false
        let type
        let typeComplete
        let url
        let msg = msgs[each]
        let regEx = /\.[a-z1-9]{1,4}$/i
        if (each > totalmsg) {
            if (regEx.test(msg.text)) {
                let storageRef = storage.ref(`${uniqId}/` + msg.text)
                await storageRef.getMetadata()
                    .then(async (res) => {
                        url = await storageRef.getDownloadURL()
                        typeComplete = res.contentType
                        type = res.contentType.split('/')[0]
                        fileBool = true
                    })
            }
            if (!fileBool) {
                type = 'text'
                //TEXT USER CONFIRMATION
                let content = document.createElement('p')
                content.textContent = msg.text
                setItemOwner(injectText, content, msg.owner, type)
            } else {
                //FILE USER CONFIRMATION
                if (type == 'image') {
                    let content = document.createElement('img')
                    content.setAttribute('src', url)
                    setItemOwner(injectText, content, msg.owner, type)
                } else if (type == 'audio') {
                    let content = document.createElement('DIV')
                    let contentAudio = document.createElement('audio')
                    let contentSource = document.createElement('source')
                    contentAudio.controls = true
                    contentSource.setAttribute('src', url)
                    contentSource.setAttribute('type', typeComplete)
                    contentAudio.append(contentSource)
                    content.append(contentAudio)

                    setItemOwner(injectText, content, msg.owner, type)

                } else if (type == 'application') {

                    let content = document.createElement('object')
                    content.setAttribute('data', url)
                    setItemOwner(injectText, content, msg.owner, type)
                } else if (type == 'video') {
                    let content = document.createElement('DIV')
                    let contentVideo = document.createElement('video')
                    let contentSource = document.createElement('source')
                    contentVideo.controls = true
                    contentSource.setAttribute('src', url)
                    contentSource.setAttribute('type', typeComplete)
                    contentVideo.append(contentSource)
                    content.append(contentVideo)

                    setItemOwner(injectText, content, msg.owner, type)
                }
            }
        }
    }
}
const setItemOwner = (injectText, content, ownerMsg, type) => {
    if (ownerMsg == User.username) {
        content.classList.add(`user-${type}`)
        seeChild(injectText, content)
    } else {
        content.classList.add(`friend-${type}`)
        seeChild(injectText, content)
    }
}
const seeChild = (injectText, content) => {
    if (injectText.children[0]) {
        injectText.insertAdjacentElement('beforeend', content)
    } else {
        injectText.append(content)
    }
}
const sortArr = (item1, item2) => {
    let arr = [item1, item2]
    arr.sort()
    arr = arr.join('')
    return arr
}
const getChatById = (Id) => db.collection('chats').doc(Id).get()
const getChats = () => db.collection('chats').get()
const getUserByName = async (name) => {
    return await getUsers()
        .then(res => {
            for (doc of res.docs) {
                if (doc.data().username == name) {
                    return doc
                }
            }
        })
}
const getUserById = (Id) => db.collection('users').doc(Id)
const getUsers = () => db.collection("users").get()
const getUserByEmail = async (email) => {
    return await getUsers()
        .then(res => {
            for (doc of res.docs) {
                if (doc.data().email == email) {
                    console.log('wtf')
                    return doc
                }
            }
        })
}
const loadDom = async () => {

    let storageRef = storage.ref(`${OwnerDoc.id}`)
    await storageRef.getMetadata()
        .then(async (res) => {
            userProfilePicture.src = await storageRef.getDownloadURL()
        }).catch(err => {
            console.log(err)
        })

    let res = await getUserById(OwnerDoc.id).get()
    while (usersCtn.hasChildNodes()) {
        usersCtn.removeChild(usersCtn.firstChild)
    }
    if (res.data().friends) {
        for (each of res.data().friends) {
            let profilePicUrl
            if (each != '') {
                await getUserByName(each)
                    .then(async (res) => {
                        console.log(res.id)
                        let storageRef = storage.ref(`${res.id}`)
                        await storageRef.getMetadata()
                            .then(async (res) => {
                                profilePicUrl = await storageRef.getDownloadURL()
                            }).catch(err => {
                                profilePicUrl = './img/user.png'
                            })
                    })
                const newDiv = document.createElement('DIV')
                newDiv.classList.add('user-box')
                newDiv.innerHTML =
                    `<img src="${profilePicUrl}" class="user-img" alt="">
                <h1 class="user_name">${each}</h1>
                <div class="user_btns">
                <button class="user_btn-go" id="user-btn-goChat" value="${each}">Go to Chat</button>
                <button class="user_btn-delete" id="user-btn-delete" value="${each}">Delete User</button>
                </div>`
                usersCtn.appendChild(newDiv)
            }
        }
    }
}




cross.addEventListener('click', () => {
    let injectText = document.getElementById('inject-text')
    while (injectText.hasChildNodes()) {
        injectText.removeChild(injectText.firstChild)
    }
    chatAbsolute.classList.add('dsp-none')
})



///////////////////DONT TOUCH
//Auth User
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // User is signed in.
        console.log(user)
        let Owner = await getUserByEmail(user.email)
        console.log(Owner)
        OwnerUsername.textContent = Owner.data().username
        User = Owner.data()
        OwnerDoc = Owner
        loadDom()

    } else {
        // No user is signed in.
        window.location.href = 'index.html'
    }
});




//Searchbar////////////////////////////////////////
searchBar.addEventListener('focusin', async () => {
    //CSS
    const div = document.createElement('DIV')
    div.setAttribute('class', 'black-screen')
    body.insertBefore(div, body.children[0])
    searchedBox.classList.remove('dsp-none')
})
searchBar.addEventListener('focusout', () => {
    body.removeChild(body.children[0])
    searchedBox.classList.add('dsp-none')
})
searchBar.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        while (searchedBox.firstChild) { searchedBox.removeChild(searchedBox.firstChild) }
        let barValue = searchBar.value
        //HTML
        //PrintUsername
        await getUsers()
            .then(async (res) => {
                let arr = ['']
                for (doc of res.docs) {
                    let bool = false
                    let username = doc.data().username
                    let aux = await getUserById(OwnerDoc.id).get()
                    aux = aux.data().friends
                    if (aux) {
                        for (each of aux) {
                            if (each == username) { bool = true }
                        }
                    }
                    if (!username.search(barValue) && barValue != '' && !bool) {
                        //Push in Array
                        for (each in arr) {
                            if (arr[each] == '') { arr.shift() }
                            arr.push(username)
                            //Find Profile Pic
                            let profilePicUrl
                            let storageRef = storage.ref(`${doc.id}`)
                            await storageRef.getMetadata()
                                .then(async (res) => {
                                    profilePicUrl = await storageRef.getDownloadURL()
                                }).catch(err => {
                                    profilePicUrl = './img/user.png'
                                })

                            const newDiv = document.createElement('DIV')
                            newDiv.classList.add('searched-user')
                            newDiv.innerHTML =
                                `<img src="${profilePicUrl}" alt="" class='friend-profile'>
                                <p class="friend-username">${arr[each]}</p>
                                <button type="submit" class="btn-add" id="add-btn" value=${arr[each]}>Add</button>`
                            searchedBox.appendChild(newDiv)
                        }
                        let addBtn = document.getElementById('add-btn')
                        addBtn.addEventListener('mousedown', async (e) => {
                            e.preventDefault()
                            let targetUsername = e.target.value
                            let doc = await getUserByName(targetUsername)
                            let arrId = sortArr(OwnerDoc.id, doc.id)
                            db.collection('chats').doc(`${arrId}`).set({
                                messages: {}
                            })
                            getUserById(OwnerDoc.id).set({
                                friends: firebase.firestore.FieldValue.arrayUnion(`${targetUsername}`),
                                chats: firebase.firestore.FieldValue.arrayUnion(`${arrId}`)
                            }, { merge: true })
                            getUserById(doc.id).set({
                                friends: firebase.firestore.FieldValue.arrayUnion(`${User.username}`),
                                chats: firebase.firestore.FieldValue.arrayUnion(`${arrId}`)
                            }, { merge: true }).then(res => {
                                loadDom()
                            })
                        })
                    }
                }

            })
    }
})

//Btns Logout
const logoutBtn = document.getElementById('btn-logout')
logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        console.log('sign Out')
        window.location.assign('index.html')
    })
})
//Delete Button
window.addEventListener('click', async (e) => {
    if (e.target.id == 'user-btn-delete') {
        let doc = await getUserByName(e.target.value)
        let uniqId = sortArr(doc.id, OwnerDoc.id)
        await getUserById(doc.id).set({
            friends: firebase.firestore.FieldValue.arrayRemove(`${User.username}`)
        }, { merge: true })
        await getUserById(OwnerDoc.id).set({
            friends: firebase.firestore.FieldValue.arrayRemove(`${e.target.value}`)
        }, { merge: true }).then(res => {
            db.collection('chats').doc(uniqId).delete()
            storage.ref(`${uniqId}/`).delete()
            loadDom()
        })
    }
})
//Go Chat Button
window.addEventListener('click', async (e) => {
    if (e.target.id == 'user-btn-goChat') {
        let uniqId
        let targetUsername = e.target.value
        let Friend
        let res = await getUserByName(targetUsername)
        Friend = res.data()
        uniqId = sortArr(res.id, OwnerDoc.id)

        let chatRoom = await getChatById(uniqId)

        //Create Chat if doesnt exists
        if (chatRoom.exists == false) { db.collection('chats').doc(uniqId).set({ messages: {} }) }
        friendUsername.textContent = Friend.username
        chatAbsolute.classList.remove('dsp-none')
        db.collection('chats').doc(uniqId)
            .onSnapshot({
                // Listen for document metadata changes
                // includeMetadataChanges: true
            }, function (doc) {
                //Clean Chat and Inject
                let msgs = doc.data().messages
                loadChat(uniqId, msgs)
            });
    }
})
//Already in Chat Room
chatInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        if (chatInput.value != '') {
            let textSend = chatInput.value
            let targetUsername = e.target.parentElement.previousElementSibling.previousElementSibling.lastElementChild.textContent
            let friend = await getUserByName(targetUsername)
            let uniqId = sortArr(friend.id, OwnerDoc.id)
            db.collection('chats').doc(uniqId).update({
                messages: firebase.firestore.FieldValue.arrayUnion({
                    owner: User.username,
                    text: textSend,
                    date: Date.now()
                })
            })
            chatInput.value = ''
        }
    }
})

//Upload File in Chat
inputFile.addEventListener('change', async (e) => {
    let friendUsername = e.target.parentElement.parentElement.previousElementSibling.previousElementSibling.lastElementChild.textContent
    let friend = await getUserByName(friendUsername)
    let uniqId = sortArr(friend.id, OwnerDoc.id)

    //Get file
    let file = e.target.files[0]
    //Create a storage ref
    let storageRef = storage.ref(`${uniqId}/` + file.name)

    // Upload file

    let task = storageRef.put(file)
    // Progress bar
    task.on('state_changed', (snapshot) => {
        if (uploadBar.classList.contains('dsp-none')) {
            uploadBar.classList.remove('dsp-none')
        }
        let percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        uploadBar.value = percent
        console.log('progress')
    }, (err) => {
        console.log('err')
    }, () => {
        console.log('complete!')
        uploadBar.classList.add('dsp-none')
        uploadBar.value = 0
        db.collection('chats').doc(uniqId).update({
            messages: firebase.firestore.FieldValue.arrayUnion({
                owner: User.username,
                text: file.name,
                date: Date.now()
            })
        })
    })

})

//Enter button > chat
inputBtn.addEventListener('click', async (e) => {
    if (chatInput.value != '') {
        let textSend = chatInput.value
        let targetUsername = e.target.parentElement.previousElementSibling.previousElementSibling.lastElementChild.textContent
        let friend = await getUserByName(targetUsername)
        let uniqId = sortArr(friend.id, OwnerDoc.id)
        db.collection('chats').doc(uniqId).update({
            messages: firebase.firestore.FieldValue.arrayUnion({
                owner: User.username,
                text: textSend,
                date: Date.now()
            })
        })
        chatInput.value = ''
    }
})
//Update Profile Picture > click
userProfilePicDiv.addEventListener('click', () => {
    userProfilePicInput.click()
})
//Update Profile Picture
userProfilePicInput.addEventListener('change', async (e) => {
    let file = e.target.files[0]
    let type
    type = file.type.split('/')[0]
    console.log(type)
    if (type == 'image') {
        //Create a storage ref
        let storageRef = storage.ref(`${OwnerDoc.id}`)

        // Upload file

        let task = storageRef.put(file)

        task.on('state_changed', (snapshot) => {
        }, (err) => {
            console.log(err)
        }, () => {
            location.reload();
        })
    }
})