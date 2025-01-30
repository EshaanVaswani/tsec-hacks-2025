import { MarkdownRenderer } from "../components/markdown-renderer"

const initialMarkdown = `
# John Doe - Software Engineer

## Summary

Experienced software engineer with a passion for creating efficient and scalable web applications. Skilled in React, Node.js, and cloud technologies.

## Experience

### Senior Software Engineer - Tech Corp
*January 2020 - Present*

- Led the development of a high-performance web application using React and Node.js
- Implemented CI/CD pipelines, reducing deployment time by 50%
- Mentored junior developers and conducted code reviews

### Software Engineer - Innovate Inc.
*June 2017 - December 2019*

- Developed and maintained multiple client-facing applications
- Optimized database queries, improving application response time by 30%
- Collaborated with cross-functional teams to deliver projects on time

## Skills

- JavaScript (React, Node.js)
- Python
- SQL and NoSQL databases
- AWS, Docker, Kubernetes
- Agile methodologies

## Education

**Bachelor of Science in Computer Science**
University of Technology, Graduated 2017

## Certifications

- AWS Certified Developer - Associate
- Certified Scrum Master

[GitHub Profile](https://github.com/johndoe) | [LinkedIn](https://linkedin.com/in/johndoe)
`

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Markdown Renderer Example</h1>
      <MarkdownRenderer initialContent={initialMarkdown} />
    </div>
  )
}

