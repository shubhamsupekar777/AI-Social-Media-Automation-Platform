// import { Response } from "express";
// import { AuthRequest } from "../middlewares/authMiddlewware.js";
// import axios from "axios";
// import { cloudinary } from "../config/cloudinary.js";
// import { Generation } from "../models/Generation.js";
// import { Post } from "../models/Post.js";
// import OpenAI from "openai";


// // Helper to poll Leonardo.ai
// const pollLeonardoJob = async (generationId: string, apiKey: string) : Promise<string>=>{
//     const maxRetries = 20;
//     const delay = 5000;

//     for(let i = 0; i < maxRetries; i++){
//         try {
//            const response = await axios.get(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {headers: {
//             accept: "application/json", authorization: `Bearer ${apiKey}`
//            }}) 

//            const generation = response.data.generations_by_pk;
//            if(generation.status === "COMPLETE"){
//             if(generation.generated_images && generation.generated_images.length > 0){
//                 return generation.generated_images[0].url;
//             }
//             throw new Error("Generation complete but no images found.")
//            }
//            if(generation.status === "FAILED"){
//             throw new Error("Leonardo.ai generation failed.")
//            }
//         } catch (err: any) {
//             console.error("Polling error:", err?.response?.data || err.message);
//         }

//         await new Promise((resolve)=> setTimeout(resolve, delay));
//     }
//     throw new Error("Leonardo.ai generation timed out.")
// }

// // Generate post
// // POST /api/posts/generate
// export const generatePost = async (req: AuthRequest, res: Response): Promise<void> => {
//     try {
//         const { prompt, tone, generateImage } = req.body;

//         // const apiKey = process.env.GEMINI_API_KEY;
//         // if(!apiKey){
//         //     res.status(400).json({message: "Gemini API Key is missing. Please add it to your server/.env file." });
//         //     return;
//         // }

//         // const ai = new GoogleGenAI({apiKey});

// //         const client = new OpenAI({
// //     apiKey: process.env.GROK_API_KEY,
// //     baseURL: "https://api.x.ai/v1",
// // });

// // if (!process.env.GROK_API_KEY) {
// //     res.status(400).json({
// //         message: "Grok API Key is missing."
// //     });
// //     return;
// // }
// if (!process.env.GROK_API_KEY) {
//     res.status(400).json({
//         message: "Grok API Key is missing."
//     });
//     return;
// }
// console.log("GROK KEY:", process.env.GROK_API_KEY);

// const client = new OpenAI({
//     apiKey: process.env.GROK_API_KEY,
//     baseURL: "https://api.x.ai/v1",
// });
//         // Generate Text
//         // const textResponse = await ai.models.generateContent({
//         //     model: "gemini-2.5-flash",
//         //     contents: `Generate a social media post based on this prompt: "${prompt}". 
//         //     Tone: ${tone}. 
//         //     Include relevant hashtags.
//         //     Format the response as JSON with "content" and "imagePrompt" fields. 
//         //     The "imagePrompt" should be a highly descriptive prompt for an image generator that complements the post.`,
//         // });

//         const textResponse = await client.chat.completions.create({
//     model: "grok-4-fast",
//     temperature: 0.8,
//     messages: [
//         {
//             role: "user",
//             content: `
// Generate a social media post.

// Prompt:
// ${prompt}

// Tone:
// ${tone}

// Include relevant hashtags.

// Return ONLY valid JSON.

// {
//   "content": "",
//   "imagePrompt": ""
// }
// `
//         }
//     ]
// });

//         // let content = "";
//         // let imagePrompt = prompt;

//         // try {
//         //     // const rawText = textResponse.text || "";
//         //     const rawText =textResponse.choices[0]?.message?.content || "";
//         //     const jsonMatch = rawText.match(/\{[\s\S]*\}/);
//         //     const data = jsonMatch ? JSON.parse(jsonMatch[0]) : {content: rawText, imagePrompt: prompt};
//         //     content = data.content;
//         //     imagePrompt = data.imagePrompt;
//         // } catch (e) {
//         //     content = rawText;
//         // }
// let content = "";
// let imagePrompt = prompt;

// const rawText =
//     textResponse.choices[0]?.message?.content || "";

// try {
//     const jsonMatch = rawText.match(/\{[\s\S]*\}/);

//     const data = jsonMatch
//         ? JSON.parse(jsonMatch[0])
//         : {
//               content: rawText,
//               imagePrompt: prompt,
//           };

//     content = data.content;
//     imagePrompt = data.imagePrompt;
// } catch {
//     content = rawText;
// }
//         let mediaUrl = "";
//         if(generateImage){
//            try {
//             const leonardoKey = process.env.LEONARDO_API_KEY;
//             if(leonardoKey){
//                 // Use Leonardo.ai for image generation
//                 const leoResponse = await axios.post(
//                     "https://cloud.leonardo.ai/api/rest/v2/generations",
//                     {
//                         "public": false,
//                         "model": "gpt-image-2",
//                         "parameters": {
//                             "quality": "LOW",
//                             "prompt": imagePrompt,
//                             "quantity": 1,
//                             "width": 1024,
//                             "height": 1024,
//                             "prompt_enhance": "OFF"
//                         }
//                     },{
//                         headers:{
//                             accept: "application/json",
//                             authorization: `Bearer ${leonardoKey}`,
//                             "content-type": "application/json",
//                         }
//                     }
//                 )

//                 const generationId = leoResponse.data.generate.generationId;
//                 const tempUrl = await pollLeonardoJob(generationId, leonardoKey);

//                 // Upload to Cloudinary for persistence
//                 const uploadResult = await cloudinary.uploader.upload(tempUrl, {
//                     folder: "ai-generations",
//                 });
//                 mediaUrl = uploadResult.secure_url;
//             }
//            } catch (err: any) {
//                 console.error("Image generation failed:", err);
//            } 
//         }

//          // Save generation to DB
//           const generation = await Generation.create({
//             user: req.user._id,
//             prompt,
//             content,
//             mediaUrl,
//             mediaType: mediaUrl ? "image" : undefined,
//             tone
//           })

//           res.json(generation)
        
//     } catch (error: any) {
//         res.status(500).json({ message: error?.message || "Server error" });
//     }
// }


// // Get generations
// // GET /api/posts/generations
// export const getGenerations = async (req: AuthRequest, res: Response): Promise<void> => {
//     try {
//         const generations = await Generation.find({user: req.user._id}).sort({createdAt: -1})
//         res.json(generations)
//     } catch (error: any) {
//         res.status(500).json({ message: error?.message || "Server error" });
//     }
// }


