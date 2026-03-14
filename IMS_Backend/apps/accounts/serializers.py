"""
Accounts serializers – Registration, Login, OTP, User management.
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import OTPToken

User = get_user_model()


# ---------------------------------------------------------------------------
# JWT Token Serializer (custom claims)
# ---------------------------------------------------------------------------
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Add role and full name to JWT claims and login response body."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["full_name"] = user.get_full_name()
        token["email"] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Include user info in the login response body
        data["user"] = {
            "id": self.user.id,
            "email": self.user.email,
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
            "full_name": self.user.get_full_name(),
            "role": self.user.role,
            "phone": self.user.phone,
            "is_active": self.user.is_active,
        }
        return data


# ---------------------------------------------------------------------------
# User Serializers
# ---------------------------------------------------------------------------
class UserRegistrationSerializer(serializers.ModelSerializer):
    """Register a new user."""

    password = serializers.CharField(
        write_only=True, validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "phone",
            "role",
            "password",
            "password_confirm",
        ]
        read_only_fields = ["id"]
        extra_kwargs = {
            "first_name": {"required": True},
            "last_name": {"required": True},
        }

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class AdminCreateUserSerializer(serializers.ModelSerializer):
    """Admin creates a user with explicit role assignment."""

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "phone",
            "role",
            "password",
            "password_confirm",
        ]
        read_only_fields = ["id"]
        extra_kwargs = {
            "first_name": {"required": True},
            "last_name": {"required": True},
            "role": {"required": True},
        }

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        # Auto-generate username from email if not provided
        if not attrs.get("username"):
            attrs["username"] = attrs["email"].split("@")[0]
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    """General user representation."""

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "full_name",
            "phone",
            "role",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_full_name(self, obj):
        return obj.get_full_name()


class UserUpdateSerializer(serializers.ModelSerializer):
    """Update user profile."""

    class Meta:
        model = User
        fields = ["first_name", "last_name", "phone"]


class ChangePasswordSerializer(serializers.Serializer):
    """Change password for authenticated users."""

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True, validators=[validate_password]
    )

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


# ---------------------------------------------------------------------------
# OTP Serializers
# ---------------------------------------------------------------------------
class OTPRequestSerializer(serializers.Serializer):
    """Request an OTP for password reset."""

    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user with this email address.")
        return value


class OTPVerifySerializer(serializers.Serializer):
    """Verify OTP and reset password."""

    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(validators=[validate_password])

    def validate(self, attrs):
        try:
            user = User.objects.get(email=attrs["email"])
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "User not found."})

        otp_token = (
            OTPToken.objects.filter(user=user, otp=attrs["otp"], is_used=False)
            .order_by("-created_at")
            .first()
        )

        if not otp_token:
            raise serializers.ValidationError({"otp": "Invalid OTP."})
        if not otp_token.is_valid:
            raise serializers.ValidationError({"otp": "OTP has expired."})

        attrs["user"] = user
        attrs["otp_token"] = otp_token
        return attrs
