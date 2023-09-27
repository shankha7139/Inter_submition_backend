const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const jwtSecret = 'abcdefghijklmnopqrdstuvwxyz12334567890'
const bcrypt = require('bcryptjs')

const UserSchema = mongoose.Schema({
    name:String,
    email:String,
    password:String,
}) 
UserSchema.methods.matchPassword = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}

UserSchema.pre('save',async function (next){
    if (!this.isModified){
        next()
    }
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password,salt)
})
const User = mongoose.model('User',UserSchema)
module.exports = User