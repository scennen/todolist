from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager

class UserManager(BaseUserManager):
    def get_by_natural_key(self, username):
        return self.get(username=username)

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

# Пользователь
class User(AbstractUser):
    email = models.EmailField(max_length=100, unique=True)
    password_hash = models.CharField(max_length=255)  # Django сам хэширует
    objects = UserManager()  

    def __str__(self):
        return self.username

# Приоритет задачи
class Priority(models.Model):
    name = models.CharField(max_length=20)
    color = models.CharField(max_length=7)  # HEX цвет, например "#ff0000"

    def __str__(self):
        return str(self.name)

    objects = models.Manager()

# Статус задачи
class Status(models.Model):
    name = models.CharField(max_length=20)

    def __str__(self):
        return str(self.name)

    objects = models.Manager()

# Категория
class Category(models.Model):
    name = models.CharField(max_length=50)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.name)

    objects = models.Manager()

# Задача
class Task(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    due_date = models.DateField()
    status = models.ForeignKey(Status, on_delete=models.CASCADE)
    priority = models.ForeignKey(Priority, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    categories = models.ManyToManyField(Category, through='TaskCategory')
    deleted = models.BooleanField(default=False)

    def __str__(self):
        return str(self.title)

    objects = models.Manager()

# Связь "многие ко многим" между задачами и категориями
class TaskCategory(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    objects = models.Manager()
