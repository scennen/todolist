from django.contrib import admin
from .models import User, Priority, Status, Category, Task, TaskCategory

# Register your models here.
admin.site.register(User)
admin.site.register(Priority)
admin.site.register(Status)
admin.site.register(Category)
admin.site.register(Task)
admin.site.register(TaskCategory)