// // Get posts
// // GET /api/posts
// export const getPosts = async (req: AuthRequest, res: Response): Promise<void> => {
//     try {
//         const posts = await Post.find({user: req.user._id})
//         res.json(posts)
//     } catch (error: any) {
//         res.status(500).json({ message: error?.message || "Server error" });
//     }
// }


// // Schedule post
// // POST /api/posts
// export const schedulePost = async (req: AuthRequest, res: Response): Promise<void> => {
//     try {
//         const { content, platforms, scheduledFor, status } = req.body;

//         // Parse platforms if it comes as a stringified array from FormData
//         let parsedPlatforms = platforms;
//         if(typeof platforms === "string"){
//             try {
//                 parsedPlatforms = JSON.parse(platforms)
//             } catch (e) {
//                 parsedPlatforms = platforms.split(",");
//             }
//         }

//         let mediaUrl: string | undefined = req.body.mediaUrl;
//         let mediaType: "image" | "video" | undefined = req.body.mediaType;

//         if(req.file){
//             const result = await new Promise<any>((resolve, reject)=>{
//                 const stream = cloudinary.uploader.upload_stream({resource_type: "auto", folder: "social-scheduler"}, (error, result)=>{
//                     if(error) reject(error);
//                     else resolve(result)
//                 });
//                 stream.end(req.file!.buffer);
//             });
//             mediaUrl = result.secure_url;
//             mediaType = result.resource_type === "video" ? "video" : "image";
//         }

//         const post = await Post.create({
//             user: req.user._id,
//             content,
//             platforms: parsedPlatforms,
//             mediaUrl,
//             mediaType,
//             scheduledFor,
//             status,
//         })
//         res.status(201).json(post)

//     } catch (error: any) {
//         res.status(500).json({ message: error?.message || "Server error" });
//     }
// }




// import { Response } from "express";
// import { AuthRequest } from "../middlewares/authMiddlewware.js";
// import { cloudinary } from "../config/cloudinary.js";
// import { Generation } from "../models/Generation.js";
// import { Post } from "../models/Post.js";
// import OpenAI from "openai";

// // Generate post
// // POST /api/posts/generate
// export const generatePost = async (
//     req: AuthRequest,
//     res: Response
// ): Promise<void> => {
//     try {
//         const { prompt, tone } = req.body;

//         // Check Grok API key
//         if (!process.env.GROK_API_KEY) {
//             res.status(400).json({
//                 message:
//                     "Grok API Key is missing. Please add GROK_API_KEY to your server/.env file.",
//             });
//             return;
//         }

//         // Initialize Grok client
//         const client = new OpenAI({
//             apiKey: process.env.GROK_API_KEY,
//             baseURL: "https://api.x.ai/v1",
//         });

//         // Generate text and image prompt using Grok
//         const textResponse = await client.chat.completions.create({
//             model: "grok-4-fast",
//             temperature: 0.8,
//             messages: [
//                 {
//                     role: "user",
//                     content: `
// Generate a social media post.

// Prompt:
// ${prompt}

// Tone:
// ${tone}

// Include relevant hashtags.

// Return ONLY valid JSON.

// {
//     "content": "",
//     "imagePrompt": ""
// }

// The "content" field should contain the final social media post.

// The "imagePrompt" field should contain a detailed image-generation prompt
// that could be used later by an image generation API.
// `,
//                 },
//             ],
//         });

//         let content = "";
//         let imagePrompt = prompt;

//         const rawText =
//             textResponse.choices[0]?.message?.content || "";

//         try {
//             // Extract JSON from Grok response
//             const jsonMatch = rawText.match(/\{[\s\S]*\}/);

//             const data = jsonMatch
//                 ? JSON.parse(jsonMatch[0])
//                 : {
//                       content: rawText,
//                       imagePrompt: prompt,
//                   };

//             content = data.content || rawText;
//             imagePrompt = data.imagePrompt || prompt;
//         } catch (error) {
//             console.error("Failed to parse Grok JSON:", error);

//             content = rawText;
//             imagePrompt = prompt;
//         }

//         // Save generated content to MongoDB
//         // No image is generated currently.
//         const generation = await Generation.create({
//             user: req.user._id,
//             prompt,
//             content,
//             tone,
//         });

//         // Return generated post
//         res.status(200).json({
//             ...generation.toObject(),
//             imagePrompt,
//             mediaUrl: null,
//             mediaType: null,
//         });
//     } catch (error: any) {
//         console.error("Generate post error:", error);

//         res.status(500).json({
//             message: error?.message || "Server error",
//         });
//     }
// };

// // Get generations
// // GET /api/posts/generations
// export const getGenerations = async (
//     req: AuthRequest,
//     res: Response
// ): Promise<void> => {
//     try {
//         const generations = await Generation.find({
//             user: req.user._id,
//         }).sort({ createdAt: -1 });

//         res.json(generations);
//     } catch (error: any) {
//         res.status(500).json({
//             message: error?.message || "Server error",
//         });
//     }
// };

// // Get posts
// // GET /api/posts
// export const getPosts = async (
//     req: AuthRequest,
//     res: Response
// ): Promise<void> => {
//     try {
//         const posts = await Post.find({
//             user: req.user._id,
//         });

//         res.json(posts);
//     } catch (error: any) {
//         res.status(500).json({
//             message: error?.message || "Server error",
//         });
//     }
// };

// // Schedule post
// // POST /api/posts
// export const schedulePost = async (
//     req: AuthRequest,
//     res: Response
// ): Promise<void> => {
//     try {
//         const {
//             content,
//             platforms,
//             scheduledFor,
//             status,
//         } = req.body;

//         // Parse platforms if it comes as a stringified array from FormData
//         let parsedPlatforms = platforms;

//         if (typeof platforms === "string") {
//             try {
//                 parsedPlatforms = JSON.parse(platforms);
//             } catch (error) {
//                 parsedPlatforms = platforms.split(",");
//             }
//         }

//         let mediaUrl: string | undefined = req.body.mediaUrl;
//         let mediaType: "image" | "video" | undefined =
//             req.body.mediaType;

//         // Upload manually provided media to Cloudinary
//         if (req.file) {
//             const result = await new Promise<any>(
//                 (resolve, reject) => {
//                     const stream =
//                         cloudinary.uploader.upload_stream(
//                             {
//                                 resource_type: "auto",
//                                 folder: "social-scheduler",
//                             },
//                             (error, result) => {
//                                 if (error) {
//                                     reject(error);
//                                 } else {
//                                     resolve(result);
//                                 }
//                             }
//                         );

