import json
import requests
from typing import Dict, Optional
from datetime import datetime
from fpdf import FPDF
import re

class OllamaLLM:
    """Handle communications with local Ollama instance"""
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.model = "mistral"
    
    def generate(self, prompt: str) -> str:
        """Send a prompt to Ollama and get the response"""
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "system": "You are a legal assistant helping to extract information for legal documents. Always respond in JSON format."
                },
                timeout=30
            )
            response.raise_for_status()
            return response.json()['response']
        except requests.exceptions.RequestException as e:
            raise ConnectionError(f"Failed to connect to Ollama: {str(e)}")

class WillGenerator:
    def __init__(self):
        self.llm = OllamaLLM()
        
    def extract_information(self, user_input: str) -> Dict:
        """Extract required information from user input using Mistral"""
        prompt = f"""
        Extract the following information from the user input to create a will.
        Return only a JSON object with these exact keys (leave empty if information is not provided):

        - testator_name: Full name of person making will
        - testator_father: Father's name
        - age: Testator's age
        - address: Complete address
        - executor_name: Name of executor
        - executor_relation: Relationship to testator
        - spouse_name: Name of spouse
        - num_children: Number of children (as digit)
        - children_names: Array of children's names
        - assets: Array of assets
        - primary_beneficiary: Name of main beneficiary
        - witnesses: Array of two witness names

        User Input: {user_input}

        Respond only with the JSON object, no additional text.
        """
        
        try:
            response = self.llm.generate(prompt)
            # Clean the response to extract only the JSON part
            json_str = re.search(r'\{.*\}', response, re.DOTALL)
            if not json_str:
                raise ValueError("No valid JSON found in response")
            return json.loads(json_str.group())
        except json.JSONDecodeError:
            raise ValueError("Failed to parse LLM response as JSON")

    def generate_will(self, info: Dict) -> str:
        """Generate will content from extracted information"""
        will_template = """WILL

I, {testator_name}, son of {testator_father}, aged {age} years, resident of
{address}, do hereby revoke all my former Wills, Codicils and
Testamentary dispositions made by me. I declare this to be my last Will and Testament.

I maintain good health, and possess a sound mind. This Will is made by me of my own independent
decision and free volition. I have not been influenced, cajoled or coerced in any manner whatsoever.

I hereby appoint my {executor_relation}, {executor_name}, as the sole Executor of this WILL.

The name of my spouse is {spouse_name}. We have {num_children} children namely:
{children_list}

I own the following immovable and movable assets:
{assets_list}

All the assets owned by me are self-acquired properties. No one else has any right, title, interest,
claim or demand whatsoever on these assets or properties. I have full right, absolute power and
complete authority on these assets, or in any other property which may be substituted in their place or
places which may be acquired or received by me hereafter.

I hereby give, devise and bequeath all my properties, whether movable or immovable, whatsoever
and wheresoever to {primary_beneficiary}, absolutely forever.

IN WITNESS WHEREOF I have hereunto set my hands on this {date} at {address}.

TESTATOR: {testator_name}

WITNESSES:
1. {witness1}
2. {witness2}
"""
        # Format children and assets lists
        children_list = "\n".join(f"({i+1}) {name}" for i, name in enumerate(info['children_names']))
        assets_list = "\n".join(f"- {asset}" for asset in info['assets'])
        
        # Prepare witness information
        witness1, witness2 = info['witnesses'][:2] if len(info['witnesses']) >= 2 else ("", "")
        
        # Current date in formal format
        current_date = datetime.now().strftime("%d day of %B, %Y")
        
        # Fill the template
        will_content = will_template.format(
            testator_name=info['testator_name'],
            testator_father=info['testator_father'],
            age=info['age'],
            address=info['address'],
            executor_relation=info['executor_relation'],
            executor_name=info['executor_name'],
            spouse_name=info['spouse_name'],
            num_children=info['num_children'],
            children_list=children_list,
            assets_list=assets_list,
            primary_beneficiary=info['primary_beneficiary'],
            date=current_date,
            witness1=witness1,
            witness2=witness2
        )
        
        return will_content

    def save_as_pdf(self, content: str, output_path: str = "will.pdf"):
        """Save the will as a PDF document"""
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        
        # Add title
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(0, 10, "LAST WILL AND TESTAMENT", ln=True, align='C')
        pdf.ln(10)
        
        # Reset font for main content
        pdf.set_font("Arial", size=12)
        
        # Add content
        for line in content.split('\n'):
            if line.strip():
                pdf.multi_cell(0, 10, line.strip())
        
        # Save PDF
        pdf.output(output_path)
        return output_path

def main():
    # Example usage
    will_gen = WillGenerator()
    
    # Get user input
    user_input = input("Please provide the details for your will: ")
    
    try:
        # Extract information using Mistral
        print("Extracting information...")
        info = will_gen.extract_information(user_input)
        
        # Generate will content
        print("Generating will...")
        will_content = will_gen.generate_will(info)
        
        # Save as PDF
        output_path = "will.pdf"
        print("Creating PDF...")
        will_gen.save_as_pdf(will_content, output_path)
        
        print(f"Will has been generated successfully at: {output_path}")
        
    except Exception as e:
        print(f"Error generating will: {str(e)}")

if __name__ == "__main__":
    main()