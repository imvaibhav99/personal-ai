import OpenAI from "openai";
import sql from "../config/db.js";
import axios from "axios";
import cloudinary from "../config/cloudinary.js";
import fs from 'fs'
import pdf from 'pdf-parse/lib/pdf-parse.js'
import { clerkClient } from '@clerk/express'

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});



export const generateArticle= async (req,res)=>{
    try{
        const {userId}= req.auth();
        const {prompt,length }= req.body;
        const plan= req.plan;
        const free_usage= req.free_usage;

        if(plan!=='premium' && free_usage>=10){
            return res.json({success: false, message:"Limit reached,update to continue"})
        }

const response = await openai.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
        {
            role: "user",
            content:prompt,
        },
    ],
    temperature: 0.7,
    max_tokens: length,
});

    const content= response.choices[0].message.content 

    await sql` INSERT INTO creations (user_id, prompt, content, type) 
    VALUES (${userId}, ${prompt}, ${content}, 'article' )`;

    if(plan!=='premium'){
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata:{
                free_usage: free_usage +1
            }
        })
    }
        res.json({ success: true, content})

    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
        
    }
}




export const generateBlogTitle = async (req,res)=>{
    try{
        const {userId}= req.auth();
        const {prompt }= req.body;
        const plan= req.plan;
        const free_usage= req.free_usage;

        if(plan!=='premium' && free_usage>=10){
            return res.json({success: false, message:"Limit reached,update to continue"})
        }

const response = await openai.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
        {
            role: "user",
            content:prompt,
        },
    ],
    temperature: 0.7,
    max_tokens: 1000,
});

    const content= response.choices[0].message.content 

    await sql` INSERT INTO creations (user_id, prompt, content, type) 
    VALUES (${userId}, ${prompt}, ${content}, 'blog-title' )`;

    if(plan!=='premium'){
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata:{
                free_usage: free_usage +1
            }
        })
    }
        res.json({ success: true, content})

    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
        
    }
}




export const generateImage = async (req,res)=>{
    try{
        const {userId}= req.auth();
        const {prompt, publish }= req.body;
        const plan = req.plan;
        

        if(plan!=='premium' ){
            return res.json({success: false, message:"Premium required"})
        }

        const formData = new FormData()
        formData.append('prompt', prompt)
        const {data} = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY,
            },
            responseType: "arraybuffer",
        }) 

      const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;


         const {secure_url}=  await cloudinary.uploader.upload(base64Image); //live url for uploaded image

    await sql` INSERT INTO creations (user_id, prompt, content, type, publish) 
    VALUES (${userId}, ${prompt}, ${secure_url}, 'image',${publish??false})`;

        res.json({ success: true, content: secure_url})

    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
        
    }
}

export const removeImageBackground = async (req,res)=>{
    try{
        const {userId}= req.auth();
        const image = req.file;
        const plan= req.plan;
        

        if(plan!=='premium' ){
            return res.json({success: false, message:"Premium required"})
        }

         const {secure_url}=  await cloudinary.uploader.upload(image.path,{
            transformation:[
                {
                    effect:'background_removal',
                    background_removal: 'remove_the_background'
                }
            ]
         }); //live url for uploaded image

    await sql` INSERT INTO creations (user_id, prompt, content, type) 
    VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')`;    //storing in neon db

        res.json({ success: true, content: secure_url})

    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
        
    }
}



export const removeImageObject = async (req,res)=>{
    try{
        const {userId}= req.auth();
         const {object}= req.body;
        const image = req.file;
        const plan= req.plan;
        

        if(plan!=='premium' ){
            return res.json({success: false, message:"Premium required"})
        }

         const {public_id}=  await cloudinary.uploader.upload(image.path); //live url for uploaded image

       const imageUrl= cloudinary.url(public_id,{
            transformation:[{effect: `gen_remove:${object}`}],
            resource_type: 'image'
        })

    await sql` INSERT INTO creations (user_id, prompt, content, type) 
    VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')`;    //storing in neon db

        res.json({ success: true, content: imageUrl })

    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
        
    }
}

export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;   // ✅ use same plan check as other routes

    if (!resume) {
      return res.json({ success: false, message: "No resume uploaded" });
    }

    if (plan !== "premium") {
      return res.json({ success: false, message: "Premium required" });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume file size exceeds allowed size (5MB)",
      });
    }

    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);

    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement.\n\nResume Content:\n\n${pdfData.text}`;

    const response = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type) 
      VALUES (${userId}, 'Review the uploaded resume', ${content}, 'review-resume')
    `;

    // inside resumeReview controller
res.json({
  success: true,
  analysis: {
    summary: content,          // AI’s raw text/summary
    strengths: [],             // optionally extract bullet points
    improvements: []           // optionally extract weaknesses
  }
});

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