//                     stream.end(req.file!.buffer);
//                 }
//             );

//             mediaUrl = result.secure_url;

//             mediaType =
//                 result.resource_type === "video"
//                     ? "video"
//                     : "image";
//         }

//         // Create scheduled post
//         const post = await Post.create({
//             user: req.user._id,
//             content,
//             platforms: parsedPlatforms,
//             mediaUrl,
//             mediaType,
//             scheduledFor,
//             status,
//         });

//         res.status(201).json(post);
//     } catch (error: any) {
//         console.error("Schedule post error:", error);

//         res.status(500).json({
//             message: error?.message || "Server error",
//         });
//     }
// };





























// // In This Part Text Genration IS Working so now will move to image genrationn

// import { Response } from "express";
// import { AuthRequest } from "../middlewares/authMiddlewware.js";
// import { cloudinary } from "../config/cloudinary.js";
// import { Generation } from "../models/Generation.js";
// import { Post } from "../models/Post.js";
// import OpenAI from "openai";

// // Generate post
// // POST /api/posts/generate
// export const generatePost = async (
//     req: AuthRequest,
//     res: Response
// ): Promise<void> => {
//     try {
//         const { prompt, tone } = req.body;

//         // Check OpenRouter API key
//         if (!process.env.OPENROUTER_API_KEY) {
//             res.status(400).json({
//                 message:
//                     "OpenRouter API Key is missing. Please add OPENROUTER_API_KEY to your server/.env file.",
//             });
//             return;
//         }

//         // Initialize OpenRouter client
//         const client = new OpenAI({
//             apiKey: process.env.OPENROUTER_API_KEY,
//             baseURL: "https://openrouter.ai/api/v1",
//             defaultHeaders: {
//                 "HTTP-Referer": "http://localhost:5173",
//                 "X-Title": "AI Social Media Automation Platform",
//             },
//         });

//         // Generate text and image prompt using OpenRouter
//         const textResponse = await client.chat.completions.create({
//             model: "openrouter/free",
//             temperature: 0.8,
//             messages: [
//                 {
//                     role: "user",
//                     content: `
// Generate a social media post.

// Prompt:
// ${prompt}

// Tone:
// ${tone}

// Include relevant hashtags.

// Return ONLY valid JSON.

// {
//     "content": "",
//     "imagePrompt": ""
// }

// The "content" field should contain the final social media post.

// The "imagePrompt" field should contain a detailed image-generation prompt
// that could be used later by an image generation API.
// `,
//                 },
//             ],
//         });

//         let content = "";
//         let imagePrompt = prompt;

//         const rawText =
//             textResponse.choices[0]?.message?.content || "";

//         try {
//             // Extract JSON from AI response
//             const jsonMatch = rawText.match(/\{[\s\S]*\}/);

//             const data = jsonMatch
//                 ? JSON.parse(jsonMatch[0])
//                 : {
//                       content: rawText,
//                       imagePrompt: prompt,
//                   };

//             content = data.content || rawText;
//             imagePrompt = data.imagePrompt || prompt;
//         } catch (error) {
//             console.error("Failed to parse OpenRouter JSON:", error);

//             content = rawText;
//             imagePrompt = prompt;
//         }

//         // Save generated content to MongoDB
//         // Image generation is currently disabled.
//         const generation = await Generation.create({
//             user: req.user._id,
//             prompt,
//             content,
//             tone,
//         });

//         // Return generated post
//         res.status(200).json({
//             ...generation.toObject(),
//             imagePrompt,
//             mediaUrl: null,
//             mediaType: null,
//         });
//     } catch (error: any) {
//         console.error("Generate post error:", error);

//         res.status(500).json({
//             message: error?.message || "Server error",
//         });
//     }
// };

// // Get generations
// // GET /api/posts/generations
// export const getGenerations = async (
//     req: AuthRequest,
//     res: Response
// ): Promise<void> => {
//     try {
//         const generations = await Generation.find({
//             user: req.user._id,
//         }).sort({ createdAt: -1 });

//         res.json(generations);
//     } catch (error: any) {
//         res.status(500).json({
//             message: error?.message || "Server error",
//         });
//     }
// };

// // Get posts
// // GET /api/posts
// export const getPosts = async (
//     req: AuthRequest,
//     res: Response
// ): Promise<void> => {
//     try {
//         const posts = await Post.find({
//             user: req.user._id,
//         });

//         res.json(posts);
//     } catch (error: any) {
//         res.status(500).json({
//             message: error?.message || "Server error",
//         });
//     }
// };

// // Schedule post
// // POST /api/posts
// export const schedulePost = async (
//     req: AuthRequest,
//     res: Response
// ): Promise<void> => {
//     try {
//         const {
//             content,
//             platforms,
//             scheduledFor,
//             status,
//         } = req.body;

//         // Parse platforms if it comes as a stringified array from FormData
//         let parsedPlatforms = platforms;

//         if (typeof platforms === "string") {
//             try {
//                 parsedPlatforms = JSON.parse(platforms);
//             } catch (error) {
//                 parsedPlatforms = platforms.split(",");
//             }
//         }

//         let mediaUrl: string | undefined = req.body.mediaUrl;

//         let mediaType: "image" | "video" | undefined =
//             req.body.mediaType;

//         // Upload manually provided media to Cloudinary
//         if (req.file) {
//             const result = await new Promise<any>(
//                 (resolve, reject) => {
//                     const stream =
//                         cloudinary.uploader.upload_stream(
//                             {
//                                 resource_type: "auto",
//                                 folder: "social-scheduler",
//                             },
//                             (error, result) => {
//                                 if (error) {
//                                     reject(error);
//                                 } else {
//                                     resolve(result);
//                                 }
//                             }
//                         );

//                     stream.end(req.file!.buffer);
//                 }
//             );

//             mediaUrl = result.secure_url;

//             mediaType =
//                 result.resource_type === "video"
//                     ? "video"
//                     : "image";
//         }

//         // Create scheduled post
//         const post = await Post.create({
//             user: req.user._id,
//             content,
//             platforms: parsedPlatforms,
//             mediaUrl,
//             mediaType,
//             scheduledFor,
//             status,
//         });

//         res.status(201).json(post);
//     } catch (error: any) {
//         console.error("Schedule post error:", error);

//         res.status(500).json({
//             message: error?.message || "Server error",
//         });
//     }
// };




















