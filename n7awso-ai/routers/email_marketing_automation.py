# email_marketing_automation.py
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
import json
from datetime import datetime, timedelta
import google.generativeai as genai
from generated.prisma import Prisma
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import asyncio

# Initialize router
router = APIRouter(prefix="/automation", tags=["automation"])

# Initialize Prisma client (you should use your existing instance)
prisma = Prisma()

# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY", "AIzaSyAgcKY7-U1si2sQ9YeMHdE1bM4Jx6jMbUg"))
model = genai.GenerativeModel('gemini-1.5-flash')

# Email configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "your-email@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "your-app-password")

# Pydantic Models
class UserPreferencesCreate(BaseModel):
    userId: int
    budgetRange: Optional[str] = None
    preferredTripTypes: List[str] = []
    preferredCategories: List[str] = []
    preferredDestinations: List[str] = []
    travelStyle: Optional[str] = None
    groupSize: Optional[str] = None
    preferredDuration: Optional[str] = None
    accessibility: List[str] = []
    dietaryRestrictions: List[str] = []

class UserPreferencesUpdate(BaseModel):
    budgetRange: Optional[str] = None
    preferredTripTypes: Optional[List[str]] = None
    preferredCategories: Optional[List[str]] = None
    preferredDestinations: Optional[List[str]] = None
    travelStyle: Optional[str] = None
    groupSize: Optional[str] = None
    preferredDuration: Optional[str] = None
    accessibility: Optional[List[str]] = None
    dietaryRestrictions: Optional[List[str]] = None

class EmailCampaignCreate(BaseModel):
    name: str
    subject: str
    content: str
    htmlContent: Optional[str] = None
    targetAudience: Optional[Dict[str, Any]] = None
    scheduledAt: Optional[datetime] = None

class EmailCampaignUpdate(BaseModel):
    name: Optional[str] = None
    subject: Optional[str] = None
    content: Optional[str] = None
    htmlContent: Optional[str] = None
    targetAudience: Optional[Dict[str, Any]] = None
    scheduledAt: Optional[datetime] = None
    status: Optional[str] = None

class EmailTemplateCreate(BaseModel):
    name: str
    subject: str
    content: str
    htmlContent: Optional[str] = None
    type: str
    variables: List[str] = []

class AutomationRuleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    triggerType: str
    conditions: Dict[str, Any]
    actions: Dict[str, Any]

class AIContentGenerate(BaseModel):
    tourId: int
    customPrompt: Optional[str] = None

# Email Utility Functions
def send_email(to_email: str, subject: str, content: str, html_content: str = None):
    """Send email using SMTP"""
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = SMTP_USERNAME
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add text content
        text_part = MIMEText(content, 'plain', 'utf-8')
        msg.attach(text_part)
        
        # Add HTML content if provided
        if html_content:
            html_part = MIMEText(html_content, 'html', 'utf-8')
            msg.attach(html_part)
        
        # Send email
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Email sending failed: {str(e)}")
        return False

async def process_email_campaign_send(campaign_id: int, user_id: int):
    """Process individual email send for a campaign"""
    try:
        # Get campaign and user data
        campaign = await prisma.emailcampaign.find_unique(where={"id": campaign_id})
        user = await prisma.user.find_unique(where={"id": user_id})
        
        if not campaign or not user or not user.emailSubscribed:
            return
        
        # Get or create campaign send record
        send_record = await prisma.emailcampaignsend.upsert(
            where={"campaignId_userId": {"campaignId": campaign_id, "userId": user_id}},
            data={"status": "SENT", "sentAt": datetime.now()},
            create={
                "campaignId": campaign_id,
                "userId": user_id,
                "status": "PENDING"
            }
        )
        
        # Personalize content
        personalized_content = campaign.content.replace("{{username}}", user.username)
        personalized_html = campaign.htmlContent.replace("{{username}}", user.username) if campaign.htmlContent else None
        
        # Send email
        success = send_email(
            user.email,
            campaign.subject,
            personalized_content,
            personalized_html
        )
        
        # Update send record
        if success:
            await prisma.emailcampaignsend.update(
                where={"id": send_record.id},
                data={"status": "SENT", "sentAt": datetime.now()}
            )
            
            # Update user last email sent
            await prisma.user.update(
                where={"id": user_id},
                data={"lastEmailSent": datetime.now()}
            )
        else:
            await prisma.emailcampaignsend.update(
                where={"id": send_record.id},
                data={"status": "FAILED", "errorMessage": "SMTP send failed"}
            )
            
    except Exception as e:
        print(f"Error processing email send: {str(e)}")

