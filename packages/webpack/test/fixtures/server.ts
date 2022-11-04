import express from 'express'
import routes from '@fs-dite/routes'

async function run() {
    const app = express()

    console.log(routes)
    app.get('/', (req, res) => {
        res.send('hello world');
    })

    return new Promise((resolve) => {
        app.listen(3000, () => {
            resolve(app)
        })
    })
}

run()