// // In This Openrouter is also use for image and text genration so we will updated the code
// import { Response } from "express";
// import { AuthRequest } from "../middlewares/authMiddlewware.js";
// import { cloudinary } from "../config/cloudinary.js";
// import { Generation } from "../models/Generation.js";
// import { Post } from "../models/Post.js";
// import OpenAI from "openai";

// // Generate post
// // POST /api/posts/generate
// export const generatePost = async (
//     req: AuthRequest,
//     res: Response
// ): Promise<void> => {
//     try {
//         const { prompt, tone, generateImage = true } = req.body;

//         // Check OpenRouter API key
//         if (!process.env.OPENROUTER_API_KEY) {
//             res.status(400).json({
//                 message:
//                     "OpenRouter API Key is missing. Please add OPENROUTER_API_KEY to your server/.env file.",
//             });
//             return;
//         }

//         // Initialize OpenRouter client for text generation
//         const client = new OpenAI({
//             apiKey: process.env.OPENROUTER_API_KEY,
//             baseURL: "https://openrouter.ai/api/v1",
//             defaultHeaders: {
//                 "HTTP-Referer": "http://localhost:5173",
//                 "X-Title": "AI Social Media Automation Platform",
//             },
//         });

//         // =========================================================
//         // 1. GENERATE SOCIAL MEDIA CONTENT
//         // =========================================================

//         const textResponse = await client.chat.completions.create({
//             model: "openrouter/free",
//             temperature: 0.8,
//             messages: [
//                 {
//                     role: "user",
//                     content: `
// Generate a social media post.

// Prompt:
// ${prompt}

// Tone:
// ${tone}

// Include relevant hashtags.

// Return ONLY valid JSON.

// {
//     "content": "",
//     "imagePrompt": ""
// }

// The "content" field should contain the final social media post.

// The "imagePrompt" field should contain a detailed, visually rich
// image-generation prompt that matches the social media post.
// `,
//                 },
//             ],
//         });

//         let content = "";
//         let imagePrompt = prompt;

//         const rawText =
//             textResponse.choices[0]?.message?.content || "";

//         // =========================================================
//         // 2. PARSE AI RESPONSE
//         // =========================================================

//         try {
//             const jsonMatch = rawText.match(/\{[\s\S]*\}/);

//             const data = jsonMatch
//                 ? JSON.parse(jsonMatch[0])
//                 : {
//                       content: rawText,
//                       imagePrompt: prompt,
//                   };

//             content = data.content || rawText;
//             imagePrompt = data.imagePrompt || prompt;
//         } catch (error) {
//             console.error(
//                 "Failed to parse OpenRouter JSON:",
//                 error
//             );

//             content = rawText;
//             imagePrompt = prompt;
//         }

//         // =========================================================
//         // 3. GENERATE IMAGE
//         // =========================================================

//         let mediaUrl: string | undefined;
//         let mediaType: "image" | undefined;

//         if (generateImage) {
//             try {
//                 console.log("Starting image generation...");
//                 console.log("Image prompt:", imagePrompt);

//                 const imageResponse = await fetch(
//                     "https://openrouter.ai/api/v1/images",
//                     {
//                         method: "POST",
//                         headers: {
//                             Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//                             "Content-Type": "application/json",
//                             "HTTP-Referer":
//                                 "http://localhost:5173",
//                             "X-Title":
//                                 "AI Social Media Automation Platform",
//                         },
//                         body: JSON.stringify({
//                             model: "recraft/recraft-v3:free",
//                             prompt: imagePrompt,
//                             n: 1,
//                         }),
//                     }
//                 );

//                 if (!imageResponse.ok) {
//                     const errorText =
//                         await imageResponse.text();

//                     throw new Error(
//                         `OpenRouter image generation failed: ${imageResponse.status} ${errorText}`
//                     );
//                 }

//                 const imageData =
//                     await imageResponse.json();

//                 const generatedImage =
//                     imageData?.data?.[0];

//                 if (!generatedImage?.b64_json) {
//                     throw new Error(
//                         "OpenRouter did not return an image."
//                     );
//                 }

//                 // =================================================
//                 // 4. CONVERT BASE64 IMAGE TO CLOUDINARY DATA URI
//                 // =================================================

//                 const mediaTypeFromResponse =
//                     generatedImage.media_type ||
//                     "image/png";

//                 const imageDataUri =
//                     `data:${mediaTypeFromResponse};base64,${generatedImage.b64_json}`;

//                 // =================================================
//                 // 5. UPLOAD IMAGE TO CLOUDINARY
//                 // =================================================

//                 console.log(
//                     "Uploading generated image to Cloudinary..."
//                 );

//                 const uploadResult =
//                     await cloudinary.uploader.upload(
//                         imageDataUri,
//                         {
//                             folder: "ai-generations",
//                             resource_type: "image",
//                         }
//                     );

//                 mediaUrl = uploadResult.secure_url;
//                 mediaType = "image";

//                 console.log(
//                     "Image uploaded successfully:",
//                     mediaUrl
//                 );
//             } catch (imageError: any) {
//                 // Image failure should NOT stop text generation
//                 console.error(
//                     "Image generation failed:",
//                     imageError?.message || imageError
//                 );

//                 mediaUrl = undefined;
//                 mediaType = undefined;
//             }
//         }

//         // =========================================================
//         // 6. SAVE GENERATION TO MONGODB
//         // =========================================================

//         const generation = await Generation.create({
//             user: req.user._id,
//             prompt,
//             content,
//             mediaUrl,
//             mediaType,
//             tone,
//         });

//         // =========================================================
//         // 7. RETURN GENERATED CONTENT + IMAGE
//         // =========================================================

//         res.status(200).json({
//             ...generation.toObject(),
//             imagePrompt,
//             mediaUrl: mediaUrl || null,
//             mediaType: mediaType || null,
//         });
//     } catch (error: any) {
//         console.error(
//             "Generate post error:",
//             error
//         );

//         res.status(500).json({
//             message:
//                 error?.message || "Server error",
//         });
//     }
// };

// // =============================================================
// // GET GENERATIONS
// // GET /api/posts/generations
// // =============================================================

// export const getGenerations = async (
//     req: AuthRequest,
//     res: Response
// ): Promise<void> => {
//     try {
//         const generations = await Generation.find({
//             user: req.user._id,
//         }).sort({ createdAt: -1 });

//         res.json(generations);
//     } catch (error: any) {
//         res.status(500).json({
//             message:
//                 error?.message || "Server error",
//         });
//     }
// };

