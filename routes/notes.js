const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator');  //for validation no. of chracters

// User model
const Note = require('../models/Note');
const fetchuser = require('../middlewere/fetchuser');

// Route 1 : Endpoint to fatch all notes from the database http://localhost:5000/api/notes/fetchallnotes

router.get('/fetchallnotes',fetchuser, async(req, res) => {
    const note = await Note.find({user: req.user.id}) 
    res.json(note)
})

// Route 2 : Endpoint to add notes to the database http://localhost:5000/api/notes/addnotes

router.post('/addnotes',fetchuser, [
    body('title', "Enter atleast 3 chracters").isLength({ min: 4 }),
    body('description', "Add more than 6 characters").isLength({ min: 6 }),
],  async(req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Extract validated data from the request body
        const { title, description ,tag} = req.body;

        const note = new Note({
            title,description,tag,user:req.user.id
        })
        const saveNote = await note.save();
    
        res.json(saveNote);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})

// Route 3 : Endpoint to update notes http://localhost:5000/api/notes/updatenotes/:id

router.put('/updatenotes/:id',fetchuser, [
    body('title', "Enter atleast 3 chracters").isLength({ min: 4 }),
    body('description', "Add more than 6 characters").isLength({ min: 6 }),
],  async(req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Extract validated data from the request body
        const { title, description ,tag} = req.body;

        // crete a newNote object
        const newNote = {};
        if(title){newNote.title = title}
        if(description){newNote.description = description}
        if(tag){newNote.tag = tag}

        // find the note to be updated
        let note = await Note.findById(req.params.id);  

        if(!note){return res.status(404).send("Not Found")}  //if note not exist

        if(note.user.toString() !== req.user.id){
            return res.status(404).send("Not Allowed");  //if other try to access the notes
        }
        note = await Note.findByIdAndUpdate(req.params.id, {$set:newNote}, {new:true});
        res.status(200).json({note});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})

// Route 4 : Endpoint to delete notes http://localhost:5000/api/notes/deletenotes/:id

router.delete('/deletenotes/:id',fetchuser, async(req, res) => {
    try {
        // find the note to be updated
        let note = await Note.findById(req.params.id);

        if(!note){return res.status(404).send("Not Found")} //if note not exist
        //  check authentication of user
        if(note.user.toString() !== req.user.id){
            return res.status(404).send("Not Found"); 
        }
        note = await Note.findByIdAndDelete(req.params.id)
        res.status(200).json({"Success" : "Note has been deleted successfully", note:note});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})


module.exports = router