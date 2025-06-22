from rest_framework import serializers
from .models import Task, Category, Priority, Status, User
from django.contrib.auth import get_user_model

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    username = serializers.CharField(required=False)
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            username=validated_data.get('username', validated_data['email'])
        )
        return user

class TaskSerializer(serializers.ModelSerializer):
    def validate_due_date(self, value):
        from datetime import date
        today = date.today()
        # Не допускаем даты до сегодняшнего дня
        if value < today:
            raise serializers.ValidationError("Дата не может быть раньше сегодняшнего дня.")
        # Не допускаем год больше 2100 или больше 4 цифр
        if value.year > 2100 or value.year > 9999:
            raise serializers.ValidationError("Год не может быть больше 2100 и должен быть не более 4 цифр.")
        return value

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