// // =============================================================
// // GET POSTS
// // GET /api/posts
// // =============================================================

// export const getPosts = async (
//     req: AuthRequest,
//     res: Response
// ): Promise<void> => {
//     try {
//         const posts = await Post.find({
//             user: req.user._id,
//         });

//         res.json(posts);
//     } catch (error: any) {
//         res.status(500).json({
//             message:
//                 error?.message || "Server error",
//         });
//     }
// };

// // =============================================================
// // SCHEDULE POST
// // POST /api/posts
// // =============================================================

// export const schedulePost = async (
//     req: AuthRequest,
//     res: Response
// ): Promise<void> => {
//     try {
//         const {
//             content,
//             platforms,
//             scheduledFor,
//             status,
//         } = req.body;

//         // Parse platforms if it comes as a stringified array
//         let parsedPlatforms = platforms;

//         if (typeof platforms === "string") {
//             try {
//                 parsedPlatforms =
//                     JSON.parse(platforms);
//             } catch (error) {
//                 parsedPlatforms =
//                     platforms.split(",");
//             }
//         }

//         let mediaUrl: string | undefined =
//             req.body.mediaUrl;

//         let mediaType:
//             | "image"
//             | "video"
//             | undefined =
//             req.body.mediaType;

//         // Upload manually provided media
//         if (req.file) {
//             const result =
//                 await new Promise<any>(
//                     (resolve, reject) => {
//                         const stream =
//                             cloudinary.uploader.upload_stream(
//                                 {
//                                     resource_type:
//                                         "auto",
//                                     folder:
//                                         "social-scheduler",
//                                 },
//                                 (
//                                     error,
//                                     result
//                                 ) => {
//                                     if (error) {
//                                         reject(
//                                             error
//                                         );
//                                     } else {
//                                         resolve(
//                                             result
//                                         );
//                                     }
//                                 }
//                             );

//                         stream.end(
//                             req.file!.buffer
//                         );
//                     }
//                 );

//             mediaUrl =
//                 result.secure_url;

//             mediaType =
//                 result.resource_type ===
//                 "video"
//                     ? "video"
//                     : "image";
//         }

//         // Create scheduled post
//         const post =
//             await Post.create({
//                 user: req.user._id,
//                 content,
//                 platforms:
//                     parsedPlatforms,
//                 mediaUrl,
//                 mediaType,
//                 scheduledFor,
//                 status,
//             });

//         res.status(201).json(post);
//     } catch (error: any) {
//         console.error(
//             "Schedule post error:",
//             error
//         );

//         res.status(500).json({
//             message:
//                 error?.message ||
//                 "Server error",
//         });
//     }
// };
















// import { Response } from "express";
// import { AuthRequest } from "../middlewares/authMiddlewware.js";
// import { cloudinary } from "../config/cloudinary.js";
// import { Generation } from "../models/Generation.js";
// import { Post } from "../models/Post.js";
// import OpenAI from "openai";

// // =============================================================
// // GENERATE POST
// // POST /api/posts/generate
// // =============================================================

// export const generatePost = async (
//     req: AuthRequest,
//     res: Response
// ): Promise<void> => {
//     try {
//         const {
//             prompt,
//             tone,
//             generateImage = true,
//         } = req.body;

//         // =====================================================
//         // CHECK OPENROUTER API KEY
//         // =====================================================

//         if (!process.env.OPENROUTER_API_KEY) {
//             res.status(400).json({
//                 message:
//                     "OpenRouter API Key is missing. Please add OPENROUTER_API_KEY to your server/.env file.",
//             });
//             return;
//         }

//         // =====================================================
//         // INITIALIZE OPENROUTER CLIENT
//         // =====================================================

//         const client = new OpenAI({
//             apiKey: process.env.OPENROUTER_API_KEY,
//             baseURL: "https://openrouter.ai/api/v1",
//             defaultHeaders: {
//                 "HTTP-Referer":
//                     "http://localhost:5173",
//                 "X-Title":
//                     "AI Social Media Automation Platform",
//             },
//         });

//         // =====================================================
//         // 1. GENERATE SOCIAL MEDIA CONTENT
//         // =====================================================

//         console.log(
//             "Generating social media content..."
//         );

//         const textResponse =
//             await client.chat.completions.create({
//                 model: "openrouter/free",
//                 temperature: 0.8,
//                 messages: [
//                     {
//                         role: "user",
//                         content: `
// Generate a social media post.

// Prompt:
// ${prompt}

// Tone:
// ${tone}

// Include relevant hashtags.

// Return ONLY valid JSON.

// {
//     "content": "",
//     "imagePrompt": ""
// }

// The "content" field should contain the final social media post.

// The "imagePrompt" field should contain a detailed,
// visually rich image-generation prompt that matches
// the social media post.

// Do not include markdown.
// Do not include code fences.
// Return only JSON.
// `,
//                     },
//                 ],
//             });

//         // =====================================================
//         // 2. PARSE AI RESPONSE
//         // =====================================================

//         let content = "";
//         let imagePrompt = prompt;

//         const rawText =
//             textResponse.choices[0]
//                 ?.message?.content || "";

//         console.log(
//             "OpenRouter response received."
//         );

//         try {
//             const jsonMatch =
//                 rawText.match(/\{[\s\S]*\}/);

//             const data = jsonMatch
//                 ? JSON.parse(jsonMatch[0])
//                 : {
//                       content: rawText,
//                       imagePrompt: prompt,
//                   };

//             content =
//                 data.content || rawText;

//             imagePrompt =
//                 data.imagePrompt || prompt;
//         } catch (error) {
//             console.error(
//                 "Failed to parse OpenRouter JSON:",
//                 error
//             );

//             content = rawText;
//             imagePrompt = prompt;
//         }

//         console.log(
//             "Generated content successfully."
//         );

//         console.log(
//             "Image prompt:",
//             imagePrompt
//         );

//         // =====================================================
//         // 3. IMAGE GENERATION VARIABLES
//         // =====================================================

//         let mediaUrl:
//             | string
//             | undefined;

//         let mediaType:
//             | "image"
//             | undefined;

//         // =====================================================
//         // 4. GENERATE IMAGE USING POLLINATIONS
//         // =====================================================

//         if (generateImage) {
//             try {
//                 // Check Pollinations API key
//                 if (
//                     !process.env
//                         .POLLINATIONS_API_KEY
//                 ) {
//                     throw new Error(
//                         "Pollinations API Key is missing. Please add POLLINATIONS_API_KEY to your server/.env file."
//                     );
//                 }

