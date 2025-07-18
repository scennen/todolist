"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from todo.views import TaskViewSet, CategoryViewSet, PriorityViewSet, StatusViewSet, RegisterView, CurrentUserView, LoginView
from django.views.generic import TemplateView
from todo.views import MistralView
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse

router = routers.DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'priorities', PriorityViewSet)
router.register(r'statuses', StatusViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/user/', CurrentUserView.as_view(), name='current-user'),
    path('', TemplateView.as_view(template_name='index.html'), name='react-app'),
    path("api/mistral/", MistralView.as_view(), name="mistral"),
    path('api/csrf/', ensure_csrf_cookie(lambda request: JsonResponse({'detail': 'CSRF cookie set'}))),
]
