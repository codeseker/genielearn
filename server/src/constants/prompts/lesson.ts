export const lessonPrompt = ({
  courseTitle,
  courseTopic,
  targetAudience,
  level,
  moduleTitle,
  lessonTitle,
  lessonDescription,
  lessonOrder,
  estimatedMinutes,
  upcomingLessons = []
}: any) => `
You are creating an engaging, content-rich technical lesson that balances depth with practical application.

## CONTEXT
**Course:** ${courseTitle}
**Module:** ${moduleTitle} 
**Lesson:** ${lessonTitle} (${lessonOrder})
**Audience:** ${targetAudience} (${level})
**Time:** ${estimatedMinutes} minutes

## UPCOMING LESSONS
${upcomingLessons.map((lesson: any, index: number) => 
  `${index + 1}. ${lesson.title}: ${lesson.description}`
).join('\n')}

## CONTENT STRATEGY
- Fill the ${estimatedMinutes} minutes with substantial, engaging content
- Mix theory, code examples, analogies, and practical exercises
- Use storytelling and real-world scenarios to make it memorable
- Include multiple code examples with varying complexity
- Add visual descriptions for complex concepts

## OUTPUT STRUCTURE

# ${lessonTitle}

> **Module:** ${moduleTitle} • **Level:** ${level} • **Time:** ${estimatedMinutes} minutes

## 🎯 Lesson Goals
*By the end of this lesson, you'll be able to:*
- **Build** [concrete thing you can create]
- **Debug** [common problem you can solve]
- **Explain** [key concept you can articulate]
- **Apply** [skill in real scenarios]

## 📖 Story & Context
[Engaging opening that connects to real-world problems or interesting scenarios. Tell a brief story about why this topic matters.]

**Real-World Impact:** [Describe 2-3 actual applications people encounter daily]

## 🧠 Core Concepts Explained
### The Fundamental Idea
[Clear explanation with simple analogy]

### How It Works Under the Hood
[Technical breakdown with step-by-step reasoning]

### Key Components & Their Roles
- **Component A:** [Purpose and behavior]
- **Component B:** [How it interacts with others]
- **Component C:** [Why it's essential]

## 💻 Code in Action

### Example 1: Basic Implementation
\`\`\`${getLanguageFromTopic(courseTopic)}
// Simple, clean example showing the core pattern
// Detailed comments explaining each step
// Focus on readability and understanding
\`\`\`

**What this demonstrates:** [Clear explanation of the learning point]

### Example 2: Real-World Scenario
\`\`\`${getLanguageFromTopic(courseTopic)}
// More complex example showing practical application
// Includes error handling and edge cases
// Production-ready patterns
\`\`\`

**When you'd use this:** [Specific scenarios where this pattern shines]

## 🛠️ Hands-On Workshop

### Exercise: Build [Something Concrete]
**Scenario:** [Engaging problem statement]
**Your Task:** [Clear, actionable instructions]
**Success Looks Like:** [Specific, measurable outcomes]

**Starter Code:**
\`\`\`${getLanguageFromTopic(courseTopic)}
// Minimal setup that requires applying the lesson concepts
// Enough structure to get started but room for implementation
\`\`\`

### Pro Tips for Success
🔥 **Accelerate Your Learning:**
- [Practical tip 1 with reasoning]
- [Debugging strategy 2]
- [Performance optimization 3]

⚠️ **Common Pitfalls & Solutions:**
- [Mistake 1] → [How to avoid it]
- [Mistake 2] → [Quick fix approach]

## 🌐 Real-World Applications

| Industry | Use Case | Why It Matters |
|----------|----------|----------------|
| [Industry 1] | [Specific application] | [Business/technical impact] |
| [Industry 2] | [Different scenario] | [Performance/user benefit] |
| [Your Project] | [Personal application] | [Immediate value] |

## 🧪 Knowledge Check

### Quick Quiz
**Q1: Scenario-Based Application**
"In [real situation], which approach would be most effective and why?"
A) [Option with trade-off]
B) [Better option with reasoning]
C) [Over-engineered solution]
D) [Fundamentally flawed approach]

**Q2: Code Analysis**
"What's the primary limitation of this implementation, and how would you improve it?"
[Brief code snippet description]

**Q3: Decision Making**
"When would you choose this pattern over alternatives, and what factors would influence your decision?"

<details>
<summary>📋 Answers & Explanations</summary>

**Q1: B**  
*Why:* [Detailed reasoning connecting back to core principles and real-world constraints]

**Q2:** [Specific limitation] → [Improvement strategy with code snippet]

**Q3:** [Decision framework with clear criteria and trade-off analysis]
</details>

## 🚀 Putting It All Together

### Key Takeaways
- 🎯 **Core Insight:** [Most important concept]
- 🔧 **Practical Skill:** [What you can now build]
- ⚡ **Performance Tip:** [Optimization insight]
- 🎨 **Architectural Pattern:** [When to use this approach]

### Your Learning Journey
**From this lesson:** [Current capability]  
**To next lesson:** ${upcomingLessons[0]?.title ? `**${upcomingLessons[0].title}** - ${upcomingLessons[0].description}` : 'Advanced applications'}

### Ready for More?
- [Challenge exercise for advanced learners]
- [Recommended reading/resource]
- [Community project idea]

---

*Lesson designed for ${targetAudience} to build practical ${courseTopic} skills.*
`;

// Language detector
function getLanguageFromTopic(topic: string): string {
  const t = topic.toLowerCase();
  if (t.includes('machine learning') || t.includes('data science') || t.includes('ai') || t.includes('scripting')) {
    return 'python';
  }
  return 'cpp';
}