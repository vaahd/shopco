from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer


class RegisterView(generics.CreateAPIView):
    queryset           = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class   = UserSerializer

    def create(self, request, *args, **kwargs):
        email    = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")
        name     = request.data.get("name", "").strip()

        if not email or not password:
            return Response(
                {"error": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "An account with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.create_user(email=email, password=password, name=name)
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """
    Change user password - requires current password verification
    """
    user = request.user
    current_password = request.data.get("current_password", "")
    new_password = request.data.get("new_password", "")
    confirm_password = request.data.get("confirm_password", "")

    # Validation
    if not current_password or not new_password or not confirm_password:
        return Response(
            {"error": "All password fields are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(new_password) < 8:
        return Response(
            {"error": "New password must be at least 8 characters."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if new_password != confirm_password:
        return Response(
            {"error": "New passwords do not match."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verify current password
    if not user.check_password(current_password):
        return Response(
            {"error": "Current password is incorrect."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Set new password
    user.set_password(new_password)
    user.save()

    return Response(
        {"message": "Password changed successfully."},
        status=status.HTTP_200_OK
    )
