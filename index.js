const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./Model/UserModel')
const jwt = require('jsonwebtoken')
const jwtSecret = 'abcdefghijklmnopqrdstuvwxyz12334567890'

const app = express()
app.use(express.json())
app.use(cors())

// mongoose.connect("mongodb+srv://submit:submit@cluster0.xmubjw1.mongodb.net/?retryWrites=true&w=majority")

mongoose.connect("mongodb://127.0.0.1:27017/submit")


//-----------USER ROUTES------------------

app.post('/signup',(req,res)=>{
    User.create(req.body)
    .then(e => res.json(e))
    .catch(err => res.json(err))
})

app.post('/login', async(req,res)=>{
    const {email,password} = req.body

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))){
        jwt.sign({email:user.email, id:user._id ,name:user.name},jwtSecret,{},(err,token)=>{
            if (err) throw err
            res.cookie('token',token).json({
                _id:user.id,
                name:user.name,
                email:user.email,
                token:token,
            })
        })
        
    }else{
        res.status(400).json({
            message:"Enter Valid Creddentials"
        })
    }
} )


//----------PLACES ROUTES---------------
app.get('/list-property',async(req,res)=>{
    res.json(await Place.find())
  })

app.get("/property", (req, res, next) => {
    const { token } = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, user) => {
      const { id } = user;
      res.json(await Place.find({ owner: id }));
    });
  });

app.post("/property", (req, res) => {
    const { token } = req.cookies;
    const {
      title,
      address,
      addedPhotos,
      description,
      perks,
      extraInfo,
      CheckIn,
      CheckOut,
      maxGuests,
      price,
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, user) => {
      if (err) throw err;
      const placeDoc = await Place.create({
        owner: user.id,
        title,
        address,
        photos: addedPhotos,
        description,
        perks,
        extraInfo,
        CheckIn,
        CheckOut,
        maxGuests,
        price,
      });
      res.json(placeDoc);
    });
  });

app.put("/property/:id", async (req, res) => {
    let place = await Place.findById(req.params.id);
    if (!place){
        return next(new ErrorHandler("product not found",404))
    }
    place = await Place.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true,useFindAndModify:false})

    res.status(200).json({
        success:true,
        place
    })
  });

app.delete('/property/:id',async(req,res)=>{
    const place = await Place.findById(req.params.id);
    if (!place){
        return next(new ErrorHandler("product not found",404))
    }

    await Place.deleteOne();
    res.status(200).json({
        success:true,
        message:"Place deleted"
    })
})






app.listen(3000,()=>{console.log("api running")})