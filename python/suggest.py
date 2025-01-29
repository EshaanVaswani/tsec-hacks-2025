from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import uvicorn
import os
from dotenv import load_dotenv
from typing import List, Dict
from dataclasses import dataclass
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# Load environment variables
load_dotenv()
os.environ['GOOGLE_API_KEY'] = os.getenv("GOOGLE_API_KEY")

# Initialize FastAPI app
app = FastAPI(
    title="Legal Case Advisor API",
    description="API for getting legal case-based recommendations using vector similarity search",
    version="1.0.0"
)

# Pydantic models for request/response
class SituationRequest(BaseModel):
    situation_summary: str = Field(
        ..., 
        min_length=10,
        max_length=2000,
        description="Description of the legal situation requiring advice"
    )
    num_cases: Optional[int] = Field(
        default=5,
        ge=1,
        le=10,
        description="Number of similar cases to retrieve"
    )

class CaseReference(BaseModel):
    case_source: str
    category: str
    relevant_text: str

class AdviceResponse(BaseModel):
    success: bool
    analysis: Optional[str]
    cases_referenced: Optional[List[str]]
    disclaimer: str
    error: Optional[str]

# Global advisor instance
legal_advisor = None

class LegalCaseAdvisor:
    def __init__(self, vector_store_path: str):
        """Initialize the advisor with a path to the saved vector store"""
        self.vector_store = FAISS.load_local(
            vector_store_path,
            GoogleGenerativeAIEmbeddings(model="models/embedding-001"),
            allow_dangerous_deserialization=True
        )
        
        self.llm = GoogleGenerativeAI(
            model="gemini-1.5-flash",
            temperature=0.3,
            top_p=0.8,
            top_k=40,
            max_output_tokens=2048
        )
        
        self.analysis_prompt = PromptTemplate(
            input_variables=["situation", "relevant_cases"],
            template="""
            Analyze the following situation and provide actionable steps based on similar cases:

            SITUATION:
            {situation}

            RELEVANT CASES AND PRECEDENTS:
            {relevant_cases}

            Please provide:
            1. A brief analysis of the situation
            2. Specific steps recommended based on similar cases (with case references)
            3. Key considerations and potential challenges
            
            Format the response in a clear, structured way with case citations inline.
            """
        )
        
        self.chain = LLMChain(llm=self.llm, prompt=self.analysis_prompt)

    def get_relevant_cases(self, query: str, num_cases: int = 5) -> List[CaseReference]:
        results = self.vector_store.similarity_search(query, k=num_cases)
        cases = []
        for doc in results:
            case = CaseReference(
                case_source=doc.metadata['source'],
                category=doc.metadata['category'],
                relevant_text=doc.page_content
            )
            cases.append(case)
        return cases

    def format_cases_for_prompt(self, cases: List[CaseReference]) -> str:
        formatted_cases = []
        for i, case in enumerate(cases, 1):
            formatted_case = f"""
            Case {i} [Ref: {case.case_source}] ({case.category}):
            {case.relevant_text}
            """
            formatted_cases.append(formatted_case)
        return "\n".join(formatted_cases)

    def get_advice(self, situation_summary: str, num_cases: int = 5) -> Dict:
        try:
            relevant_cases = self.get_relevant_cases(situation_summary, num_cases)
            formatted_cases = self.format_cases_for_prompt(relevant_cases)
            
            response = self.chain.run({
                "situation": situation_summary,
                "relevant_cases": formatted_cases
            })
            
            disclaimer = """
            IMPORTANT DISCLAIMER:
            This analysis is provided for informational purposes only and should not be considered as legal advice. 
            The recommendations are based on similar historical cases but may not fully apply to your specific situation. 
            Please consult with qualified legal professionals before taking any action. 
            The accuracy of case references and citations should be independently verified.
            """
            
            return {
                "success": True,
                "analysis": response,
                "cases_referenced": [case.case_source for case in relevant_cases],
                "disclaimer": disclaimer,
                "error": None
            }
            
        except Exception as e:
            return {
                "success": False,
                "analysis": None,
                "cases_referenced": None,
                "disclaimer": "An error occurred while generating advice. Please try again.",
                "error": str(e)
            }

# Startup event to initialize the advisor
@app.on_event("startup")
async def startup_event():
    global legal_advisor
    try:
        legal_advisor = LegalCaseAdvisor("faiss_index")
    except Exception as e:
        print(f"Failed to initialize legal advisor: {str(e)}")
        raise

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "vector_store": legal_advisor is not None}

# Main advice endpoint
@app.post("/advice", response_model=AdviceResponse)
async def get_advice(request: SituationRequest):
    if legal_advisor is None:
        raise HTTPException(status_code=503, detail="Legal advisor not initialized")
    
    try:
        result = legal_advisor.get_advice(
            request.situation_summary,
            request.num_cases
        )
        return AdviceResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "suggest:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )