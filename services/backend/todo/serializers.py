from rest_framework import serializers
from .models import Task, Category, Priority, Status
from django.contrib.auth.models import User

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
        extra_kwargs = {
            'deleted': {'required': False},
            'user': {'read_only': True},
        }

    def perform_create(self, serializer):
        User = get_user_model()
        if self.request.user.is_authenticated:
            user = self.request.user
        else:
            user, _ = User.objects.get_or_create(email="anonymous")
        print(f"Назначаю user: {user}")
        serializer.save(user=user)

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class PrioritySerializer(serializers.ModelSerializer):
    class Meta:
        model = Priority
        fields = '__all__'

class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = '__all__'

class FileUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField()
