import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware, requireAuth } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js'; 
import cloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoutes.js';

const app= express()

// await cloudinary();
  
app.use(cors())
app.use(express.json());
app.use(clerkMiddleware());

app.get('/',(req,res)=>res.send('Server is Live!'))

//app.use(requireAuth());  //for auth in each route
app.use('/api/ai',requireAuth(), aiRouter); 
app.use('/api/user',requireAuth(), userRouter); 

const PORT= process.env.PORT || 3000;



app.listen(PORT, ()=>{
    console.log("Server is running on port", PORT);
    
})