//                 console.log(
//                     "Starting Pollinations image generation..."
//                 );

//                 // Encode image prompt
//                 const encodedPrompt =
//                     encodeURIComponent(
//                         imagePrompt
//                     );

//                 /*
//                  * Pollinations image endpoint
//                  *
//                  * Current API:
//                  * https://gen.pollinations.ai/image/{prompt}
//                  *
//                  * The API key is sent using:
//                  * Authorization: Bearer <key>
//                  */

//                 const pollinationsUrl =
//                     `https://gen.pollinations.ai/image/${encodedPrompt}` +
//                     `?model=flux` +
//                     `&width=1024` +
//                     `&height=1024` +
//                     `&nologo=true`;

//                 console.log(
//                     "Calling Pollinations..."
//                 );

//                 const imageResponse =
//                     await fetch(
//                         pollinationsUrl,
//                         {
//                             method: "GET",
//                             headers: {
//                                 Authorization:
//                                     `Bearer ${process.env.POLLINATIONS_API_KEY}`,
//                             },
//                         }
//                     );

//                 // =================================================
//                 // CHECK POLLINATIONS RESPONSE
//                 // =================================================

//                 if (
//                     !imageResponse.ok
//                 ) {
//                     const errorText =
//                         await imageResponse.text();

//                     throw new Error(
//                         `Pollinations image generation failed: ${imageResponse.status} ${errorText}`
//                     );
//                 }

//                 // =================================================
//                 // GET IMAGE AS BUFFER
//                 // =================================================

//                 const imageArrayBuffer =
//                     await imageResponse.arrayBuffer();

//                 const imageBuffer =
//                     Buffer.from(
//                         imageArrayBuffer
//                     );

//                 if (
//                     imageBuffer.length === 0
//                 ) {
//                     throw new Error(
//                         "Pollinations returned an empty image."
//                     );
//                 }

//                 console.log(
//                     "Pollinations image generated successfully."
//                 );

//                 console.log(
//                     "Image size:",
//                     imageBuffer.length,
//                     "bytes"
//                 );

//                 // =================================================
//                 // 5. UPLOAD IMAGE TO CLOUDINARY
//                 // =================================================

//                 console.log(
//                     "Uploading image to Cloudinary..."
//                 );

//                 const uploadResult =
//                     await new Promise<any>(
//                         (
//                             resolve,
//                             reject
//                         ) => {
//                             const stream =
//                                 cloudinary
//                                     .uploader
//                                     .upload_stream(
//                                         {
//                                             folder:
//                                                 "ai-generations",
//                                             resource_type:
//                                                 "image",
//                                         },
//                                         (
//                                             error,
//                                             result
//                                         ) => {
//                                             if (
//                                                 error
//                                             ) {
//                                                 reject(
//                                                     error
//                                                 );
//                                             } else {
//                                                 resolve(
//                                                     result
//                                                 );
//                                             }
//                                         }
//                                     );

//                             stream.end(
//                                 imageBuffer
//                             );
//                         }
//                     );

//                 mediaUrl =
//                     uploadResult.secure_url;

//                 mediaType = "image";

//                 console.log(
//                     "Image uploaded to Cloudinary successfully."
//                 );

//                 console.log(
//                     "Cloudinary URL:",
//                     mediaUrl
//                 );
//             } catch (
//                 imageError: any
//             ) {
//                 /*
//                  * IMPORTANT:
//                  * If image generation fails,
//                  * text generation still succeeds.
//                  */

//                 console.error(
//                     "Image generation failed:",
//                     imageError?.message ||
//                         imageError
//                 );

//                 mediaUrl =
//                     undefined;

//                 mediaType =
//                     undefined;
//             }
//         }

//         // =====================================================
//         // 6. SAVE GENERATION TO MONGODB
//         // =====================================================

//         console.log(
//             "Saving generation to MongoDB..."
//         );

//         const generation =
//             await Generation.create({
//                 user: req.user._id,
//                 prompt,
//                 content,
//                 mediaUrl,
//                 mediaType,
//                 tone,
//             });

//         // =====================================================
//         // 7. RETURN RESPONSE
//         // =====================================================

//         res.status(200).json({
//             ...generation.toObject(),

//             imagePrompt,

//             mediaUrl:
//                 mediaUrl || null,

//             mediaType:
//                 mediaType || null,
//         });

//         console.log(
//             "Generation completed successfully."
//         );
//     } catch (error: any) {
//         console.error(
//             "Generate post error:",
//             error
//         );

//         res.status(500).json({
//             message:
//                 error?.message ||
//                 "Server error",
//         });
//     }
// };

// // =============================================================
// // GET GENERATIONS
// // GET /api/posts/generations
// // =============================================================

// export const getGenerations = async (
//     req: AuthRequest,
//     res: Response
// ): Promise<void> => {
//     try {
//         const generations =
//             await Generation.find({
//                 user: req.user._id,
//             }).sort({
//                 createdAt: -1,
//             });

//         res.json(generations);
//     } catch (error: any) {
//         console.error(
//             "Get generations error:",
//             error
//         );

//         res.status(500).json({
//             message:
//                 error?.message ||
//                 "Server error",
//         });
//     }
// };

// // =============================================================
// // GET POSTS
// // GET /api/posts
// // =============================================================

// export const getPosts = async (
//     req: AuthRequest,
//     res: Response
// ): Promise<void> => {
//     try {
//         const posts =
//             await Post.find({
//                 user: req.user._id,
//             });

//         res.json(posts);
//     } catch (error: any) {
//         console.error(
//             "Get posts error:",
//             error
//         );

//         res.status(500).json({
//             message:
//                 error?.message ||
//                 "Server error",
//         });
//     }
// };

// // =============================================================
// // SCHEDULE POST
// // POST /api/posts
// // =============================================================

// export const schedulePost = async (
//     req: AuthRequest,
//     res: Response
// ): Promise<void> => {
//     try {
//         const {
//             content,
//             platforms,
//             scheduledFor,
//             status,
//         } = req.body;

//         // =====================================================
//         // PARSE PLATFORMS
//         // =====================================================

//         let parsedPlatforms =
//             platforms;

//         if (
//             typeof platforms ===
//             "string"
//         ) {
//             try {
//                 parsedPlatforms =
//                     JSON.parse(
//                         platforms
//                     );
//             } catch (error) {
//                 parsedPlatforms =
//                     platforms.split(
//                         ","
//                     );
//             }
//         }

