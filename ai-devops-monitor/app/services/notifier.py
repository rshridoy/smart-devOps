import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any
from app.utils.config import settings

class Notifier:
    def __init__(self):
        self.slack_webhook = settings.SLACK_WEBHOOK_URL
        self.smtp_config = {
            "host": settings.SMTP_HOST,
            "port": settings.SMTP_PORT,
            "username": settings.SMTP_USERNAME,
            "password": settings.SMTP_PASSWORD,
            "from_email": settings.SMTP_FROM_EMAIL,
            "to_emails": settings.get_email_recipients()
        }
    
    def send_alert(self, alert: Dict[str, Any]) -> Dict[str, bool]:
        """
        Send alert via configured channels
        Returns status for each channel
        """
        results = {
            "slack": False,
            "email": False
        }
        
        # Send to Slack
        if self.slack_webhook:
            results["slack"] = self._send_slack(alert)
        
        # Send via Email
        if self.smtp_config["host"] and self.smtp_config["to_emails"]:
            results["email"] = self._send_email(alert)
        
        return results
    
    def _send_slack(self, alert: Dict[str, Any]) -> bool:
        """Send alert to Slack via webhook"""
        try:
            # Color code by severity
            color_map = {
                "info": "#36a64f",
                "warning": "#ff9900",
                "critical": "#ff0000"
            }
            color = color_map.get(alert.get("severity", "info"), "#36a64f")
            
            payload = {
                "attachments": [{
                    "color": color,
                    "title": alert.get("title", "DevOps Alert"),
                    "text": alert.get("message", ""),
                    "fields": [
                        {
                            "title": "Severity",
                            "value": alert.get("severity", "info").upper(),
                            "short": True
                        }
                    ],
                    "footer": "AI DevOps Monitor",
                    "ts": int(alert.get("timestamp", 0)) if "timestamp" in alert else None
                }]
            }
            
            if alert.get("service"):
                payload["attachments"][0]["fields"].append({
                    "title": "Service",
                    "value": alert["service"],
                    "short": True
                })
            
            response = requests.post(
                self.slack_webhook,
                json=payload,
                timeout=10
            )
            
            return response.status_code == 200
        
        except Exception as e:
            print(f"Failed to send Slack alert: {e}")
            return False
    
    def _send_email(self, alert: Dict[str, Any]) -> bool:
        """Send alert via email"""
        try:
            # Create message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"[{alert.get('severity', 'INFO').upper()}] {alert.get('title', 'DevOps Alert')}"
            msg["From"] = self.smtp_config["from_email"]
            msg["To"] = ", ".join(self.smtp_config["to_emails"])
            
            # HTML body
            html = f"""
            <html>
              <body>
                <h2>{alert.get('title', 'DevOps Alert')}</h2>
                <p><strong>Severity:</strong> {alert.get('severity', 'info').upper()}</p>
                {f"<p><strong>Service:</strong> {alert['service']}</p>" if alert.get('service') else ""}
                <p><strong>Message:</strong></p>
                <p>{alert.get('message', '')}</p>
                <hr>
                <p><em>Sent by AI DevOps Monitor</em></p>
              </body>
            </html>
            """
            
            msg.attach(MIMEText(html, "html"))
            
            # Send email
            with smtplib.SMTP(self.smtp_config["host"], self.smtp_config["port"]) as server:
                if self.smtp_config["username"] and self.smtp_config["password"]:
                    server.starttls()
                    server.login(
                        self.smtp_config["username"],
                        self.smtp_config["password"]
                    )
                
                server.send_message(msg)
            
            return True
        
        except Exception as e:
            print(f"Failed to send email alert: {e}")
            return False

# Singleton instance
notifier = Notifier()
