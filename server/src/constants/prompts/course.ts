export const coursePrompt = ({
  userQuery,
  level,
  targetAudience,
  duration,
  topicType,
}: {
  userQuery: string;
  level: string;
  targetAudience: string;
  duration: string;
  topicType: string;
}) => `
You are an expert curriculum architect designing a fast and structured course outline.

### RULES
- ALWAYS include at least 10 modules (more if required for depth).
- Each module must include 4–8 lessons.
- Lessons should only include: id, title, order, estimatedMinutes.
- DO NOT include summaries, text, outcomes, objectives, or content.
- DO NOT add markdown, code fences, or comments.
- OUTPUT VALID JSON ONLY.

### User Input
Learning Goal: "${userQuery}"
Level: ${level}
Target Audience: "${targetAudience}"
Duration: ${duration}
Type: ${topicType}

### JSON Format (STRICT)
{
  "title": "string",
  "description": "string",
  "tags": ["string"],
  "topic": "${topicType}",
  "level": "${level}",
  "targetAudience": "${targetAudience}",
  "estimatedDurationHours": number,
  "primaryGoal": "string",
  "modules": [
    {
      "id": "mod-1-kebab-name",
      "title": "string",
      "order": number,
      "description": "string",
      "estimatedDurationHours": number,
      "lessons": [
        {
          "id": "les-1-1",
          "title": "string",
          "order": number,
          "description": "string",
          "estimatedMinutes": number
        }
      ]
    }
  ]
}

RETURN ONLY JSON.
`;
