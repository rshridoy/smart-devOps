import streamlit as st
import requests
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import json

# Configuration
BACKEND_URL = "http://backend:8000"

st.set_page_config(
    page_title="AI DevOps Monitor",
    page_icon="🔍",
    layout="wide"
)

# Custom CSS
st.markdown("""
<style>
    .stAlert {
        padding: 1rem;
        margin: 1rem 0;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 0.5rem 0;
    }
</style>
""", unsafe_allow_html=True)

def get_logs(limit=100):
    """Fetch logs from backend"""
    try:
        response = requests.get(f"{BACKEND_URL}/logs/", params={"limit": limit})
        if response.status_code == 200:
            return response.json().get("logs", [])
        return []
    except Exception as e:
        st.error(f"Failed to fetch logs: {e}")
        return []

def get_anomalies():
    """Fetch detected anomalies"""
    try:
        response = requests.get(f"{BACKEND_URL}/analysis/anomalies")
        if response.status_code == 200:
            return response.json()
        return {"anomalies": []}
    except Exception as e:
        st.error(f"Failed to fetch anomalies: {e}")
        return {"anomalies": []}

def get_prediction(service=None):
    """Fetch failure prediction"""
    try:
        params = {"service": service} if service else {}
        response = requests.get(f"{BACKEND_URL}/analysis/predict", params=params)
        if response.status_code == 200:
            return response.json()
        return None
    except Exception as e:
        st.error(f"Failed to fetch prediction: {e}")
        return None

def perform_rca(log_ids, context=""):
    """Perform root cause analysis"""
    try:
        response = requests.post(
            f"{BACKEND_URL}/analysis/rca",
            json={"log_ids": log_ids, "context": context}
        )
        if response.status_code == 200:
            return response.json().get("analysis")
        return "Analysis failed"
    except Exception as e:
        st.error(f"Failed to perform RCA: {e}")
        return None

def send_test_alert():
    """Send test alert"""
    try:
        response = requests.post(f"{BACKEND_URL}/alerts/test")
        if response.status_code == 200:
            return response.json()
        return None
    except Exception as e:
        st.error(f"Failed to send alert: {e}")
        return None

# Main Dashboard
st.title("🔍 AI DevOps Monitor")
st.markdown("Real-time monitoring with AI-powered anomaly detection and root cause analysis")

# Sidebar
with st.sidebar:
    st.header("⚙️ Controls")
    
    # Refresh button
    if st.button("🔄 Refresh Data", use_container_width=True):
        st.rerun()
    
    st.divider()
    
    # Filters
    st.subheader("Filters")
    log_limit = st.slider("Number of logs", 50, 500, 100)
    level_filter = st.selectbox("Log Level", ["All", "DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"])
    
    st.divider()
    
    # Test alert
    st.subheader("Test Alert")
    if st.button("📢 Send Test Alert", use_container_width=True):
        result = send_test_alert()
        if result:
            st.success("Test alert sent!")

# Main content
tab1, tab2, tab3, tab4 = st.tabs(["📊 Overview", "⚠️ Anomalies", "🔮 Predictions", "🤖 AI Analysis"])

with tab1:
    st.header("System Overview")
    
    # Fetch logs
    logs = get_logs(limit=log_limit)
    
    if logs:
        # Metrics
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Total Logs", len(logs))
        
        with col2:
            error_count = sum(1 for log in logs if log.get("level") in ["ERROR", "CRITICAL"])
            st.metric("Errors", error_count, delta=f"{(error_count/len(logs)*100):.1f}%")
        
        with col3:
            warning_count = sum(1 for log in logs if log.get("level") == "WARNING")
            st.metric("Warnings", warning_count)
        
        with col4:
            services = len(set(log.get("service", "unknown") for log in logs))
            st.metric("Services", services)
        
        # Log level distribution
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Log Level Distribution")
            level_counts = {}
            for log in logs:
                level = log.get("level", "INFO")
                level_counts[level] = level_counts.get(level, 0) + 1
            
            df_levels = pd.DataFrame(list(level_counts.items()), columns=["Level", "Count"])
            fig = px.pie(df_levels, values="Count", names="Level", 
                        color="Level",
                        color_discrete_map={
                            "DEBUG": "lightblue",
                            "INFO": "green",
                            "WARNING": "orange",
                            "ERROR": "red",
                            "CRITICAL": "darkred"
                        })
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            st.subheader("Logs by Service")
            service_counts = {}
            for log in logs:
                service = log.get("service", "unknown")
                service_counts[service] = service_counts.get(service, 0) + 1
            
            df_services = pd.DataFrame(list(service_counts.items()), columns=["Service", "Count"])
            df_services = df_services.sort_values("Count", ascending=True)
            fig = px.bar(df_services, x="Count", y="Service", orientation="h")
            st.plotly_chart(fig, use_container_width=True)
        
        # Recent logs table
        st.subheader("Recent Logs")
        df_logs = pd.DataFrame(logs)
        
        # Filter by level if needed
        if level_filter != "All":
            df_logs = df_logs[df_logs["level"] == level_filter]
        
        # Display table
        display_cols = ["timestamp", "level", "service", "message"]
        available_cols = [col for col in display_cols if col in df_logs.columns]
        st.dataframe(df_logs[available_cols].head(50), use_container_width=True)
    else:
        st.info("No logs available. Start ingesting logs to see data.")

