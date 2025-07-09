import { FunctionDeclaration, Type } from "@google/genai";
import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from "node:fs";

export class ImageGenerationTool {
  private geminiClient: any;

  constructor(apiKey: string) {
    this.geminiClient = new GoogleGenAI({ apiKey });
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "generate_image",
      description: "Generate images using Gemini's image generation capabilities. Can create single images, story mode with multiple images maintaining character consistency, or edit existing images.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          prompt: {
            type: Type.STRING,
            description: "The descriptive prompt for image generation or editing"
          },
          mode: {
            type: Type.STRING,
            description: "Generation mode: 'single' for one image, 'story' for multiple images with consistent characters, or 'edit' for image editing",
            enum: ["single", "story", "edit"]
          },
          imageCount: {
            type: Type.NUMBER,
            description: "Number of images to generate (default: 1, max: 8). Only used in 'story' mode"
          },
          baseImage: {
            type: Type.STRING,
            description: "Base64 encoded image for editing mode. Required when mode is 'edit'"
          },
          imageMimeType: {
            type: Type.STRING,
            description: "MIME type of the base image (e.g., 'image/png', 'image/jpeg'). Required when baseImage is provided"
          },
          characterConsistency: {
            type: Type.BOOLEAN,
            description: "Whether to maintain character consistency across multiple images in story mode (default: true)"
          },
          style: {
            type: Type.STRING,
            description: "Art style preference (e.g., 'photorealistic', '3d rendered', 'cartoon', 'anime', 'watercolor', 'oil painting')"
          },
          aspectRatio: {
            type: Type.STRING,
            description: "Desired aspect ratio (e.g., '16:9', '1:1', '4:3', '9:16')"
          },
          quality: {
            type: Type.STRING,
            description: "Image quality preference: 'standard' or 'high' (default: standard)"
          },
          outputFormat: {
            type: Type.STRING,
            description: "Output format: 'png' or 'jpeg' (default: png)"
          },
          saveToFile: {
            type: Type.BOOLEAN,
            description: "Whether to save generated images to files (default: true)"
          },
          filePrefix: {
            type: Type.STRING,
            description: "Prefix for saved image files (default: 'gemini-generated')"
          }
        },
        required: ["prompt", "mode"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      console.log(`🎨 Generating image(s): "${args.prompt}"`);
      
      const mode = args.mode || "single";
      const imageCount = Math.min(args.imageCount || 1, 8);
      const saveToFile = args.saveToFile !== false;
      const filePrefix = args.filePrefix || "gemini-generated";
      
      // Validate edit mode requirements
      if (mode === "edit" && !args.baseImage) {
        throw new Error("Base image is required for edit mode");
      }

      const results = [];
      
      if (mode === "story") {
        // Story mode: Generate multiple images with character consistency
        for (let i = 0; i < imageCount; i++) {
          const storyPrompt = this.buildStoryPrompt(args.prompt, i, imageCount, args.characterConsistency);
          const result = await this.generateSingleImage(storyPrompt, args, `${filePrefix}-story-${i + 1}`);
          results.push(result);
        }
      } else {
        // Single image or edit mode
        const result = await this.generateSingleImage(args.prompt, args, filePrefix);
        results.push(result);
      }

      return {
        success: true,
        mode: mode,
        prompt: args.prompt,
        imagesGenerated: results.length,
        results: results,
        generationTime: new Date().toISOString(),
        settings: {
          style: args.style,
          aspectRatio: args.aspectRatio,
          quality: args.quality || "standard",
          outputFormat: args.outputFormat || "png"
        }
      };

    } catch (error: unknown) {
      console.error("❌ Image generation failed:", error);
      return {
        success: false,
        error: `Image generation failed: ${error instanceof Error ? error.message : String(error)}`,
        prompt: args.prompt,
        mode: args.mode
      };
    }
  }

  private async generateSingleImage(prompt: string, args: any, filename: string): Promise<any> {
    try {
      // Build the content based on mode
      let contents: any;
      
      if (args.mode === "edit" && args.baseImage) {
        // Edit mode: include base image
        contents = [
          { text: prompt },
          {
            inlineData: {
              mimeType: args.imageMimeType || "image/png",
              data: args.baseImage,
            },
          },
        ];
      } else {
        // Generation mode: text only
        contents = this.enhancePrompt(prompt, args);
      }

      // Generate the image
      const response = await this.geminiClient.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: contents,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      const result = {
        textResponse: null,
        imageData: null,
        imageBase64: null,
        savedFile: null as string | null,
        error: null
      };

      // Process the response
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          result.textResponse = part.text;
          console.log("📝 Text response:", part.text);
        } else if (part.inlineData) {
          result.imageData = part.inlineData.data;
          result.imageBase64 = part.inlineData.data;
          
          // Save to file if requested
          if (args.saveToFile !== false) {
            const buffer = Buffer.from(part.inlineData.data, "base64");
            const extension = args.outputFormat || "png";
            const filePath = `${filename}.${extension}`;
            fs.writeFileSync(filePath, buffer);
            result.savedFile = filePath;
            console.log(`💾 Image saved as ${filePath}`);
          }
        }
      }

      return result;

    } catch (error) {
      console.error("❌ Single image generation failed:", error);
      return {
        textResponse: null,
        imageData: null,
        imageBase64: null,
        savedFile: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private enhancePrompt(basePrompt: string, args: any): string {
    let enhancedPrompt = basePrompt;

    // Add style if specified
    if (args.style) {
      enhancedPrompt += ` in ${args.style} style`;
    }

    // Add aspect ratio if specified
    if (args.aspectRatio) {
      enhancedPrompt += `, aspect ratio ${args.aspectRatio}`;
    }

    // Add quality preferences
    if (args.quality === "high") {
      enhancedPrompt += ", high quality, detailed, sharp";
    }

    return enhancedPrompt;
  }

  private buildStoryPrompt(basePrompt: string, index: number, total: number, maintainConsistency: boolean): string {
    let storyPrompt = basePrompt;

    if (maintainConsistency) {
      storyPrompt += ` (Scene ${index + 1} of ${total}, maintain consistent character appearance and style throughout the story)`;
    }

    // Add scene-specific context
    if (total > 1) {
      const sceneDescriptions = [
        "opening scene",
        "developing the story",
        "building tension",
        "climax moment",
        "resolution",
        "conclusion",
        "epilogue",
        "final scene"
      ];
      
      const sceneIndex = Math.floor((index / total) * sceneDescriptions.length);
      const sceneType = sceneDescriptions[Math.min(sceneIndex, sceneDescriptions.length - 1)];
      
      storyPrompt += ` - ${sceneType}`;
    }

    return storyPrompt;
  }
}

// Usage example:
/*
const imageGen = new ImageGenerationTool("your-gemini-api-key");

// Single image generation
await imageGen.execute({
  prompt: "A majestic dragon soaring over a medieval castle at sunset",
  mode: "single",
  style: "photorealistic",
  aspectRatio: "16:9",
  quality: "high"
});

// Story mode with multiple images
await imageGen.execute({
  prompt: "A brave knight's quest to save a princess from a dragon",
  mode: "story",
  imageCount: 4,
  characterConsistency: true,
  style: "fantasy art"
});

// Image editing
await imageGen.execute({
  prompt: "Add a rainbow in the sky",
  mode: "edit",
  baseImage: "base64-encoded-image-data",
  imageMimeType: "image/png"
});
*/