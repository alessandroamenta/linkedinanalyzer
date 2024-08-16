import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY,
});

export async function POST(request: Request) {
  const { profileData, desiredRole } = await request.json();

  const systemPrompt = `You are an experienced LinkedIn Profile Optimizer and Career Coach. You have a keen eye for detail and a talent for helping people present their best professional selves online. Your personality is friendly, approachable, and honest, with a touch of tough love when needed.

Your job is to analyze the LinkedIn profile data provided, along with the person's desired role. This LinkedIn data is the only information you have to understand this person. You can make reasonable assumptions based on the information given. Your goal is to provide detailed, constructive feedback on what's not working in their profile and how to improve it.`;

  const userPrompt = `Analyze the following LinkedIn profile for someone interested in a ${desiredRole} role. Follow these steps:

1. Greet the person by name in a friendly manner.
2. Mention the role they're interested in.
3. Give an overall score for the profile from 1 to 10, where 1 is poor and 10 is excellent.
4. Analyze each section of the profile in this order: Profile picture (if available), Background picture (if available), Headline, About section, Experience, Education, Volunteer experience (if any).
5. For each section:
   - Use simple, conversational language
   - Point out what's good
   - Mention what's not working well
   - Suggest specific improvements
6. Summarize the main areas for improvement.
7. End with a positive, motivational statement about improving their profile.

Remember:
- Keep language super simple, approachable, and friendly
- Critique every section that is provided
- Always suggest improvements
- Mention what's not working
- Be specific in your feedback
- Relate feedback to the role they're interested in when possible
- Don't shy away from pointing out major issues, but do so in a constructive manner
- Do not analyze or mention skills, recommendations, or accomplishments as this information is not provided in the profile data
- Only provide feedback on the profile picture and background picture if they're available. If they're not available, skip these sections entirely without mentioning them

Profile data:
${JSON.stringify(profileData, null, 2)}

Output the resulting analysis only, with no additional elements.`;

  try {
    const messages: any[] = [
      {
        role: "user",
        content: []
      }
    ];

    // Analyze profile picture and background picture if available
    const imageDescriptions: string[] = [];
    for (const imageType of ['profilePicture', 'backgroundPicture']) {
      if (profileData[imageType]) {
        try {
          const imageUrl = profileData[imageType];
          console.log(`Processing ${imageType} URL: ${imageUrl}`);
          const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
          const base64Image = Buffer.from(response.data, 'binary').toString('base64');

          messages[0].content.push(
            {
              type: "text",
              text: `${imageType.charAt(0).toUpperCase() + imageType.slice(1)}:`
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: base64Image
              }
            }
          );
          imageDescriptions.push(`${imageType.charAt(0).toUpperCase() + imageType.slice(1)}`);
        } catch (error) {
          console.error(`Error processing ${imageType}:`, error);
        }
      }
    }

    if (imageDescriptions.length > 0) {
      messages[0].content.push({
        type: "text",
        text: `Describe the ${imageDescriptions.join(' and ')} in detail, focusing on aspects relevant for a professional LinkedIn profile.`
      });

      const imageResponse = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        messages: messages
      });

      const imageDescription = imageResponse.content[0].type === 'text' ? imageResponse.content[0].text : '';
      console.log("Image Description:", imageDescription);
      messages[0].content.push({
        type: "text",
        text: `Image description: ${imageDescription}`
      });
    }

    // Add the user prompt to the messages
    messages[0].content.push({
      type: "text",
      text: userPrompt
    });

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 4000,
      temperature: 0.4,
      system: systemPrompt,
      messages: messages
    });

    const analysis = message.content[0].type === 'text' ? message.content[0].text : '';
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error: Unable to process the analysis result.' }, { status: 500 });
  }
}