# EMAIL MARKETING ROUTES

@router.post("/email-campaigns")
async def create_email_campaign(campaign: EmailCampaignCreate):
    """Create a new email campaign"""
    try:
        result = await prisma.emailcampaign.create(data=campaign.dict())
        return {"status": "success", "message": "Campaign created", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating campaign: {str(e)}")

@router.get("/email-campaigns")
async def get_email_campaigns(status: Optional[str] = None, limit: int = 20):
    """Get all email campaigns"""
    try:
        where_clause = {"status": status} if status else {}
        campaigns = await prisma.emailcampaign.find_many(
            where=where_clause,
            order_by={"createdAt": "desc"},
            take=limit
        )
        return {"status": "success", "data": campaigns, "count": len(campaigns)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching campaigns: {str(e)}")

@router.get("/email-campaigns/{campaign_id}")
async def get_email_campaign(campaign_id: int):
    """Get a specific email campaign with statistics"""
    try:
        campaign = await prisma.emailcampaign.find_unique(
            where={"id": campaign_id},
            include={"sends": {"include": {"user": True}}}
        )
        
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        return {"status": "success", "data": campaign}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching campaign: {str(e)}")

@router.put("/email-campaigns/{campaign_id}")
async def update_email_campaign(campaign_id: int, campaign: EmailCampaignUpdate):
    """Update an email campaign"""
    try:
        update_data = {k: v for k, v in campaign.dict().items() if v is not None}
        result = await prisma.emailcampaign.update(
            where={"id": campaign_id},
            data=update_data
        )
        return {"status": "success", "message": "Campaign updated", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating campaign: {str(e)}")

@router.delete("/email-campaigns/{campaign_id}")
async def delete_email_campaign(campaign_id: int):
    """Delete an email campaign"""
    try:
        await prisma.emailcampaign.delete(where={"id": campaign_id})
        return {"status": "success", "message": "Campaign deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting campaign: {str(e)}")

@router.post("/email-campaigns/{campaign_id}/send")
async def send_email_campaign(campaign_id: int, background_tasks: BackgroundTasks):
    """Send an email campaign"""
    try:
        campaign = await prisma.emailcampaign.find_unique(where={"id": campaign_id})
        
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        if campaign.status != "DRAFT":
            raise HTTPException(status_code=400, detail="Campaign already sent or in progress")
        
        # Update campaign status
        await prisma.emailcampaign.update(
            where={"id": campaign_id},
            data={"status": "SENDING", "sentAt": datetime.now()}
        )
        
        # Get target users based on criteria
        target_users = []
        
        if campaign.targetAudience:
            # Apply targeting filters
            where_conditions = {"emailSubscribed": True}
            
            if "role" in campaign.targetAudience:
                where_conditions["role"] = campaign.targetAudience["role"]
            
            if "minInteraction" in campaign.targetAudience:
                # Users with minimum interaction count
                target_users = await prisma.user.find_many(
                    where={
                        **where_conditions,
                        "History": {
                            "some": {
                                "interaction": {"gte": campaign.targetAudience["minInteraction"]}
                            }
                        }
                    }
                )
            else:
                target_users = await prisma.user.find_many(where=where_conditions)
        else:
            # Send to all subscribed users
            target_users = await prisma.user.find_many(
                where={"emailSubscribed": True}
            )
        
        # Update campaign recipient count
        await prisma.emailcampaign.update(
            where={"id": campaign_id},
            data={"totalRecipients": len(target_users)}
        )
        
        # Queue email sends in background
        for user in target_users:
            background_tasks.add_task(process_email_campaign_send, campaign_id, user.id)
        
        return {
            "status": "success",
            "message": f"Campaign queued for {len(target_users)} recipients",
            "recipients": len(target_users)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        # Reset campaign status on error
        try:
            await prisma.emailcampaign.update(
                where={"id": campaign_id},
                data={"status": "DRAFT"}
            )
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Error sending campaign: {str(e)}")

@router.get("/email-campaigns/{campaign_id}/stats")
async def get_campaign_stats(campaign_id: int):
    """Get detailed statistics for an email campaign"""
    try:
        campaign = await prisma.emailcampaign.find_unique(where={"id": campaign_id})
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Get send statistics
        sends = await prisma.emailcampaignsend.find_many(
            where={"campaignId": campaign_id}
        )
        
        stats = {
            "total_recipients": len(sends),
            "sent": len([s for s in sends if s.status == "SENT"]),
            "delivered": len([s for s in sends if s.deliveredAt]),
            "opened": len([s for s in sends if s.openedAt]),
            "clicked": len([s for s in sends if s.clickedAt]),
            "unsubscribed": len([s for s in sends if s.unsubscribedAt]),
            "failed": len([s for s in sends if s.status == "FAILED"]),
            "pending": len([s for s in sends if s.status == "PENDING"])
        }
        
        # Calculate rates
        if stats["sent"] > 0:
            stats["delivery_rate"] = round((stats["delivered"] / stats["sent"]) * 100, 2)
            stats["open_rate"] = round((stats["opened"] / stats["sent"]) * 100, 2)
            stats["click_rate"] = round((stats["clicked"] / stats["sent"]) * 100, 2)
        else:
            stats["delivery_rate"] = stats["open_rate"] = stats["click_rate"] = 0
        
        return {"status": "success", "data": stats}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

# EMAIL TEMPLATES
@router.post("/email-templates")
async def create_email_template(template: EmailTemplateCreate):
    """Create a new email template"""
    try:
        result = await prisma.emailtemplate.create(data=template.dict())
        return {"status": "success", "message": "Template created", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating template: {str(e)}")

@router.get("/email-templates")
async def get_email_templates(type: Optional[str] = None, active_only: bool = True):
    """Get all email templates"""
    try:
        where_clause = {}
        if type:
            where_clause["type"] = type
        if active_only:
            where_clause["isActive"] = True
            
        templates = await prisma.emailtemplate.find_many(
            where=where_clause,
            order_by={"createdAt": "desc"}
        )
        return {"status": "success", "data": templates, "count": len(templates)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching templates: {str(e)}")

@router.get("/email-templates/{template_id}")
async def get_email_template(template_id: int):
    """Get a specific email template"""
    try:
        template = await prisma.emailtemplate.find_unique(where={"id": template_id})
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        return {"status": "success", "data": template}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching template: {str(e)}")

# USER SUBSCRIPTION MANAGEMENT
@router.post("/users/{user_id}/subscribe")
async def subscribe_user(user_id: int):
    """Subscribe a user to email marketing"""
    try:
        user = await prisma.user.update(
            where={"id": user_id},
            data={"emailSubscribed": True, "unsubscribedAt": None}
        )
        return {"status": "success", "message": "User subscribed", "data": {"subscribed": True}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error subscribing user: {str(e)}")

@router.post("/users/{user_id}/unsubscribe")
async def unsubscribe_user(user_id: int):
    """Unsubscribe a user from email marketing"""
    try:
        user = await prisma.user.update(
            where={"id": user_id},
            data={"emailSubscribed": False, "unsubscribedAt": datetime.now()}
        )
        return {"status": "success", "message": "User unsubscribed", "data": {"subscribed": False}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error unsubscribing user: {str(e)}")