//         // =====================================================
//         // MEDIA VARIABLES
//         // =====================================================

//         let mediaUrl:
//             | string
//             | undefined =
//             req.body.mediaUrl;

//         let mediaType:
//             | "image"
//             | "video"
//             | undefined =
//             req.body.mediaType;

//         // =====================================================
//         // UPLOAD MANUAL MEDIA
//         // =====================================================

//         if (req.file) {
//             console.log(
//                 "Uploading manually selected media..."
//             );

//             const result =
//                 await new Promise<any>(
//                     (
//                         resolve,
//                         reject
//                     ) => {
//                         const stream =
//                             cloudinary
//                                 .uploader
//                                 .upload_stream(
//                                     {
//                                         resource_type:
//                                             "auto",
//                                         folder:
//                                             "social-scheduler",
//                                     },
//                                     (
//                                         error,
//                                         result
//                                     ) => {
//                                         if (
//                                             error
//                                         ) {
//                                             reject(
//                                                 error
//                                             );
//                                         } else {
//                                             resolve(
//                                                 result
//                                             );
//                                         }
//                                     }
//                                 );

//                         stream.end(
//                             req.file!.buffer
//                         );
//                     }
//                 );

//             mediaUrl =
//                 result.secure_url;

//             mediaType =
//                 result.resource_type ===
//                 "video"
//                     ? "video"
//                     : "image";

//             console.log(
//                 "Manual media uploaded successfully."
//             );
//         }

//         // =====================================================
//         // CREATE SCHEDULED POST
//         // =====================================================

//         const post =
//             await Post.create({
//                 user: req.user._id,
//                 content,
//                 platforms:
//                     parsedPlatforms,
//                 mediaUrl,
//                 mediaType,
//                 scheduledFor,
//                 status,
//             });

//         res.status(201).json(
//             post
//         );
//     } catch (error: any) {
//         console.error(
//             "Schedule post error:",
//             error
//         );

//         res.status(500).json({
//             message:
//                 error?.message ||
//                 "Server error",
//         });
//     }
// };





































// Cloudflare Api Key
import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddlewware.js";
import { cloudinary } from "../config/cloudinary.js";
import { Generation } from "../models/Generation.js";
import { Post } from "../models/Post.js";
import OpenAI from "openai";

// =============================================================
// GENERATE POST
// POST /api/posts/generate
// =============================================================

