const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator');  

const Note = require('../models/Note');


router.get('/fetchallnotes' , async(req, res) => {
  const {id} = req.user;
    const note = await Note.find({user: id}) 
    res.json(note)
})


router.post('/addnotes', [
    body('title', "Enter atleast 3 chracters").isLength({ min: 4 }),
    body('description', "Add more than 6 characters").isLength({ min: 6 }),
],  async(req, res) => {
  const {id} = req.user;
  try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description ,tag} = req.body;

        const note = new Note({
            title,description,tag,user:id
        })
        const saveNote = await note.save();
    
        res.json(saveNote);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})


router.put('/updatenotes/:id', [
    body('title', "Enter atleast 3 chracters").isLength({ min: 4 }),
    body('description', "Add more than 6 characters").isLength({ min: 6 }),
],  async(req, res) => {
  const {id} = req.user;
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

        if(note.user.toString() !== id){
            return res.status(404).send("Not Allowed");  //if other try to access the notes
        }
        note = await Note.findByIdAndUpdate(req.params.id, {$set:newNote}, {new:true});
        res.status(200).json({note});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})

// Route 4 : Endpoint to delete notes /api/notes/deletenotes/:id

router.delete('/deletenotes/:id', async(req, res) => {
  const {id} = req.user;
  try {
        // find the note to be updated
        let note = await Note.findById(req.params.id);

        if(!note){return res.status(404).send("Not Found")} //if note not exist
        //  check authentication of user
        if(note.user.toString() !== id){
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