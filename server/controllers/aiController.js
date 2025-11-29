import OpenAI from "openai";
import sql from "../config/db.js";
import axios from "axios";
import cloudinary from "../config/cloudinary.js";
import fs from 'fs'
import pdf from 'pdf-parse/lib/pdf-parse.js'
import { clerkClient } from '@clerk/express'

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    maxRetries: 0, // We handle retries ourselves
    timeout: 60000, // 60 second timeout
});

// Simple request throttling - track last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // Minimum 2 seconds between requests

const throttleRequest = async (apiCall) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
        console.log(`Throttling: Waiting ${waitTime}ms before API call`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    lastRequestTime = Date.now();
    return await apiCall();
};

// Helper function to check if error is a rate limit (429) error
const isRateLimitError = (error) => {
    // Check status code in various locations
    const status = error?.status || 
                  error?.statusCode || 
                  error?.response?.status || 
                  error?.response?.statusCode ||
                  error?.status_code;
    
    // Check error code
    const code = error?.code || error?.type;
    const isRateLimitCode = code === 'rate_limit_exceeded' || 
                           code === 'rate_limit' ||
                           code === '429';
    
    // Check error message for rate limit keywords
    const errorMessage = (error?.message || '').toLowerCase();
    const isRateLimitMessage = errorMessage.includes('429') ||
                              errorMessage.includes('rate limit') ||
                              errorMessage.includes('too many requests') ||
                              errorMessage.includes('quota exceeded');
    
    // Check response data
    const responseData = error?.response?.data || error?.error;
    const responseMessage = (responseData?.message || responseData?.error?.message || '').toLowerCase();
    const isRateLimitResponse = responseMessage.includes('429') ||
                                responseMessage.includes('rate limit') ||
                                responseMessage.includes('too many requests');
    
    return status === 429 || isRateLimitCode || isRateLimitMessage || isRateLimitResponse;
};

// Helper function to handle API calls with retry logic for rate limits
const callWithRetry = async (apiCall, maxRetries = 5) => {
    let lastError = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await apiCall();
        } catch (error) {
            lastError = error;
            const isRateLimit = isRateLimitError(error);
            
            // Log the error structure for debugging
            console.log(`API Call Error (attempt ${attempt + 1}/${maxRetries}):`, {
                isRateLimit,
                status: error?.status || error?.statusCode || error?.response?.status,
                statusCode: error?.statusCode,
                code: error?.code,
                type: error?.type,
                message: error?.message?.substring(0, 200),
                responseStatus: error?.response?.status,
                responseData: error?.response?.data
            });
            
            // Check if it's a 429 rate limit error and we have retries left
            if (isRateLimit && attempt < maxRetries - 1) {
                // Longer exponential backoff: start with 5 seconds, then 10, 20, 40, 80 seconds
                const baseWaitTime = Math.pow(2, attempt) * 5000; // Start at 5 seconds
                const jitter = Math.random() * 2000; // Add 0-2 seconds of jitter
                const waitTime = baseWaitTime + jitter;
                
                console.log(`Rate limit detected. Waiting ${Math.round(waitTime/1000)}s before retry ${attempt + 2}/${maxRetries}`);
                
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }
            
            // If it's not a rate limit error or we've exhausted retries, break
            break;
        }
    }
    
    // If we get here, all retries failed
    throw lastError;
};

// Helper function to handle errors and send appropriate responses
const handleError = (error, res) => {
    // Log full error for debugging
    console.error('API Error Details:', {
        message: error?.message,
        status: error?.status,
        statusCode: error?.statusCode,
        status_code: error?.status_code,
        code: error?.code,
        type: error?.type,
        response: error?.response ? {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data
        } : null,
        error: error?.error,
        stack: error?.stack?.substring(0, 200)
    });
    
    // Check if it's a rate limit error
    const isRateLimit = isRateLimitError(error);
    
    // Check multiple possible locations for status code
    const status = error?.status || 
                  error?.statusCode || 
                  error?.status_code ||
                  error?.response?.status || 
                  error?.response?.statusCode ||
                  (isRateLimit ? 429 : null);
    
    // Extract error message from various possible locations
    const errorMessage = error?.message || 
                        error?.response?.data?.error?.message ||
                        error?.response?.data?.message ||
                        error?.error?.message ||
                        error?.error?.error?.message ||
                        'An unexpected error occurred';
    
    if (isRateLimit || status === 429) {
        // Check if there's a retry-after header or wait time suggestion
        const retryAfter = error?.response?.headers?.['retry-after'] || 
                          error?.response?.headers?.['Retry-After'] ||
                          error?.retryAfter;
        
        const waitTime = retryAfter ? ` Please try again after ${retryAfter} seconds.` : ' Please wait a few minutes and try again.';
        
        return res.status(429).json({
            success: false,
            message: `Rate limit exceeded. The API is temporarily unavailable.${waitTime}`
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
        message: errorMessage || 'An unexpected error occurred. Please try again later.'
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
            throttleRequest(() => 
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
            )
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
            throttleRequest(() => 
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
            )
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
      throttleRequest(() => 
        openai.chat.completions.create({
          model: "gemini-2.0-flash",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1500,
        })
      )
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
