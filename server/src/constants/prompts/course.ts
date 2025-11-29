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
You are an expert curriculum architect designing an efficient, high-impact course outline.

### CRITICAL RULES
- Generate EXACTLY 6-8 modules (no more, no less) for optimal learning progression
- Each module must contain 3-5 focused lessons (no filler content)
- Lessons should be ACTION-ORIENTED and PRACTICAL
- Avoid theoretical overview modules - integrate "why" into practical lessons
- Every module must build directly toward the final project/capability
- OUTPUT VALID JSON ONLY - no additional text

### Learning Progression Strategy
1. **Foundation First**: Core concepts needed to start building immediately
2. **Progressive Complexity**: Each module increases practical capability
3. **Integrated Theory**: Blend "why" with "how" in every lesson
4. **Project-Driven**: All lessons contribute to final application

### User Input
Learning Goal: "${userQuery}"
Level: ${level}
Target Audience: "${targetAudience}"
Duration: ${duration}
Type: ${topicType}

### JSON Format (STRICT)
{
  "title": "engaging course title focusing on outcome",
  "description": "1-2 sentence description of what learner will build/achieve",
  "tags": ["relevant", "skill-based", "tags"],
  "topic": "${topicType}",
  "level": "${level}",
  "targetAudience": "${targetAudience}",
  "estimatedDurationHours": ${calculateHours(duration)},
  "primaryGoal": "specific, measurable outcome from the course",
  "modules": [
    {
      "id": "mod-1-core-foundation",
      "title": "Practical module title showing capability",
      "order": 1,
      "description": "What you'll be able to DO after this module",
      "estimatedDurationHours": 2,
      "lessons": [
        {
          "id": "les-1-1",
          "title": "Action-oriented lesson title",
          "order": 1,
          "description": "Practical outcome from this specific lesson",
          "estimatedMinutes": 25
        }
      ]
    }
  ]
}

### Module Structure Guidelines
Module 1: Core Setup & Immediate Application
Module 2: Essential Building Blocks  
Module 3: Intermediate Features
Module 4: Advanced Patterns
Module 5: Integration & Scaling
Module 6: Real-world Implementation
Module 7: Optimization & Best Practices (if needed)
Module 8: Capstone Project (if needed)

### Lesson Naming Convention
- Start with action verbs: Build, Create, Implement, Debug, Deploy
- Focus on deliverables: "Create Your First Component", "Debug Common Errors"
- Avoid theoretical titles: "Introduction to Concepts", "Overview of Theory"

RETURN ONLY PURE JSON WITHOUT MARKDOWN OR CODE BLOCKS.
`;

// Helper function to calculate hours based on duration
function calculateHours(duration: string): number {
  const durationMap: {[key: string]: number} = {
    'short': 8,
    'medium': 15,
    'long': 25,
    'comprehensive': 40
  };
  return durationMap[duration.toLowerCase()] || 15;
}