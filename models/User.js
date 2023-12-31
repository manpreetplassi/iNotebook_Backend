const mongoose = require('mongoose');
const {Schema} = require('mongoose');

const UserSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
    },
    date:{
        type: Date,
        default: Date.now
    },
});

const virtuals = UserSchema.virtual('id');
virtuals.get(function(){
  return this._id;
})
UserSchema.set('toJSON',{
  virtuals: true,
  versionKey: false,
  transform: function(doc,ret){delete ret._id}
})
module.exports = mongoose.model("user", UserSchema);