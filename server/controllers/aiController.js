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

// Helper function to handle API calls with retry logic for rate limits
const callWithRetry = async (apiCall, maxRetries = 3) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await apiCall();
        } catch (error) {
            // Check multiple possible locations for status code
            const status = error?.status || 
                          error?.statusCode || 
                          error?.response?.status || 
                          error?.response?.statusCode ||
                          (error?.code === 'rate_limit_exceeded' ? 429 : null);
            
            // Check if it's a 429 rate limit error
            if (status === 429 && attempt < maxRetries - 1) {
                // Exponential backoff: wait 2^attempt seconds
                const waitTime = Math.pow(2, attempt) * 1000;
                console.log(`Rate limit hit. Retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }
            
            // If it's a 429 on the last attempt or other error, throw it
            throw error;
        }
    }
};

// Helper function to handle errors and send appropriate responses
const handleError = (error, res) => {
    console.error('API Error:', {
        message: error?.message,
        status: error?.status,
        statusCode: error?.statusCode,
        response: error?.response,
        code: error?.code
    });
    
    // Check multiple possible locations for status code
    const status = error?.status || 
                  error?.statusCode || 
                  error?.response?.status || 
                  error?.response?.statusCode ||
                  (error?.code === 'rate_limit_exceeded' ? 429 : null);
    
    // Extract error message from various possible locations
    const errorMessage = error?.message || 
                        error?.response?.data?.error?.message ||
                        error?.response?.data?.message ||
                        error?.error?.message ||
                        'An unexpected error occurred';
    
    if (status === 429 || error?.code === 'rate_limit_exceeded') {
        return res.status(429).json({
            success: false,
            message: 'Rate limit exceeded. Please wait a moment and try again.'
        });
    }
    
    if (status === 401 || status === 403) {
        return res.status(status).json({
            success: false,
            message: 'API authentication failed. Please check your API key configuration.'
        });
    }
    
    return res.status(status || 500).json({
        success: false,
        message: errorMessage
    });
};

export const generateArticle= async (req,res)=>{
    try{
        const {userId}= req.auth();
        const {prompt,length }= req.body;
        const plan= req.plan;
        const free_usage= req.free_usage;

        if(plan!=='premium' && free_usage>=10){
            return res.json({success: false, message:"Limit reached,update to continue"})
        }

        const response = await callWithRetry(() => 
            openai.chat.completions.create({
                model: "gemini-2.0-flash",
                messages: [
                    {
                        role: "user",
                        content:prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: length,
            })
        );

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
        return handleError(error, res);
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

        const response = await callWithRetry(() => 
            openai.chat.completions.create({
                model: "gemini-2.0-flash",
                messages: [
                    {
                        role: "user",
                        content:prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 1000,
            })
        );

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
        return handleError(error, res);
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

    const response = await callWithRetry(() => 
      openai.chat.completions.create({
        model: "gemini-2.0-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      })
    );

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
    return handleError(error, res);
  }
};
