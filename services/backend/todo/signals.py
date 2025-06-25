from django.db.models.signals import post_migrate
from django.dispatch import receiver

@receiver(post_migrate)
def create_initial_data(sender, **kwargs):
    if sender.name == 'todo':
        from .models import Priority, Status
        if not Priority.objects.exists():
            Priority.objects.create(name="high", color="#ff0000")
            Priority.objects.create(name="medium", color="#ffa500")
            Priority.objects.create(name="low", color="#00ff00")
        if not Status.objects.exists():
            Status.objects.create(name="новая")
            Status.objects.create(name="в работе")
            Status.objects.create(name="завершена")
