from django.contrib import admin
from .models import User, Priority, Status, Category, Task, TaskCategory

class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'due_date', 'status', 'priority', 'deleted')
    def save_model(self, request, obj, form, change):
        if not obj.user:
            anon, _ = User.objects.get_or_create(email="anonymous")
            obj.user = anon
        super().save_model(request, obj, form, change)

# Register your models here.
admin.site.register(User)
admin.site.register(Priority)
admin.site.register(Status)
admin.site.register(Category)
admin.site.register(Task, TaskAdmin)
admin.site.register(TaskCategory)
