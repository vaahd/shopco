from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .views import RegisterView, UserDetailView, change_password


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"  


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


urlpatterns = [
    path("register/", RegisterView.as_view(),            name="register"),
    path("login/",    EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),  # ← custom view
    path("refresh/",  TokenRefreshView.as_view(),         name="token_refresh"),
    path("me/",       UserDetailView.as_view(),           name="user_detail"),
    path("change-password/", change_password,             name="change_password"),
]
