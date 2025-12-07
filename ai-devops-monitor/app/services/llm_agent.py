from typing import List, Dict, Any
from langchain_community.llms import Ollama
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import json

class LLMAgent:
    def __init__(self):
        self.llm = None
        self.chain = None
        self._initialize()
    
    def _initialize(self):
        """Initialize Ollama with Mistral model"""
        try:
            self.llm = Ollama(
                model="mistral",
                base_url="http://ollama:11434"
            )
            
            # Create prompt template for RCA
            template = """You are an expert DevOps engineer analyzing system logs for root cause analysis.

Given the following logs:
{logs}

Additional context: {context}

Please provide:
1. A summary of the issue
2. Likely root cause(s)
3. Recommended actions to resolve the issue
4. Preventive measures

Keep your analysis concise and actionable."""

            prompt = PromptTemplate(
                input_variables=["logs", "context"],
                template=template
            )
            
            self.chain = LLMChain(llm=self.llm, prompt=prompt)
        
        except Exception as e:
            print(f"Failed to initialize LLM: {e}")
            self.llm = None
    
    def analyze_logs(self, logs: List[Dict[str, Any]], context: str = "") -> str:
        """
        Perform root cause analysis on logs using LLM
        """
        try:
            # Format logs for LLM
            log_text = self._format_logs(logs)
            
            if self.chain:
                # Use LLM for analysis
                response = self.chain.run(logs=log_text, context=context)
                return response
            else:
                # Fallback: rule-based analysis
                return self._fallback_analysis(logs)
        
        except Exception as e:
            print(f"LLM analysis error: {e}")
            return self._fallback_analysis(logs)
    
    def _format_logs(self, logs: List[Dict[str, Any]]) -> str:
        """Format logs for LLM input"""
        formatted = []
        for i, log in enumerate(logs[:10], 1):  # Limit to 10 logs
            timestamp = log.get("timestamp", "N/A")
            level = log.get("level", "INFO")
            service = log.get("service", "unknown")
            message = log.get("message", "")
            
            formatted.append(
                f"{i}. [{timestamp}] {level} - {service}: {message}"
            )
        
        return "\n".join(formatted)
    
    def _fallback_analysis(self, logs: List[Dict[str, Any]]) -> str:
        """Fallback rule-based analysis when LLM is unavailable"""
        error_logs = [log for log in logs if log.get("level") in ["ERROR", "CRITICAL"]]
        
        if not error_logs:
            return """**Analysis Summary:**
No critical errors detected in the provided logs. System appears to be operating normally.

**Recommended Actions:**
- Continue monitoring for anomalies
- Review warning-level logs if present"""
        
        # Extract common patterns
        error_messages = [log.get("message", "") for log in error_logs]
        services = list(set(log.get("service", "unknown") for log in error_logs))
        
        analysis = f"""**Analysis Summary:**
Detected {len(error_logs)} error/critical log entries across {len(services)} service(s): {', '.join(services)}

**Likely Root Causes:**
- Service failures or exceptions in: {', '.join(services)}
- Potential issues: connectivity problems, resource exhaustion, or configuration errors

**Recommended Actions:**
1. Check service health for: {', '.join(services)}
2. Review error messages for specific failure patterns
3. Verify resource availability (CPU, memory, disk)
4. Check for recent configuration changes

**Preventive Measures:**
- Implement retry mechanisms with exponential backoff
- Add comprehensive error handling
- Set up proactive monitoring and alerting
- Review and optimize resource allocation"""
        
        return analysis

# Singleton instance
llm_agent = LLMAgent()
