import { useParams } from "react-router-dom";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";

// Dummy markdown
const dummyMarkdown = `# ✨ Welcome to JavaScript Fundamentals!

This lesson covers the foundational aspects of JavaScript, along with coding practice problems to strengthen your understanding.

---

## ✨ Data Types in JavaScript

JavaScript has several built-in data types.

### **Primitive Data Types**

- **Number** — represents numeric values  
- **String** — sequence of characters  
- **Boolean** — true or false  
- **Undefined** — variable declared but not assigned  
- **Null** — explicitly empty value  
- **Symbol** — unique identifiers  
- **BigInt** — very large integers  

### **Non-Primitive Data Types**

- **Object** — key-value pairs  
- **Array** — ordered list of elements  
- **Function** — reusable code block  

---

## 📝 Coding Questions

### 1. Prime Numbers

**Problem:**  
Write a function to check if a number is prime.

\`\`\`javascript
function isPrime(n) {
  if (n <= 1) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}
\`\`\`

---

### 2. Reverse a String

**Problem:**  
Write a function that returns a reversed version of a given string.

\`\`\`javascript
function reverseString(str) {
  return str.split('').reverse().join('');
}
\`\`\`

---

### 3. Find the Maximum Number in an Array

**Problem:**  
Write a function that returns the largest number in an array.

\`\`\`javascript
function findMax(arr) {
  if (arr.length === 0) return null;
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
}
\`\`\`

`;



export default function Lesson() {
    //   const { courseId, modNum, lessonNum } = useParams();

    const markdownComponents: Components = {
        code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");

            if (match) {
                return (
                    <div className="relative my-6 rounded-xl overflow-hidden border border-neutral-700 bg-[#1e1e1e]">
                        <Button
                            size="sm"
                            className="absolute right-3 top-3 z-10 opacity-60 hover:opacity-100"
                            onClick={() => navigator.clipboard.writeText(codeString)}
                        >
                            Copy
                        </Button>

                        <SyntaxHighlighter
                            language={match[1]}
                            style={vscDarkPlus}
                            customStyle={{
                                margin: 0,
                                padding: "20px",
                                background: "transparent",
                                fontSize: "0.9rem",
                            }}
                            {...props}
                        >
                            {codeString}
                        </SyntaxHighlighter>
                    </div>
                );
            }

            return (
                <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-sm">
                    {children}
                </code>
            );
        },
    };


    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            {/* Beautiful Typography */}
            <article className="prose prose-lg dark:prose-invert prose-headings:font-semibold prose-headings:mb-3 prose-p:leading-relaxed prose-p:mb-4 prose-li:leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {dummyMarkdown}
                </ReactMarkdown>
            </article>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-10">
                <Button variant="secondary">Previous</Button>
                <Button>Next</Button>
            </div>
        </div>
    );
}