export const generatePost = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const {
            prompt,
            tone,
            generateImage = true,
        } = req.body;

        // =====================================================
        // CHECK OPENROUTER API KEY
        // =====================================================

        if (!process.env.OPENROUTER_API_KEY) {
            res.status(400).json({
                message:
                    "OpenRouter API Key is missing. Please add OPENROUTER_API_KEY to your server/.env file.",
            });
            return;
        }

        // =====================================================
        // INITIALIZE OPENROUTER CLIENT
        // =====================================================

        const client = new OpenAI({
            apiKey: process.env.OPENROUTER_API_KEY,
            baseURL: "https://openrouter.ai/api/v1",
            defaultHeaders: {
                "HTTP-Referer": "http://localhost:5173",
                "X-Title":
                    "AI Social Media Automation Platform",
            },
        });

        // =====================================================
        // 1. GENERATE SOCIAL MEDIA CONTENT
        // =====================================================

        console.log(
            "Generating social media content..."
        );

        const textResponse =
            await client.chat.completions.create({
                model: "openrouter/free",
                temperature: 0.8,
                messages: [
                    {
                        role: "user",
                        content: `
Generate a social media post.

Prompt:
${prompt}

Tone:
${tone}

Include relevant hashtags.

Return ONLY valid JSON.

{
    "content": "",
    "imagePrompt": ""
}

The "content" field should contain the final social media post.

The "imagePrompt" field should contain a detailed,
visually rich image-generation prompt that matches
the social media post.

Do not include markdown.
Do not include code fences.
Return only JSON.
`,
                    },
                ],
            });

        // =====================================================
        // 2. PARSE OPENROUTER RESPONSE
        // =====================================================

        let content = "";
        let imagePrompt = prompt;

        const rawText =
            textResponse.choices[0]
                ?.message?.content || "";

        console.log(
            "OpenRouter response received."
        );

        try {
            const jsonMatch =
                rawText.match(/\{[\s\S]*\}/);

            const data = jsonMatch
                ? JSON.parse(jsonMatch[0])
                : {
                      content: rawText,
                      imagePrompt: prompt,
                  };

            content =
                data.content || rawText;

            imagePrompt =
                data.imagePrompt || prompt;
        } catch (error) {
            console.error(
                "Failed to parse OpenRouter JSON:",
                error
            );

            content = rawText;
            imagePrompt = prompt;
        }

        console.log(
            "Generated content successfully."
        );

        console.log(
            "Image prompt:",
            imagePrompt
        );

        // =====================================================
        // 3. IMAGE VARIABLES
        // =====================================================

        let mediaUrl:
            | string
            | undefined;

        let mediaType:
            | "image"
            | undefined;

        // =====================================================
        // 4. GENERATE IMAGE USING CLOUDFLARE WORKERS AI
        // =====================================================

        if (generateImage) {
            try {
                if (
                    !process.env.CLOUDFLARE_ACCOUNT_ID
                ) {
                    throw new Error(
                        "Cloudflare Account ID is missing. Please add CLOUDFLARE_ACCOUNT_ID to your .env file."
                    );
                }

                if (
                    !process.env.CLOUDFLARE_API_TOKEN
                ) {
                    throw new Error(
                        "Cloudflare API Token is missing. Please add CLOUDFLARE_API_TOKEN to your .env file."
                    );
                }

                console.log(
                    "Starting Cloudflare image generation..."
                );

                console.log(
                    "Image prompt:",
                    imagePrompt
                );

                const accountId =
                    process.env
                        .CLOUDFLARE_ACCOUNT_ID;

                const model =
                    "@cf/black-forest-labs/flux-1-schnell";

                // IMPORTANT:
                // Do NOT use encodeURIComponent(model).
                // Cloudflare expects the model path
                // with its "/" characters preserved.

                const cloudflareUrl =
                    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

                console.log(
                    "Cloudflare URL:",
                    cloudflareUrl
                );

                const imageResponse =
                    await fetch(
                        cloudflareUrl,
                        {
                            method: "POST",

                            headers: {
                                Authorization:
                                    `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,

                                "Content-Type":
                                    "application/json",
                            },

                            body: JSON.stringify({
                                prompt:
                                    imagePrompt,
                            }),
                        }
                    );

                // =================================================
                // CHECK CLOUDFLARE RESPONSE
                // =================================================

                if (
                    !imageResponse.ok
                ) {
                    const errorText =
                        await imageResponse.text();

                    throw new Error(
                        `Cloudflare image generation failed: ${imageResponse.status} ${errorText}`
                    );
                }

                // =================================================
                // CLOUDFLARE FLUX RESPONSE
                // =================================================

                const imageData =
                    await imageResponse.json();

                console.log(
                    "Cloudflare response received."
                );

                /*
                 * FLUX returns:
                 *
                 * {
                 *   "result": {
                 *      "image": "BASE64_IMAGE_DATA"
                 *   }
                 * }
                 */

                if (
                    !imageData?.result?.image
                ) {
                    throw new Error(
                        "Cloudflare did not return an image."
                    );
                }

                // =================================================
                // CONVERT BASE64 TO BUFFER
                // =================================================

                const imageBuffer =
                    Buffer.from(
                        imageData.result.image,
                        "base64"
                    );

                if (
                    imageBuffer.length === 0
                ) {
                    throw new Error(
                        "Cloudflare returned an empty image."
                    );
                }

                console.log(
                    "Cloudflare image generated successfully."
                );

                console.log(
                    "Image size:",
                    imageBuffer.length,
                    "bytes"
                );

                // =================================================
                // 5. UPLOAD IMAGE TO CLOUDINARY
                // =================================================

                console.log(
                    "Uploading generated image to Cloudinary..."
                );

                const uploadResult =
                    await new Promise<any>(
                        (
                            resolve,
                            reject
                        ) => {
                            const stream =
                                cloudinary
                                    .uploader
                                    .upload_stream(
                                        {
                                            folder:
                                                "ai-generations",

                                            resource_type:
                                                "image",
                                        },
                                        (
                                            error,
                                            result
                                        ) => {
                                            if (
                                                error
                                            ) {
                                                reject(
                                                    error
                                                );
                                            } else {
                                                resolve(
                                                    result
                                                );
                                            }
                                        }
                                    );

                            stream.end(
                                imageBuffer
                            );
                        }
                    );

                mediaUrl =
                    uploadResult.secure_url;

                mediaType = "image";

                console.log(
                    "Image uploaded to Cloudinary successfully."
                );

                console.log(
                    "Cloudinary URL:",
                    mediaUrl
                );
            } catch (
                imageError: any
            ) {
                // Image failure should NOT
                // stop text generation.

                console.error(
                    "Image generation failed:",
                    imageError?.message ||
                        imageError
                );

                mediaUrl =
                    undefined;

                mediaType =
                    undefined;
            }
        }

        // =====================================================
        // 6. SAVE GENERATION TO MONGODB
        // =====================================================

        console.log(
            "Saving generation to MongoDB..."
        );

        const generation =
            await Generation.create({
                user: req.user._id,
                prompt,
                content,
                mediaUrl,
                mediaType,
                tone,
            });

        // =====================================================
        // 7. RETURN RESPONSE
        // =====================================================

        res.status(200).json({
            ...generation.toObject(),

            imagePrompt,

            mediaUrl:
                mediaUrl || null,

            mediaType:
                mediaType || null,
        });

        console.log(
            "Generation completed successfully."
        );
    } catch (error: any) {
        console.error(
            "Generate post error:",
            error
        );

        res.status(500).json({
            message:
                error?.message ||
                "Server error",
        });
    }
};

// =============================================================
// GET GENERATIONS
// GET /api/posts/generations
// =============================================================

export const getGenerations = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const generations =
            await Generation.find({
                user: req.user._id,
            }).sort({
                createdAt: -1,
            });

        res.json(generations);
    } catch (error: any) {
        console.error(
            "Get generations error:",
            error
        );

        res.status(500).json({
            message:
                error?.message ||
                "Server error",
        });
    }
};

// =============================================================
// GET POSTS
// GET /api/posts
// =============================================================

export const getPosts = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const posts =
            await Post.find({
                user: req.user._id,
            });

        res.json(posts);
    } catch (error: any) {
        console.error(
            "Get posts error:",
            error
        );

        res.status(500).json({
            message:
                error?.message ||
                "Server error",
        });
    }
};

// =============================================================
// SCHEDULE POST
// POST /api/posts
// =============================================================

export const schedulePost = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const {
            content,
            platforms,
            scheduledFor,
            status,
        } = req.body;

        // =====================================================
        // PARSE PLATFORMS
        // =====================================================

        let parsedPlatforms =
            platforms;

        if (
            typeof platforms ===
            "string"
        ) {
            try {
                parsedPlatforms =
                    JSON.parse(
                        platforms
                    );
            } catch (error) {
                parsedPlatforms =
                    platforms.split(
                        ","
                    );
            }
        }

        // =====================================================
        // MEDIA VARIABLES
        // =====================================================

        let mediaUrl:
            | string
            | undefined =
            req.body.mediaUrl;

        let mediaType:
            | "image"
            | "video"
            | undefined =
            req.body.mediaType;

        // =====================================================
        // UPLOAD MANUAL MEDIA
        // =====================================================

        if (req.file) {
            console.log(
                "Uploading manually selected media..."
            );

            const result =
                await new Promise<any>(
                    (
                        resolve,
                        reject
                    ) => {
                        const stream =
                            cloudinary
                                .uploader
                                .upload_stream(
                                    {
                                        resource_type:
                                            "auto",

                                        folder:
                                            "social-scheduler",
                                    },
                                    (
                                        error,
                                        result
                                    ) => {
                                        if (
                                            error
                                        ) {
                                            reject(
                                                error
                                            );
                                        } else {
                                            resolve(
                                                result
                                            );
                                        }
                                    }
                                );

                        stream.end(
                            req.file!.buffer
                        );
                    }
                );

            mediaUrl =
                result.secure_url;

            mediaType =
                result.resource_type ===
                "video"
                    ? "video"
                    : "image";

            console.log(
                "Manual media uploaded successfully."
            );
        }

        // =====================================================
        // CREATE SCHEDULED POST
        // =====================================================

        const post =
            await Post.create({
                user: req.user._id,
                content,
                platforms:
                    parsedPlatforms,
                mediaUrl,
                mediaType,
                scheduledFor,
                status,
            });

        res.status(201).json(
            post
        );
    } catch (error: any) {
        console.error(
            "Schedule post error:",
            error
        );

        res.status(500).json({
            message:
                error?.message ||
                "Server error",
        });
    }
};