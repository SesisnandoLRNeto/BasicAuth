const express = require('express')
const basicAuth = require('express-basic-auth')

const app = express()

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

app.use(
    basicAuth({
        // users: { 'admin': 'admin'}
        authorizer: (username, password) => {
            const userMatches = basicAuth.safeCompare(username, 'admin')
            const pwdMatches = basicAuth.safeCompare(password, 'admin')

            const userMatchesCommon = basicAuth.safeCompare(username, 'common')
            const pwdMatchesCommon = basicAuth.safeCompare(password, 'common')

            return userMatches && pwdMatches || userMatchesCommon && pwdMatchesCommon;
        }
    }))


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