with tab2:
    st.header("Anomaly Detection")
    
    anomaly_data = get_anomalies()
    anomalies = anomaly_data.get("anomalies", [])
    
    if anomalies:
        st.warning(f"⚠️ Detected {len(anomalies)} anomalies")
        
        # Anomaly score distribution
        scores = [a["anomaly_score"] for a in anomalies]
        fig = go.Figure(data=[go.Histogram(x=scores, nbinsx=20)])
        fig.update_layout(title="Anomaly Score Distribution", xaxis_title="Score", yaxis_title="Count")
        st.plotly_chart(fig, use_container_width=True)
        
        # Anomalies table
        st.subheader("Detected Anomalies")
        for i, anomaly in enumerate(anomalies[:20], 1):
            log = anomaly.get("log", {})
            score = anomaly.get("anomaly_score", 0)
            
            with st.expander(f"Anomaly {i} - Score: {score:.2f} - {log.get('service', 'N/A')}"):
                st.write(f"**Timestamp:** {log.get('timestamp', 'N/A')}")
                st.write(f"**Level:** {log.get('level', 'N/A')}")
                st.write(f"**Service:** {log.get('service', 'N/A')}")
                st.write(f"**Message:** {log.get('message', 'N/A')}")
                st.write(f"**Anomaly Score:** {score:.3f}")
    else:
        st.success("✅ No anomalies detected")

with tab3:
    st.header("Failure Prediction")
    
    # Service selector
    logs = get_logs(limit=100)
    services = list(set(log.get("service", "unknown") for log in logs))
    
    selected_service = st.selectbox("Select Service", ["All"] + services)
    service_param = None if selected_service == "All" else selected_service
    
    if st.button("🔮 Run Prediction"):
        prediction = get_prediction(service=service_param)
        
        if prediction:
            pred_status = prediction.get("prediction", "unknown")
            probability = prediction.get("probability", 0)
            confidence = prediction.get("confidence", 0)
            
            # Display metrics
            col1, col2, col3 = st.columns(3)
            
            with col1:
                color = "normal"
                if pred_status == "high_risk":
                    color = "inverse"
                elif pred_status == "medium_risk":
                    color = "off"
                
                st.metric("Risk Level", pred_status.replace("_", " ").title())
            
            with col2:
                st.metric("Failure Probability", f"{probability*100:.1f}%")
            
            with col3:
                st.metric("Confidence", f"{confidence*100:.1f}%")
            
            # Risk gauge
            fig = go.Figure(go.Indicator(
                mode="gauge+number",
                value=probability*100,
                domain={'x': [0, 1], 'y': [0, 1]},
                title={'text': "Failure Risk"},
                gauge={
                    'axis': {'range': [None, 100]},
                    'bar': {'color': "darkblue"},
                    'steps': [
                        {'range': [0, 40], 'color': "lightgreen"},
                        {'range': [40, 70], 'color': "yellow"},
                        {'range': [70, 100], 'color': "red"}
                    ],
                    'threshold': {
                        'line': {'color': "red", 'width': 4},
                        'thickness': 0.75,
                        'value': 70
                    }
                }
            ))
            st.plotly_chart(fig, use_container_width=True)
            
            # Feature details
            if "features" in prediction:
                st.subheader("Prediction Features")
                features = prediction["features"]
                st.json(features)

with tab4:
    st.header("AI Root Cause Analysis")
    
    st.markdown("Select logs to analyze for root cause using AI")
    
    logs = get_logs(limit=50)
    
    if logs:
        # Filter for errors
        error_logs = [log for log in logs if log.get("level") in ["ERROR", "CRITICAL"]]
        
        if error_logs:
            st.info(f"Found {len(error_logs)} error/critical logs")
            
            # Select logs for analysis
            selected_indices = st.multiselect(
                "Select logs to analyze (max 10)",
                range(min(len(error_logs), 20)),
                format_func=lambda i: f"{error_logs[i].get('timestamp', 'N/A')} - {error_logs[i].get('service', 'N/A')}: {error_logs[i].get('message', '')[:100]}..."
            )
            
            context = st.text_area("Additional Context (optional)", 
                                  placeholder="e.g., recent deployments, configuration changes...")
            
            if st.button("🤖 Analyze with AI") and selected_indices:
                with st.spinner("Analyzing logs..."):
                    log_ids = [error_logs[i].get("_id") for i in selected_indices if error_logs[i].get("_id")]
                    
                    if log_ids:
                        analysis = perform_rca(log_ids, context)
                        
                        if analysis:
                            st.subheader("AI Analysis Results")
                            st.markdown(analysis)
                        else:
                            st.error("Analysis failed")
                    else:
                        st.warning("Selected logs don't have IDs")
        else:
            st.info("No error logs found for analysis")
    else:
        st.info("No logs available for analysis")

# Footer
st.divider()
st.markdown("**AI DevOps Monitor** - Powered by FastAPI, OpenSearch, and Mistral AI")
