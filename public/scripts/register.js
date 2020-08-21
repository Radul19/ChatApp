const registerForm = document.getElementById('registerForm')
const db = firebase.firestore()
const auth = firebase.auth()
const iptUsername = document.getElementById('input-username')
const iptEmail = document.getElementById('input-email')
const iptPassword = document.getElementById('input-password')
const iptConfirmPassword = document.getElementById('input-confirmPassword')
const registerBtn = document.getElementById('register-btn')

const usernameDiv = document.getElementById('username-div')
const emailDiv = document.getElementById('email-div')
const passDiv = document.getElementById('pass-div')
const passConfirmDiv = document.getElementById('passConfirm-div')


const saveUser = async (username, email) => {
    await db.collection('users').doc().set({
        username,
        email,
    })
    console.log('user in database')
}



registerForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const username = iptUsername.value
    const email = iptEmail.value
    const password = iptPassword.value
    const confirmPassword = iptConfirmPassword.value

    if (password == confirmPassword) {
        await auth.createUserWithEmailAndPassword(email, password)
            .then(async userCrendential => {
                await saveUser(username, email)
                return window.location.href = 'user.html'
            }).catch(err => {
                console.log(err)
            })
    }

})
// FUNCTIONS
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

const getUserByEmail = async (email) => {
    return await getUsers()
        .then(res => {
            for (doc of res.docs) {
                if (doc.data().email == email) {
                    return doc
                }
            }
        })
}
const getUsers = () => db.collection("users").get()

//Inputs Validations
iptUsername.addEventListener('focusout', async () => {
    if (await getUserByName(iptUsername.value)) {
        usernameDiv.classList.add('username-wrong-sing')
    } else {
        usernameDiv.classList.remove('username-wrong-sing')
    }
})

iptEmail.addEventListener('focusout', async () => {
    if (await getUserByEmail(iptEmail.value)) {
        emailDiv.classList.add('email-wrong-sing')
    } else {
        emailDiv.classList.remove('email-wrong-sing')
    }
})

iptConfirmPassword.addEventListener('focusout', async () => {
    if (iptPassword.value != iptConfirmPassword.value) {
        passConfirmDiv.classList.add('passConfirm-wrong-sing')
    } else {
        passConfirmDiv.classList.remove('passConfirm-wrong-sing')
    }
})

registerForm.addEventListener('change', () => {
    if (usernameDiv.classList.contains('username-wrong-sing') || emailDiv.classList.contains('email-wrong-sing') || passConfirmDiv.classList.contains('passConfirm-wrong-sing')) {
        registerBtn.setAttribute('disable', false)
    } else {
        registerBtn.setAttribute('disable', true)
    }

})