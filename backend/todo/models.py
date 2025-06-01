from django.db import models
from django.contrib.auth.models import AbstractUser

# Пользователь
class User(AbstractUser):
    email = models.EmailField(max_length=100, unique=True)
    password_hash = models.CharField(max_length=255)  # Django сам хэширует

# Приоритет задачи
class Priority(models.Model):
    name = models.CharField(max_length=20)
    color = models.CharField(max_length=7)  # HEX цвет, например "#ff0000"

    def __str__(self):
        return self.name

# Статус задачи
class Status(models.Model):
    name = models.CharField(max_length=20)

    def __str__(self):
        return self.name

# Категория
class Category(models.Model):
    name = models.CharField(max_length=50)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

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

    def __str__(self):
        return self.title

# Связь "многие ко многим" между задачами и категориями
class TaskCategory(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
