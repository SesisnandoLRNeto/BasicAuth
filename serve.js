const express = require('express')
// const basicAuth = require('express-basic-auth')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())

var users = {}

app.post('/createUser', (req, res)=> {
    const { password, username: user, role } = req.body

    const encryptedPass = bcrypt.hashSync(password, 1)

    users[user] = {
        password: encryptedPass,
        role: role
    }

    res.send(`User has created: ${user}`)

})

app.post('/login', (req, res, next)=>{
    const { password, username: user } = req.body
    if((users[user]) && (bcrypt.compareSync(password, users[user].password))){
        const token = jwt.sign({
            "disciplinas": "AAS",
            "role": users[user].role
        },
        "privateKey",
        { 
            expiresIn: 300
        })

        return res.json({auth: true, token})
    } return res.status(401).json({message: 'Not permissions'})
})

function getRole(username) {
    console.log(username)
    if(username === 'admin') return 'admin'
    return 'common'
}

function allow(...allowed) {
    const isAllowed = role => allowed.indexOf(role) > -1

    return (req, res, next) => {
        if(req.auth.user) {
            const role = getRole(req.auth.user)

            if(isAllowed(role)) next()
            res.status(403).json({ message: 'Not authorized'})
        } res.status(403).json({ message: 'Not found this user' })
    };
}

//With Basic Auth
// app.use(
//     basicAuth({
//         // users: { 'admin': 'admin'}
//         authorizer: (username, password) => {
//             const userMatches = basicAuth.safeCompare(username, 'admin')
//             const pwdMatches = basicAuth.safeCompare(password, 'admin')

//             const userMatchesCommon = basicAuth.safeCompare(username, 'common')
//             const pwdMatchesCommon = basicAuth.safeCompare(password, 'common')

//             return userMatches && pwdMatches || userMatchesCommon && pwdMatchesCommon;
//         }
//     }))


app.use('/updateAll', allow('admin'))
app.use(['/findAll', '/findSomething'], allow('common', 'admin'))

app.get('/', (req, res)=>{
    res.send('GET')
})



app.get('/findAll', (req, res)=>{
    res.send('Find All')
})

app.get('/findsomething', (req, res)=>{
    res.send('Find Something')
})

app.get('/updateAll', (req, res)=>{
    res.send('Update All')
})


app.listen(3333, ()=> console.log('Port 3333: Server up'))


