from typing import Literal, Optional
from pydantic import BaseModel, Field


UserAccountStatusType = Literal['active', 'deleted', 'suspended']

UserAccountType = Literal['free', 'pro', 'superPro']

SocialSigninType = Literal['google', 'microsoft']


class UserSsoConfigType(BaseModel):
    id: str
    access_token: str
    refresh_token: str
    id_token: str
    created: int
    name: str
    email: str
    provider: Literal['google', 'linkedin']


PaymentFrequencyType = Literal['monthly', 'yearly']


class UserPlanType(BaseModel):
    planName: UserAccountType
    startDate: int
    endDate: int
    id: str
    orderId: Optional[str] = None
    subscriptionId: Optional[str] = None
    subscriptionInterval: Optional[PaymentFrequencyType] = None


class UserBalanceType(BaseModel):
    wallet: int
    extraMission: int = Field(alias="extraMission") 
    extraMissionRuns: int = Field(alias="extraMissionRuns")


class UserFileType(BaseModel):
    id: str
    fileName: str
    originalFileName: str
    url: str
    uploadTime: int
    metadata: Optional[dict] = None


class PasswordSigninUserType(BaseModel):
    password: str
    socialSignin: None


class SocialSigninUserType(BaseModel):
    password: None
    socialSignin: SocialSigninType


class UserType(BaseModel):
    id: str
    email: str
    username: str
    firstName: str
    lastName: str
    image: str
    isAdmin: bool
    creationTime: int
    verificationCode: Optional[str] = None
    verificationCodeExpiry: Optional[int] = None
    accountStatus: UserAccountStatusType
    ssoConfig: list[UserSsoConfigType]
    plan: list[UserPlanType]
    balance: UserBalanceType
    files: list[UserFileType]
    refreshToken: str
    password: Optional[str] = None
    socialSignin: Optional[SocialSigninType] = None


class GetUserArgs(BaseModel):
    id: Optional[str] = None
    email: Optional[str] = None
    username: Optional[str] = None
    refresh_token: Optional[str] = None


class GetUserFileDetailsArgs(BaseModel):
    user_id: str
    file_name: str
