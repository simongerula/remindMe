const express = require('express')
const router = express.Router()

const mysqlConnection = require('../src/database')

router.get('/', (req,res) =>{
    res.send("Welcome to Recuerdame API")
})

router.get('/memories', (req,res) =>{
    mysqlConnection.query('SELECT * FROM recuerdos', (err, rows, fields) => {
        if(!err){
            res.json(rows)
        } else {
            console.log(err)
        }
    })
})

router.get('/memories/:id', (req,res) => {
    const { id } = req.params
    mysqlConnection.query('SELECT * FROM recuerdos WHERE id = ?', [id], (err, rows, fields) => {
        if(!err){
            res.json(rows[0])
        } else {
            res.json('Memory not found')
            console.log(err)
        }
    })
})

router.post('/recuerdos', (req,res) => {
    const { num_usuario, txt_recuerdo, recordar_at, msg_id, reply_msg} = req.body
    mysqlConnection.query('INSERT INTO recuerdos (num_usuario, txt_recuerdo, status, recordar_at, msg_id, reply_msg) VALUES(?, ?, "Pending", ?, ?, ?)', [num_usuario, txt_recuerdo, recordar_at, msg_id, reply_msg], (err) =>{
        if(!err){
            res.json("Recuerdo creado con exito")
        } else {
            res.json('Fallo al crear recuerdo')
            console.log(err)
        }
    })
})

router.put('/recuerdos/:id', (req,res) => {
    const { txt_recuerdo, recordar_at } = req.body
    const { id } = req.params
    mysqlConnection.query('UPDATE recuerdos SET txt_recuerdo = ? , recordar_at = ? WHERE id = ?', [txt_recuerdo, recordar_at, id], (err) => {
        if(!err){
            res.json("Recuerdo editado con exito")
        } else {
            res.json('Fallo al editar el recuerdo')
            console.log(err)
        } 
    })
})

router.delete('/recuerdos/:id', (req,res) => {
    const { id } = req.params
    mysqlConnection.query('DELETE FROM recuerdos WHERE id = ?', [id], (err) => {
        if(!err){
            res.json("Recuerdo eliminado con exito")
        } else {
            res.json('Fallo al eliminar el recuerdo')
            console.log(err)
        } 
    })

})


/* ------------------------------------------------------------------------------------- */

router.post('/memories', (req, res) => {
    const {sender_psid, txt_memory, remember_at} = req.body
    mysqlConnection.query('INSERT INTO memories (sender_psid, txt_memory, remember_at, status) VALUES(?, ?, ?, "Pending")', [sender_psid, txt_memory, remember_at], (err) =>{
        if(!err){
            res.json("Memory created successfully")
        } else {
            res.json('Failed to create memory')
            console.log(err)
        }
    })
})

router.get('/cron', async (req,res) =>{
    let rowsT
    //const fecha_hoy = new Date()
    let date_today = new Date().toLocaleString("en-US", {timeZone: 'Pacific/Auckland'})
    date_today = new Date(date_today)
    const current_date = date_today.getFullYear() + "-" + (date_today.getMonth()+1) + "-" + date_today.getDate() + " " + date_today.getHours() + ":" + date_today.getMinutes() + ":" + date_today.getSeconds()

    mysqlConnection.query('SELECT * FROM memories WHERE status = "Pending" AND remember_at <= ?', [current_date], (err, rows, fields) => {
        if(!err){
            if(rows == ""){
                res.json("No pending memories found")
            } else {
                res.json(rows)
            }
            rowsT = rows
        } else {
            res.json('Failed to retrieve memories for cron')
            console.log(err)
        }
    })
    await sleep(2000)
    function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
    }  
    for(const i in rowsT){
        console.log(rowsT[i].id)
        mysqlConnection.query('UPDATE memories SET status = "Processed" where id = ?', [rowsT[i].id], (err, rows, fields) => {
        })                
    }
})

module.exports = router