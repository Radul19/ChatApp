const loginForm = document.getElementById('loginForm')
const auth = firebase.auth()
const iptEmail = document.getElementById('input-email')
const iptPassword = document.getElementById('input-password')


const redirect = () => {
    window.location.href = 'user.html'
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    let email = iptEmail.value
    let password = iptPassword.value

    await auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log('sigIn')
            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
                .then((session) => {
                    // Existing and future Auth states are now persisted in the current
                    // session only. Closing the window would clear any existing state even
                    // if a user forgets to sign out.
                    // ...
                    // New sign-in will be persisted with session persistence.
                    return firebase.auth().signInWithEmailAndPassword(email, password);
                })
                .catch(error => {
                    
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message
                    console.log('User not found')
                });
            redirect()
        }).catch(err => {
            console.log(err.message)
            loginForm.classList.add('validation-error')
        })
})
